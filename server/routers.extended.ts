import { router, publicProcedure, protectedProcedure } from './trpc';
import { z } from 'zod';
import { exchangeService } from './exchangeService';
import { BacktestingEngine, MomentumStrategy, MeanReversionStrategy, RSIStrategy } from './backtestingEngine';
import { notificationService } from './notificationService';
import { analyticsService } from './analyticsService';

/**
 * Exchange API Router
 */
export const exchangeRouter = router({
  // Store API keys
  storeApiKeys: protectedProcedure
    .input(
      z.object({
        exchange: z.enum(['binance', 'okx', 'bybit']),
        apiKey: z.string(),
        apiSecret: z.string(),
        passphrase: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await exchangeService.storeApiKeys(ctx.user.id, input.exchange, input.apiKey, input.apiSecret, input.passphrase);
      return { success: true };
    }),

  // Get account balance
  getBalance: protectedProcedure
    .input(z.object({ exchange: z.enum(['binance', 'okx', 'bybit']) }))
    .query(async ({ ctx, input }) => {
      const balance = await exchangeService.getBalance(ctx.user.id, input.exchange);
      return balance;
    }),

  // Place order
  placeOrder: protectedProcedure
    .input(
      z.object({
        exchange: z.enum(['binance', 'okx', 'bybit']),
        symbol: z.string(),
        side: z.enum(['BUY', 'SELL']),
        quantity: z.number(),
        price: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await exchangeService.placeOrder(
        ctx.user.id,
        input.exchange,
        input.symbol,
        input.side,
        input.quantity,
        input.price
      );
      return order;
    }),

  // Get order status
  getOrderStatus: protectedProcedure
    .input(
      z.object({
        exchange: z.enum(['binance', 'okx', 'bybit']),
        orderId: z.string(),
        symbol: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const status = await exchangeService.getOrderStatus(ctx.user.id, input.exchange, input.orderId, input.symbol);
      return status;
    }),

  // List supported exchanges
  listExchanges: publicProcedure.query(() => {
    return exchangeService.listExchanges();
  }),
});

/**
 * Backtesting Router
 */
export const backtestRouter = router({
  // Run backtest
  runBacktest: protectedProcedure
    .input(
      z.object({
        strategy: z.enum(['momentum', 'mean-reversion', 'rsi']),
        symbol: z.string(),
        timeframe: z.string(),
        ohlcvData: z.array(
          z.object({
            timestamp: z.number(),
            open: z.number(),
            high: z.number(),
            low: z.number(),
            close: z.number(),
            volume: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const engine = new BacktestingEngine();

      let strategy;
      switch (input.strategy) {
        case 'momentum':
          strategy = new MomentumStrategy(input.symbol, input.timeframe);
          break;
        case 'mean-reversion':
          strategy = new MeanReversionStrategy(input.symbol, input.timeframe);
          break;
        case 'rsi':
          strategy = new RSIStrategy(input.symbol, input.timeframe);
          break;
      }

      const result = await engine.runBacktest(strategy, input.ohlcvData, input.symbol, input.timeframe);
      return result;
    }),

  // Compare strategies
  compareStrategies: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        timeframe: z.string(),
        ohlcvData: z.array(
          z.object({
            timestamp: z.number(),
            open: z.number(),
            high: z.number(),
            low: z.number(),
            close: z.number(),
            volume: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const engine = new BacktestingEngine();
      const strategies = [
        new MomentumStrategy(input.symbol, input.timeframe),
        new MeanReversionStrategy(input.symbol, input.timeframe),
        new RSIStrategy(input.symbol, input.timeframe),
      ];

      const results = await Promise.all(
        strategies.map((strategy) => engine.runBacktest(strategy, input.ohlcvData, input.symbol, input.timeframe))
      );

      return results;
    }),
});

/**
 * Notification Router
 */
export const notificationRouter = router({
  // Get notifications
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await notificationService.getNotifications(ctx.user.id);
  }),

  // Mark as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await notificationService.markAsRead(ctx.user.id, input.notificationId);
      return { success: true };
    }),

  // Delete notification
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await notificationService.deleteNotification(ctx.user.id, input.notificationId);
      return { success: true };
    }),

  // Get preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    return await notificationService.getPreferences(ctx.user.id);
  }),

  // Set preferences
  setPreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        inAppNotifications: z.boolean().optional(),
        telegramNotifications: z.boolean().optional(),
        tradeExecutionAlerts: z.boolean().optional(),
        riskAlerts: z.boolean().optional(),
        dailyPerformanceSummary: z.boolean().optional(),
        errorAlerts: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await notificationService.setPreferences(ctx.user.id, input);
      return { success: true };
    }),
});

/**
 * Analytics Router
 */
export const analyticsRouter = router({
  // Get performance report
  getPerformanceReport: protectedProcedure
    .input(
      z.object({
        period: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']),
        trades: z.array(z.any()),
        equityCurve: z.array(z.object({ timestamp: z.number(), value: z.number() })),
        portfolio: z.record(z.number()),
        totalInvested: z.number(),
      })
    )
    .query(({ input }) => {
      return analyticsService.generatePerformanceReport(
        input.period,
        input.trades,
        input.equityCurve,
        input.portfolio,
        input.totalInvested
      );
    }),

  // Calculate trade metrics
  calculateTradeMetrics: protectedProcedure
    .input(z.object({ trades: z.array(z.any()) }))
    .query(({ input }) => {
      return analyticsService.calculateTradeMetrics(input.trades);
    }),

  // Calculate portfolio metrics
  calculatePortfolioMetrics: protectedProcedure
    .input(
      z.object({
        currentValue: z.number(),
        previousValue: z.number(),
        monthAgoValue: z.number(),
        yearAgoValue: z.number(),
        totalInvested: z.number(),
      })
    )
    .query(({ input }) => {
      return analyticsService.calculatePortfolioMetrics(
        input.currentValue,
        input.previousValue,
        input.monthAgoValue,
        input.yearAgoValue,
        input.totalInvested
      );
    }),

  // Calculate risk metrics
  calculateRiskMetrics: protectedProcedure
    .input(
      z.object({
        returns: z.array(z.number()),
        equityCurve: z.array(z.number()),
      })
    )
    .query(({ input }) => {
      return analyticsService.calculateRiskMetrics(input.returns, input.equityCurve);
    }),

  // Get top assets
  getTopAssets: protectedProcedure
    .input(
      z.object({
        portfolio: z.record(z.number()),
        totalValue: z.number(),
        limit: z.number().optional(),
      })
    )
    .query(({ input }) => {
      return analyticsService.getTopAssets(input.portfolio, input.totalValue, input.limit);
    }),
});

/**
 * Combined router
 */
export const extendedRouter = router({
  exchange: exchangeRouter,
  backtest: backtestRouter,
  notifications: notificationRouter,
  analytics: analyticsRouter,
});
