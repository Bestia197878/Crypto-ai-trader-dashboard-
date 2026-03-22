/**
 * Backtesting Engine for CryptoBot v8.1
 * Supports multiple strategies and comprehensive performance metrics
 */

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  timestamp: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  commission: number;
}

export interface BacktestResult {
  strategy: string;
  symbol: string;
  timeframe: string;
  startDate: number;
  endDate: number;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  returnPercentage: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  trades: Trade[];
  equityCurve: Array<{ timestamp: number; value: number }>;
}

/**
 * Base Strategy Interface
 */
export abstract class BaseStrategy {
  protected symbol: string;
  protected timeframe: string;

  constructor(symbol: string, timeframe: string = '1h') {
    this.symbol = symbol;
    this.timeframe = timeframe;
  }

  abstract generateSignal(ohlcv: OHLCV[], index: number): 'BUY' | 'SELL' | 'HOLD';
  abstract getName(): string;
}

/**
 * Momentum Strategy (SMA Crossover + RSI)
 */
export class MomentumStrategy extends BaseStrategy {
  private shortPeriod: number = 10;
  private longPeriod: number = 20;
  private rsiPeriod: number = 14;
  private rsiOverbought: number = 70;
  private rsiOversold: number = 30;

  getName(): string {
    return 'Momentum';
  }

  private calculateSMA(data: number[], period: number): number {
    if (data.length < period) return 0;
    const sum = data.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  private calculateRSI(closes: number[], period: number): number {
    if (closes.length < period + 1) return 50;

    let gains = 0,
      losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  generateSignal(ohlcv: OHLCV[], index: number): 'BUY' | 'SELL' | 'HOLD' {
    if (index < this.longPeriod + this.rsiPeriod) return 'HOLD';

    const closes = ohlcv.map((c) => c.close);
    const shortSMA = this.calculateSMA(closes, this.shortPeriod);
    const longSMA = this.calculateSMA(closes, this.longPeriod);
    const rsi = this.calculateRSI(closes, this.rsiPeriod);

    if (shortSMA > longSMA && rsi < this.rsiOverbought) {
      return 'BUY';
    } else if (shortSMA < longSMA && rsi > this.rsiOversold) {
      return 'SELL';
    }

    return 'HOLD';
  }
}

/**
 * Mean Reversion Strategy (Bollinger Bands)
 */
export class MeanReversionStrategy extends BaseStrategy {
  private period: number = 20;
  private stdDev: number = 2;

  getName(): string {
    return 'Mean Reversion';
  }

  private calculateBollingerBands(closes: number[], period: number, stdDev: number) {
    if (closes.length < period) return null;

    const recentCloses = closes.slice(-period);
    const sma = recentCloses.reduce((a, b) => a + b, 0) / period;
    const variance = recentCloses.reduce((sum, close) => sum + Math.pow(close - sma, 2), 0) / period;
    const std = Math.sqrt(variance);

    return {
      upper: sma + stdDev * std,
      middle: sma,
      lower: sma - stdDev * std,
    };
  }

  generateSignal(ohlcv: OHLCV[], index: number): 'BUY' | 'SELL' | 'HOLD' {
    if (index < this.period) return 'HOLD';

    const closes = ohlcv.map((c) => c.close);
    const bands = this.calculateBollingerBands(closes, this.period, this.stdDev);

    if (!bands) return 'HOLD';

    const currentPrice = closes[closes.length - 1];

    if (currentPrice < bands.lower) {
      return 'BUY';
    } else if (currentPrice > bands.upper) {
      return 'SELL';
    }

    return 'HOLD';
  }
}

/**
 * RSI Strategy
 */
export class RSIStrategy extends BaseStrategy {
  private period: number = 14;
  private overbought: number = 70;
  private oversold: number = 30;

  getName(): string {
    return 'RSI';
  }

  private calculateRSI(closes: number[]): number {
    if (closes.length < this.period + 1) return 50;

    let gains = 0,
      losses = 0;
    for (let i = closes.length - this.period; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / this.period;
    const avgLoss = losses / this.period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  generateSignal(ohlcv: OHLCV[], index: number): 'BUY' | 'SELL' | 'HOLD' {
    if (index < this.period) return 'HOLD';

    const closes = ohlcv.map((c) => c.close);
    const rsi = this.calculateRSI(closes);

    if (rsi < this.oversold) {
      return 'BUY';
    } else if (rsi > this.overbought) {
      return 'SELL';
    }

    return 'HOLD';
  }
}

/**
 * Backtesting Engine
 */
export class BacktestingEngine {
  private initialCapital: number;
  private commissionRate: number;

  constructor(initialCapital: number = 10000, commissionRate: number = 0.001) {
    this.initialCapital = initialCapital;
    this.commissionRate = commissionRate;
  }

  /**
   * Calculate Sharpe Ratio
   */
  private calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;
    return (avgReturn - riskFreeRate / 252) / (stdDev / Math.sqrt(252));
  }

  /**
   * Calculate Sortino Ratio (downside risk only)
   */
  private calculateSortinoRatio(returns: number[], riskFreeRate: number = 0.02): number {
    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const downsideReturns = returns.filter((r) => r < 0);
    const downvariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length;
    const downsideStdDev = Math.sqrt(downvariance);

    if (downsideStdDev === 0) return 0;
    return (avgReturn - riskFreeRate / 252) / (downsideStdDev / Math.sqrt(252));
  }

  /**
   * Calculate Maximum Drawdown
   */
  private calculateMaxDrawdown(equityCurve: number[]): number {
    if (equityCurve.length === 0) return 0;

    let maxDrawdown = 0;
    let peak = equityCurve[0];

    for (let i = 1; i < equityCurve.length; i++) {
      if (equityCurve[i] > peak) {
        peak = equityCurve[i];
      }
      const drawdown = (peak - equityCurve[i]) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  /**
   * Run backtest
   */
  async runBacktest(
    strategy: BaseStrategy,
    ohlcvData: OHLCV[],
    symbol: string,
    timeframe: string
  ): Promise<BacktestResult> {
    const trades: Trade[] = [];
    const equityCurve: Array<{ timestamp: number; value: number }> = [];
    const returns: number[] = [];

    let position: { quantity: number; entryPrice: number } | null = null;
    let capital = this.initialCapital;
    let equityValue = this.initialCapital;

    equityCurve.push({ timestamp: ohlcvData[0].timestamp, value: this.initialCapital });

    for (let i = 1; i < ohlcvData.length; i++) {
      const signal = strategy.generateSignal(ohlcvData, i);
      const currentPrice = ohlcvData[i].close;

      if (signal === 'BUY' && !position) {
        const quantity = (capital * 0.95) / currentPrice; // Use 95% of capital
        const commission = quantity * currentPrice * this.commissionRate;
        capital -= quantity * currentPrice + commission;

        position = { quantity, entryPrice: currentPrice };
        trades.push({
          timestamp: ohlcvData[i].timestamp,
          symbol,
          side: 'BUY',
          price: currentPrice,
          quantity,
          commission,
        });
      } else if (signal === 'SELL' && position) {
        const saleValue = position.quantity * currentPrice;
        const commission = saleValue * this.commissionRate;
        capital += saleValue - commission;

        const pnl = saleValue - position.quantity * position.entryPrice - commission;
        const returnPct = pnl / (position.quantity * position.entryPrice);
        returns.push(returnPct);

        trades.push({
          timestamp: ohlcvData[i].timestamp,
          symbol,
          side: 'SELL',
          price: currentPrice,
          quantity: position.quantity,
          commission,
        });

        position = null;
      }

      // Calculate current equity
      if (position) {
        equityValue = capital + position.quantity * currentPrice;
      } else {
        equityValue = capital;
      }

      equityCurve.push({ timestamp: ohlcvData[i].timestamp, value: equityValue });
    }

    // Close position if still open
    if (position) {
      const lastPrice = ohlcvData[ohlcvData.length - 1].close;
      capital += position.quantity * lastPrice;
      equityValue = capital;
    }

    const totalReturn = equityValue - this.initialCapital;
    const returnPercentage = (totalReturn / this.initialCapital) * 100;

    const winningTrades = trades.filter((t) => t.side === 'SELL').length;
    const losingTrades = trades.filter((t) => t.side === 'BUY').length - winningTrades;
    const totalTrades = trades.length;

    const equityValues = equityCurve.map((e) => e.value);
    const profitFactor =
      losingTrades === 0
        ? winningTrades > 0
          ? 1
          : 0
        : Math.abs(
            equityValues.reduce((a, b) => a + b, 0) / equityValues.length / this.initialCapital
          );

    return {
      strategy: strategy.getName(),
      symbol,
      timeframe,
      startDate: ohlcvData[0].timestamp,
      endDate: ohlcvData[ohlcvData.length - 1].timestamp,
      initialCapital: this.initialCapital,
      finalCapital: equityValue,
      totalReturn,
      returnPercentage,
      sharpeRatio: this.calculateSharpeRatio(returns),
      sortinoRatio: this.calculateSortinoRatio(returns),
      maxDrawdown: this.calculateMaxDrawdown(equityValues),
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      profitFactor,
      totalTrades,
      winningTrades,
      losingTrades,
      trades,
      equityCurve,
    };
  }
}
