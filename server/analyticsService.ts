/**
 * Analytics Service for CryptoBot v8.1
 * Comprehensive performance metrics and analysis
 */

export interface TradeMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  expectancy: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
  monthChange: number;
  monthChangePercentage: number;
  yearChange: number;
  yearChangePercentage: number;
}

export interface RiskMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  volatility: number;
  calmarRatio: number;
  valueAtRisk: number;
}

export interface PerformanceReport {
  period: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  startDate: number;
  endDate: number;
  tradeMetrics: TradeMetrics;
  portfolioMetrics: PortfolioMetrics;
  riskMetrics: RiskMetrics;
  topAssets: Array<{ symbol: string; value: number; percentage: number }>;
  monthlyReturns: Array<{ month: string; return: number }>;
  equityCurve: Array<{ timestamp: number; value: number }>;
}

/**
 * Analytics Service
 */
export class AnalyticsService {
  /**
   * Calculate trade metrics
   */
  calculateTradeMetrics(trades: any[]): TradeMetrics {
    const buyTrades = trades.filter((t) => t.side === 'BUY');
    const sellTrades = trades.filter((t) => t.side === 'SELL');

    let totalProfit = 0;
    let totalLoss = 0;
    let winningCount = 0;
    let losingCount = 0;

    // Pair buy and sell trades
    for (let i = 0; i < Math.min(buyTrades.length, sellTrades.length); i++) {
      const pnl = sellTrades[i].price * sellTrades[i].quantity - buyTrades[i].price * buyTrades[i].quantity;

      if (pnl > 0) {
        totalProfit += pnl;
        winningCount++;
      } else {
        totalLoss += Math.abs(pnl);
        losingCount++;
      }
    }

    const totalTrades = Math.min(buyTrades.length, sellTrades.length);
    const winRate = totalTrades > 0 ? (winningCount / totalTrades) * 100 : 0;
    const averageWin = winningCount > 0 ? totalProfit / winningCount : 0;
    const averageLoss = losingCount > 0 ? totalLoss / losingCount : 0;
    const profitFactor = averageLoss > 0 ? averageWin / averageLoss : averageWin > 0 ? 1 : 0;
    const expectancy = totalTrades > 0 ? (totalProfit - totalLoss) / totalTrades : 0;

    return {
      totalTrades,
      winningTrades: winningCount,
      losingTrades: losingCount,
      winRate,
      averageWin,
      averageLoss,
      profitFactor,
      expectancy,
    };
  }

  /**
   * Calculate portfolio metrics
   */
  calculatePortfolioMetrics(
    currentValue: number,
    previousValue: number,
    monthAgoValue: number,
    yearAgoValue: number,
    totalInvested: number
  ): PortfolioMetrics {
    const totalReturn = currentValue - totalInvested;
    const returnPercentage = (totalReturn / totalInvested) * 100;
    const dayChange = currentValue - previousValue;
    const dayChangePercentage = (dayChange / previousValue) * 100;
    const monthChange = currentValue - monthAgoValue;
    const monthChangePercentage = (monthChange / monthAgoValue) * 100;
    const yearChange = currentValue - yearAgoValue;
    const yearChangePercentage = (yearChange / yearAgoValue) * 100;

    return {
      totalValue: currentValue,
      totalInvested,
      totalReturn,
      returnPercentage,
      dayChange,
      dayChangePercentage,
      monthChange,
      monthChangePercentage,
      yearChange,
      yearChangePercentage,
    };
  }

  /**
   * Calculate risk metrics
   */
  calculateRiskMetrics(
    returns: number[],
    equityCurve: number[],
    riskFreeRate: number = 0.02
  ): RiskMetrics {
    // Sharpe Ratio
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? (avgReturn - riskFreeRate / 252) / (stdDev / Math.sqrt(252)) : 0;

    // Sortino Ratio (downside risk only)
    const downsideReturns = returns.filter((r) => r < 0);
    const downvariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length;
    const downsideStdDev = Math.sqrt(downvariance);
    const sortinoRatio = downsideStdDev > 0 ? (avgReturn - riskFreeRate / 252) / (downsideStdDev / Math.sqrt(252)) : 0;

    // Maximum Drawdown
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

    // Volatility (annualized)
    const volatility = stdDev * Math.sqrt(252);

    // Calmar Ratio
    const totalReturn = (equityCurve[equityCurve.length - 1] - equityCurve[0]) / equityCurve[0];
    const calmarRatio = maxDrawdown > 0 ? totalReturn / maxDrawdown : 0;

    // Value at Risk (95% confidence)
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const varIndex = Math.floor(sortedReturns.length * 0.05);
    const valueAtRisk = sortedReturns[varIndex] || 0;

    return {
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      volatility,
      calmarRatio,
      valueAtRisk,
    };
  }

  /**
   * Calculate monthly returns
   */
  calculateMonthlyReturns(equityCurve: Array<{ timestamp: number; value: number }>): Array<{
    month: string;
    return: number;
  }> {
    const monthlyData: Map<string, { start: number; end: number }> = new Map();

    equityCurve.forEach((point) => {
      const date = new Date(point.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { start: point.value, end: point.value });
      } else {
        const data = monthlyData.get(monthKey)!;
        data.end = point.value;
      }
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      return: ((data.end - data.start) / data.start) * 100,
    }));
  }

  /**
   * Get top assets by value
   */
  getTopAssets(portfolio: Record<string, number>, totalValue: number, limit: number = 5): Array<{
    symbol: string;
    value: number;
    percentage: number;
  }> {
    return Object.entries(portfolio)
      .map(([symbol, value]) => ({
        symbol,
        value,
        percentage: (value / totalValue) * 100,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport(
    period: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR',
    trades: any[],
    equityCurve: Array<{ timestamp: number; value: number }>,
    portfolio: Record<string, number>,
    totalInvested: number
  ): PerformanceReport {
    const now = Date.now();
    let startDate = now;

    switch (period) {
      case 'DAY':
        startDate = now - 24 * 60 * 60 * 1000;
        break;
      case 'WEEK':
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'MONTH':
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case 'YEAR':
        startDate = now - 365 * 24 * 60 * 60 * 1000;
        break;
    }

    const periodTrades = trades.filter((t) => t.timestamp >= startDate);
    const periodEquityCurve = equityCurve.filter((e) => e.timestamp >= startDate);

    const currentValue = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].value : totalInvested;
    const previousValue = equityCurve.length > 1 ? equityCurve[equityCurve.length - 2].value : currentValue;
    const monthAgoValue = equityCurve.length > 30 ? equityCurve[equityCurve.length - 30].value : currentValue;
    const yearAgoValue = equityCurve.length > 365 ? equityCurve[equityCurve.length - 365].value : currentValue;

    const tradeMetrics = this.calculateTradeMetrics(periodTrades);
    const portfolioMetrics = this.calculatePortfolioMetrics(
      currentValue,
      previousValue,
      monthAgoValue,
      yearAgoValue,
      totalInvested
    );

    const returns = periodEquityCurve.slice(1).map((e, i) => (e.value - periodEquityCurve[i].value) / periodEquityCurve[i].value);
    const riskMetrics = this.calculateRiskMetrics(returns, periodEquityCurve.map((e) => e.value));

    const topAssets = this.getTopAssets(portfolio, currentValue);
    const monthlyReturns = this.calculateMonthlyReturns(periodEquityCurve);

    return {
      period,
      startDate,
      endDate: now,
      tradeMetrics,
      portfolioMetrics,
      riskMetrics,
      topAssets,
      monthlyReturns,
      equityCurve: periodEquityCurve,
    };
  }
}

export const analyticsService = new AnalyticsService();
