import { getSessionCookieOptions, COOKIE_NAME } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  trading: router({
    getTrades: protectedProcedure.query(async ({ ctx }) => {
      return db.getTradesByUserId(ctx.user.id);
    }),
    getBacktestResults: protectedProcedure.query(async ({ ctx }) => {
      return db.getBacktestResultsByUserId(ctx.user.id);
    }),
    getPortfolioSnapshots: protectedProcedure.query(async ({ ctx }) => {
      return db.getPortfolioSnapshotsByUserId(ctx.user.id);
    }),
    executeOrder: protectedProcedure
      .input(z.object({
        exchange: z.string(),
        symbol: z.string(),
        type: z.enum(['buy', 'sell']),
        amount: z.number().positive(),
        price: z.number().optional(),
        stopLoss: z.number().optional(),
        takeProfit: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // TODO: Implement actual order execution with TradingService
          const trade = await db.createTrade({
            userId: ctx.user.id,
            exchange: input.exchange,
            symbol: input.symbol,
            type: input.type,
            amount: input.amount,
            price: input.price || 0,
            status: 'pending',
            timestamp: new Date(),
          });
          return { success: true, trade };
        } catch (error) {
          console.error('Error executing order:', error);
          throw error;
        }
      }),
    
    getBalance: protectedProcedure
      .input(z.object({ exchange: z.string() }))
      .query(async ({ ctx, input }) => {
        // TODO: Implement balance fetching from exchange
        return [];
      }),
    
    getOpenOrders: protectedProcedure
      .input(z.object({ exchange: z.string(), symbol: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        // TODO: Implement open orders fetching from exchange
        return [];
      }),

    getPortfolioMetrics: protectedProcedure.query(async ({ ctx }) => {
      const trades = await db.getTradesByUserId(ctx.user.id);
      let totalValue = 0;
      let totalCost = 0;
      let totalPnL = 0;
      let winCount = 0;
      let lossCount = 0;

      for (const trade of trades) {
        if (trade.status === 'closed') {
          const pnl = (trade.exitPrice || 0 - trade.price) * trade.amount;
          totalPnL += pnl;
          if (pnl > 0) winCount++;
          else if (pnl < 0) lossCount++;
        }
      }

      return {
        totalValue,
        totalCost,
        totalPnL,
        totalPnLPercent: totalCost > 0 ? (totalPnL / totalCost) * 100 : 0,
        winRate: (winCount + lossCount) > 0 ? (winCount / (winCount + lossCount)) * 100 : 0,
        tradeCount: trades.length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
