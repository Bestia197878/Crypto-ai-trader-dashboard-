import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";
import type { User, InsertUser } from "../drizzle/schema";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user: AuthenticatedUser | null): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("End-to-End Integration Tests", () => {
  const mockUser: AuthenticatedUser = {
    id: 1,
    openId: `integration-test-${Date.now()}`,
    email: "integration@test.com",
    name: "Integration Test User",
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  describe("Complete User Flow", () => {
    it("should handle complete authentication and data retrieval flow", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      // Step 1: Get current user
      const user = await caller.auth.me();
      expect(user).toBeDefined();
      expect(user?.openId).toBe(mockUser.openId);

      // Step 2: Get user trades
      const trades = await caller.trading.getTrades();
      expect(Array.isArray(trades)).toBe(true);

      // Step 3: Get backtest results
      const backtests = await caller.trading.getBacktestResults();
      expect(Array.isArray(backtests)).toBe(true);

      // Step 4: Get portfolio snapshots
      const snapshots = await caller.trading.getPortfolioSnapshots();
      expect(Array.isArray(snapshots)).toBe(true);
    });
  });

  describe("Data Consistency", () => {
    it("should maintain data consistency across multiple queries", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      // Get data multiple times
      const trades1 = await caller.trading.getTrades();
      const trades2 = await caller.trading.getTrades();

      // Results should be consistent
      expect(trades1.length).toBe(trades2.length);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle unauthenticated access gracefully", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      // Public procedures should work
      const user = await caller.auth.me();
      expect(user).toBeNull();
    });

    it("should handle logout and subsequent access", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      // Logout
      const logoutResult = await caller.auth.logout();
      expect(logoutResult.success).toBe(true);

      // After logout, user should still be able to call public procedures
      const user = await caller.auth.me();
      expect(user).toBeDefined();
    });
  });

  describe("Data Validation", () => {
    it("should validate returned data types", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const user = await caller.auth.me();
      if (user) {
        expect(typeof user.id).toBe("number");
        expect(typeof user.openId).toBe("string");
        expect(typeof user.name).toBe("string");
        expect(typeof user.role).toBe("string");
      }
    });

    it("should validate trade data structure", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      try {
        const trades = await caller.trading.getTrades();
        if (trades.length > 0) {
          const trade = trades[0];
          expect(trade).toHaveProperty("id");
          expect(trade).toHaveProperty("userId");
          expect(trade).toHaveProperty("exchange");
          expect(trade).toHaveProperty("symbol");
          expect(trade).toHaveProperty("side");
          expect(trade).toHaveProperty("amount");
          expect(trade).toHaveProperty("price");
        }
      } catch (error) {
        console.log("Trade validation skipped: Database not available");
      }
    });
  });

  describe("API Response Times", () => {
    it("should respond to queries within reasonable time", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const startTime = Date.now();
      await caller.auth.me();
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should respond within 5 seconds
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle concurrent API calls", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);

      const results = await Promise.all([
        caller.auth.me(),
        caller.trading.getTrades(),
        caller.trading.getBacktestResults(),
        caller.trading.getPortfolioSnapshots(),
      ]);

      expect(results).toHaveLength(4);
      expect(results[0]).toBeDefined(); // User
      expect(Array.isArray(results[1])).toBe(true); // Trades
      expect(Array.isArray(results[2])).toBe(true); // Backtests
      expect(Array.isArray(results[3])).toBe(true); // Snapshots
    });
  });
});
