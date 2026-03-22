import { ExchangeClient, OrderData, BalanceData } from './exchanges';

export interface TradeRequest {
  exchange: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface Position {
  id: string;
  exchange: string;
  symbol: string;
  entryPrice: number;
  amount: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: number;
}

class TradingService {
  private exchanges: Map<string, ExchangeClient> = new Map();
  private positions: Map<string, Position> = new Map();
  private orderHistory: OrderData[] = [];

  registerExchange(name: string, client: ExchangeClient): void {
    this.exchanges.set(name, client);
  }

  async executeOrder(request: TradeRequest): Promise<OrderData> {
    const client = this.exchanges.get(request.exchange);
    if (!client) {
      throw new Error(`Exchange ${request.exchange} not registered`);
    }

    try {
      const order = await client.placeOrder(
        request.symbol,
        request.type,
        request.amount,
        request.price
      );

      this.orderHistory.push(order);

      // Create position if buy order
      if (request.type === 'buy') {
        const position: Position = {
          id: order.id,
          exchange: request.exchange,
          symbol: request.symbol,
          entryPrice: order.price,
          amount: order.amount,
          currentPrice: order.price,
          pnl: 0,
          pnlPercent: 0,
          stopLoss: request.stopLoss,
          takeProfit: request.takeProfit,
          timestamp: order.timestamp,
        };
        this.positions.set(order.id, position);
      }

      return order;
    } catch (error) {
      console.error('[TradingService] Error executing order:', error);
      throw error;
    }
  }

  async cancelOrder(exchange: string, symbol: string, orderId: string): Promise<void> {
    const client = this.exchanges.get(exchange);
    if (!client) {
      throw new Error(`Exchange ${exchange} not registered`);
    }

    try {
      await client.cancelOrder(symbol, orderId);
    } catch (error) {
      console.error('[TradingService] Error canceling order:', error);
      throw error;
    }
  }

  async getBalance(exchange: string): Promise<BalanceData[]> {
    const client = this.exchanges.get(exchange);
    if (!client) {
      throw new Error(`Exchange ${exchange} not registered`);
    }

    try {
      return await client.getBalance();
    } catch (error) {
      console.error('[TradingService] Error fetching balance:', error);
      throw error;
    }
  }

  async getOpenOrders(exchange: string, symbol?: string): Promise<OrderData[]> {
    const client = this.exchanges.get(exchange);
    if (!client) {
      throw new Error(`Exchange ${exchange} not registered`);
    }

    try {
      return await client.getOpenOrders(symbol);
    } catch (error) {
      console.error('[TradingService] Error fetching open orders:', error);
      throw error;
    }
  }

  async getOrderHistory(exchange: string, symbol?: string): Promise<OrderData[]> {
    const client = this.exchanges.get(exchange);
    if (!client) {
      throw new Error(`Exchange ${exchange} not registered`);
    }

    try {
      return await client.getOrderHistory(symbol);
    } catch (error) {
      console.error('[TradingService] Error fetching order history:', error);
      throw error;
    }
  }

  updatePositionPrice(positionId: string, currentPrice: number): void {
    const position = this.positions.get(positionId);
    if (position) {
      position.currentPrice = currentPrice;
      position.pnl = (currentPrice - position.entryPrice) * position.amount;
      position.pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;

      // Check stop loss and take profit
      if (position.stopLoss && currentPrice <= position.stopLoss) {
        console.log(`[TradingService] Stop loss triggered for position ${positionId}`);
      }
      if (position.takeProfit && currentPrice >= position.takeProfit) {
        console.log(`[TradingService] Take profit triggered for position ${positionId}`);
      }
    }
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  getPosition(id: string): Position | undefined {
    return this.positions.get(id);
  }

  removePosition(id: string): void {
    this.positions.delete(id);
  }

  getOrderHistory(): OrderData[] {
    return this.orderHistory;
  }

  calculatePortfolioMetrics() {
    const positions = this.getPositions();
    let totalValue = 0;
    let totalCost = 0;
    let totalPnL = 0;

    for (const position of positions) {
      const value = position.currentPrice * position.amount;
      const cost = position.entryPrice * position.amount;
      totalValue += value;
      totalCost += cost;
      totalPnL += position.pnl;
    }

    return {
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercent: totalCost > 0 ? (totalPnL / totalCost) * 100 : 0,
      positionCount: positions.length,
    };
  }
}

export { TradingService };
