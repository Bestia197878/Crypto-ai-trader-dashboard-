import ccxt from 'ccxt';

export interface ExchangeConfig {
  apiKey: string;
  apiSecret: string;
  passphrase?: string; // For OKX
}

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
  bid: number;
  ask: number;
}

export interface OrderData {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  status: 'open' | 'closed' | 'canceled';
  timestamp: number;
}

export interface BalanceData {
  currency: string;
  free: number;
  used: number;
  total: number;
}

class ExchangeClient {
  private exchange: any;
  private exchangeName: string;

  constructor(exchangeName: 'binance' | 'okx' | 'bybit', config: ExchangeConfig) {
    this.exchangeName = exchangeName;

    const ExchangeClass = ccxt[exchangeName];
    if (!ExchangeClass) {
      throw new Error(`Exchange ${exchangeName} not supported`);
    }

    const exchangeConfig: any = {
      apiKey: config.apiKey,
      secret: config.apiSecret,
      enableRateLimit: true,
    };

    if (exchangeName === 'okx' && config.passphrase) {
      exchangeConfig.password = config.passphrase;
    }

    this.exchange = new ExchangeClass(exchangeConfig);
  }

  async getBalance(): Promise<BalanceData[]> {
    try {
      const balance = await this.exchange.fetch_balance();
      const result: BalanceData[] = [];

      for (const currency in balance) {
        if (currency !== 'free' && currency !== 'used' && currency !== 'total') {
          const data = balance[currency];
          if (data.total > 0 || data.free > 0 || data.used > 0) {
            result.push({
              currency,
              free: data.free,
              used: data.used,
              total: data.total,
            });
          }
        }
      }

      return result;
    } catch (error) {
      console.error(`[${this.exchangeName}] Error fetching balance:`, error);
      throw error;
    }
  }

  async getPrice(symbol: string): Promise<PriceData> {
    try {
      const ticker = await this.exchange.fetch_ticker(symbol);
      return {
        symbol,
        price: ticker.last,
        timestamp: ticker.timestamp,
        bid: ticker.bid,
        ask: ticker.ask,
      };
    } catch (error) {
      console.error(`[${this.exchangeName}] Error fetching price for ${symbol}:`, error);
      throw error;
    }
  }

  async getPrices(symbols: string[]): Promise<PriceData[]> {
    try {
      const tickers = await this.exchange.fetch_tickers(symbols);
      return symbols.map(symbol => {
        const ticker = tickers[symbol];
        return {
          symbol,
          price: ticker.last,
          timestamp: ticker.timestamp,
          bid: ticker.bid,
          ask: ticker.ask,
        };
      });
    } catch (error) {
      console.error(`[${this.exchangeName}] Error fetching prices:`, error);
      throw error;
    }
  }

  async placeOrder(
    symbol: string,
    type: 'buy' | 'sell',
    amount: number,
    price?: number
  ): Promise<OrderData> {
    try {
      const orderType = price ? 'limit' : 'market';
      const order = await this.exchange.create_order(symbol, orderType, type, amount, price);

      return {
        id: order.id,
        symbol: order.symbol,
        type: type as 'buy' | 'sell',
        price: order.price || order.average,
        amount: order.amount,
        status: order.status as 'open' | 'closed' | 'canceled',
        timestamp: order.timestamp,
      };
    } catch (error) {
      console.error(`[${this.exchangeName}] Error placing order:`, error);
      throw error;
    }
  }

  async cancelOrder(symbol: string, orderId: string): Promise<void> {
    try {
      await this.exchange.cancel_order(orderId, symbol);
    } catch (error) {
      console.error(`[${this.exchangeName}] Error canceling order:`, error);
      throw error;
    }
  }

  async getOpenOrders(symbol?: string): Promise<OrderData[]> {
    try {
      const orders = await this.exchange.fetch_open_orders(symbol);
      return orders.map(order => ({
        id: order.id,
        symbol: order.symbol,
        type: order.side as 'buy' | 'sell',
        price: order.price,
        amount: order.amount,
        status: order.status as 'open' | 'closed' | 'canceled',
        timestamp: order.timestamp,
      }));
    } catch (error) {
      console.error(`[${this.exchangeName}] Error fetching open orders:`, error);
      throw error;
    }
  }

  async getOrderHistory(symbol?: string, limit: number = 100): Promise<OrderData[]> {
    try {
      const orders = await this.exchange.fetch_closed_orders(symbol, undefined, limit);
      return orders.map(order => ({
        id: order.id,
        symbol: order.symbol,
        type: order.side as 'buy' | 'sell',
        price: order.price,
        amount: order.amount,
        status: order.status as 'open' | 'closed' | 'canceled',
        timestamp: order.timestamp,
      }));
    } catch (error) {
      console.error(`[${this.exchangeName}] Error fetching order history:`, error);
      throw error;
    }
  }

  getExchangeName(): string {
    return this.exchangeName;
  }
}

export { ExchangeClient };
