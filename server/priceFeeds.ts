import { Server as SocketIOServer } from 'socket.io';
import { ExchangeClient, PriceData } from './exchanges';

export interface PriceFeedConfig {
  symbols: string[];
  interval: number; // milliseconds
  exchanges: Array<{
    name: 'binance' | 'okx' | 'bybit';
    apiKey: string;
    apiSecret: string;
    passphrase?: string;
  }>;
}

class PriceFeedService {
  private io: SocketIOServer;
  private clients: Map<string, ExchangeClient> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private lastPrices: Map<string, PriceData> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  async initialize(config: PriceFeedConfig): Promise<void> {
    // Initialize exchange clients
    for (const exchange of config.exchanges) {
      try {
        const client = new ExchangeClient(exchange.name, {
          apiKey: exchange.apiKey,
          apiSecret: exchange.apiSecret,
          passphrase: exchange.passphrase,
        });
        this.clients.set(exchange.name, client);
        console.log(`[PriceFeed] Initialized ${exchange.name} client`);
      } catch (error) {
        console.error(`[PriceFeed] Failed to initialize ${exchange.name}:`, error);
      }
    }

    // Start price feed for each exchange
    for (const [exchangeName, client] of this.clients) {
      this.startPriceFeed(exchangeName, client, config.symbols, config.interval);
    }
  }

  private startPriceFeed(
    exchangeName: string,
    client: ExchangeClient,
    symbols: string[],
    interval: number
  ): void {
    const intervalId = setInterval(async () => {
      try {
        const prices = await client.getPrices(symbols);
        
        for (const price of prices) {
          this.lastPrices.set(`${exchangeName}:${price.symbol}`, price);
          
          // Broadcast to all connected clients
          this.io.emit('price_update', {
            exchange: exchangeName,
            ...price,
          });
        }
      } catch (error) {
        console.error(`[PriceFeed] Error fetching prices from ${exchangeName}:`, error);
      }
    }, interval);

    this.intervals.set(exchangeName, intervalId);
  }

  getLastPrice(exchange: string, symbol: string): PriceData | undefined {
    return this.lastPrices.get(`${exchange}:${symbol}`);
  }

  getAllLastPrices(): Map<string, PriceData> {
    return this.lastPrices;
  }

  stop(): void {
    for (const [, intervalId] of this.intervals) {
      clearInterval(intervalId);
    }
    this.intervals.clear();
  }
}

export { PriceFeedService };
