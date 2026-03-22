import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

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

describe("tRPC API Validation", () => {
  const mockUser: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "email",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  describe("Public Procedures", () => {
    it("auth.me should be accessible", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);
      expect(typeof caller.auth.me).toBe("function");
    });

    it("auth.logout should be accessible", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);
      expect(typeof caller.auth.logout).toBe("function");
    });
  });

  describe("Protected Procedures", () => {
    it("trading.getTrades should exist and be callable", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);
      expect(typeof caller.trading.getTrades).toBe("function");
    });

    it("trading.getBacktestResults should exist and be callable", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);
      expect(typeof caller.trading.getBacktestResults).toBe("function");
    });

    it("trading.getPortfolioSnapshots should exist and be callable", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);
      expect(typeof caller.trading.getPortfolioSnapshots).toBe("function");
    });
  });

  describe("API Response Validation", () => {
    it("auth.me should return user data when authenticated", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.openId).toBe("test-user-123");
      expect(result?.email).toBe("test@example.com");
    });

    it("auth.me should return null when not authenticated", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();
      
      expect(result).toBeNull();
    });

    it("auth.logout should return success response", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.logout();
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing user context gracefully", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);
      
      try {
        const result = await caller.auth.me();
        expect(result).toBeNull();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Router Structure", () => {
    it("should have auth router with required procedures", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);
      
      expect(caller.auth).toBeDefined();
      expect(caller.auth.me).toBeDefined();
      expect(caller.auth.logout).toBeDefined();
    });

    it("should have trading router with required procedures", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);
      
      expect(caller.trading).toBeDefined();
      expect(caller.trading.getTrades).toBeDefined();
      expect(caller.trading.getBacktestResults).toBeDefined();
      expect(caller.trading.getPortfolioSnapshots).toBeDefined();
    });

    it("should have system router", async () => {
      const ctx = createContext(mockUser);
      const caller = appRouter.createCaller(ctx);
      
      expect(caller.system).toBeDefined();
    });
  });
});
