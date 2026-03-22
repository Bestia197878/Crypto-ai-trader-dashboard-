import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Trading Bot Data Schema
export const trades = mysqlTable("trades", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exchange: varchar("exchange", { length: 64 }).notNull(), // OKX, Bybit, KuCoin, Binance
  symbol: varchar("symbol", { length: 64 }).notNull(), // BTC/USDT, ETH/USDT, etc.
  side: varchar("side", { length: 10 }).notNull(), // BUY or SELL
  amount: varchar("amount", { length: 255 }).notNull(), // Store as string for precision
  price: varchar("price", { length: 255 }).notNull(), // Store as string for precision
  totalValue: varchar("totalValue", { length: 255 }).notNull(), // amount * price
  status: varchar("status", { length: 64 }).default("completed").notNull(), // completed, pending, failed
  executedAt: timestamp("executedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = typeof trades.$inferInsert;

export const backtestResults = mysqlTable("backtestResults", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exchange: varchar("exchange", { length: 64 }).notNull(),
  symbol: varchar("symbol", { length: 64 }).notNull(),
  timeframe: varchar("timeframe", { length: 64 }).default("1h").notNull(),
  initialCapital: varchar("initialCapital", { length: 255 }).notNull(),
  finalValue: varchar("finalValue", { length: 255 }).notNull(),
  profitLoss: varchar("profitLoss", { length: 255 }).notNull(),
  profitLossPercent: varchar("profitLossPercent", { length: 255 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  totalTrades: int("totalTrades").default(0).notNull(),
  winRate: varchar("winRate", { length: 255 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BacktestResult = typeof backtestResults.$inferSelect;
export type InsertBacktestResult = typeof backtestResults.$inferInsert;

export const portfolioSnapshots = mysqlTable("portfolioSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exchange: varchar("exchange", { length: 64 }).notNull(),
  symbol: varchar("symbol", { length: 64 }).notNull(),
  baseAmount: varchar("baseAmount", { length: 255 }).notNull(), // Amount of base currency (BTC, ETH, etc.)
  quoteAmount: varchar("quoteAmount", { length: 255 }).notNull(), // Amount of quote currency (USDT, etc.)
  totalValue: varchar("totalValue", { length: 255 }).notNull(), // Total value in quote currency
  snapshotAt: timestamp("snapshotAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
export type InsertPortfolioSnapshot = typeof portfolioSnapshots.$inferInsert;