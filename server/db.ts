import { eq } from "drizzle-orm";
import { trades, backtestResults, portfolioSnapshots, InsertTrade, InsertBacktestResult, InsertPortfolioSnapshot } from "../drizzle/schema";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      if (!_pool) {
        _pool = mysql.createPool(process.env.DATABASE_URL);
      }
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Trading Bot Queries
export async function createTrade(trade: InsertTrade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(trades).values(trade);
  return result;
}

export async function getTradesByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(trades).where(eq(trades.userId, userId)).orderBy(trades.createdAt).limit(limit);
}

export async function createBacktestResult(result: InsertBacktestResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(backtestResults).values(result);
}

export async function getBacktestResultsByUserId(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(backtestResults).where(eq(backtestResults.userId, userId)).orderBy(backtestResults.createdAt).limit(limit);
}

export async function createPortfolioSnapshot(snapshot: InsertPortfolioSnapshot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(portfolioSnapshots).values(snapshot);
}

export async function getPortfolioSnapshotsByUserId(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(portfolioSnapshots).where(eq(portfolioSnapshots.userId, userId)).orderBy(portfolioSnapshots.createdAt).limit(limit);
}


