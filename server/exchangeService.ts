import crypto from 'crypto';
import { db } from './db';
import { exchangeAccounts } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-min-32-chars-long!!';
const ALGORITHM = 'aes-256-cbc';

interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
}

interface ExchangeConfig {
  name: string;
  apiUrl: string;
  rateLimit: RateLimitConfig;
}

// Exchange configurations
const EXCHANGE_CONFIGS: Record<string, ExchangeConfig> = {
  binance: {
    name: 'Binance',
    apiUrl: 'https://api.binance.com',
    rateLimit: {
      requestsPerSecond: 10,
      requestsPerMinute: 1200,
      requestsPerHour: 72000,
    },
  },
  okx: {
    name: 'OKX',
    apiUrl: 'https://www.okx.com',
    rateLimit: {
      requestsPerSecond: 20,
      requestsPerMinute: 1200,
      requestsPerHour: 72000,
    },
  },
  bybit: {
    name: 'Bybit',
    apiUrl: 'https://api.bybit.com',
    rateLimit: {
      requestsPerSecond: 10,
      requestsPerMinute: 600,
      requestsPerHour: 36000,
    },
  },
};

/**
 * Encrypt sensitive data using AES-256-CBC
 */
export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string): string {
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Rate limiter using token bucket algorithm
 */
class RateLimiter {
  private tokens: number;
  private lastRefillTime: number;
  private refillRate: number;

  constructor(tokensPerSecond: number) {
    this.tokens = tokensPerSecond;
    this.refillRate = tokensPerSecond;
    this.lastRefillTime = Date.now();
  }

  async acquire(tokens: number = 1): Promise<boolean> {
    const now = Date.now();
    const timePassed = (now - this.lastRefillTime) / 1000;
    this.tokens = Math.min(this.refillRate, this.tokens + timePassed * this.refillRate);
    this.lastRefillTime = now;

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  async waitForTokens(tokens: number = 1): Promise<void> {
    while (!(await this.acquire(tokens))) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

/**
 * Exchange Service with encryption, rate limiting, and error handling
 */
export class ExchangeService {
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private requestCounts: Map<string, number[]> = new Map();

  constructor() {
    // Initialize rate limiters for each exchange
    Object.entries(EXCHANGE_CONFIGS).forEach(([exchange, config]) => {
      this.rateLimiters.set(exchange, new RateLimiter(config.rateLimit.requestsPerSecond));
      this.requestCounts.set(exchange, []);
    });
  }

  /**
   * Store encrypted API keys
   */
  async storeApiKeys(
    userId: string,
    exchange: string,
    apiKey: string,
    apiSecret: string,
    passphrase?: string
  ): Promise<void> {
    const encryptedKey = encryptData(apiKey);
    const encryptedSecret = encryptData(apiSecret);
    const encryptedPassphrase = passphrase ? encryptData(passphrase) : null;

    await db
      .insert(exchangeAccounts)
      .values({
        userId,
        exchange,
        apiKey: encryptedKey,
        apiSecret: encryptedSecret,
        passphrase: encryptedPassphrase,
        isActive: true,
        createdAt: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: {
          apiKey: encryptedKey,
          apiSecret: encryptedSecret,
          passphrase: encryptedPassphrase,
          updatedAt: new Date(),
        },
      });
  }

  /**
   * Retrieve decrypted API keys
   */
  async getApiKeys(userId: string, exchange: string) {
    const account = await db.query.exchangeAccounts.findFirst({
      where: eq(exchangeAccounts.userId, userId),
    });

    if (!account) {
      throw new Error(`No API keys found for ${exchange}`);
    }

    return {
      apiKey: decryptData(account.apiKey),
      apiSecret: decryptData(account.apiSecret),
      passphrase: account.passphrase ? decryptData(account.passphrase) : undefined,
    };
  }

  /**
   * Check rate limit before making request
   */
  private async checkRateLimit(exchange: string): Promise<void> {
    const limiter = this.rateLimiters.get(exchange);
    if (!limiter) {
      throw new Error(`Unknown exchange: ${exchange}`);
    }

    await limiter.waitForTokens(1);

    // Track request count
    const counts = this.requestCounts.get(exchange) || [];
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;

    // Clean old entries
    const recentCounts = counts.filter((t) => t > oneMinuteAgo);
    this.requestCounts.set(exchange, recentCounts);

    // Check limits
    const config = EXCHANGE_CONFIGS[exchange];
    if (recentCounts.length >= config.rateLimit.requestsPerMinute) {
      throw new Error(`Rate limit exceeded for ${exchange} (per minute)`);
    }

    // Add current request
    recentCounts.push(now);
  }

  /**
   * Make API request with retry logic
   */
  async makeRequest(
    exchange: string,
    endpoint: string,
    method: string = 'GET',
    data?: any,
    maxRetries: number = 3
  ): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Check rate limit
        await this.checkRateLimit(exchange);

        const config = EXCHANGE_CONFIGS[exchange];
        const url = `${config.apiUrl}${endpoint}`;

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error: ${errorData.msg || response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        if (attempt < maxRetries - 1) {
          console.log(`Retry attempt ${attempt + 1} for ${exchange} after ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Failed to make request to ${exchange} after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Get account balance from exchange
   */
  async getBalance(userId: string, exchange: string): Promise<Record<string, number>> {
    const keys = await this.getApiKeys(userId, exchange);

    // This is a simplified example - actual implementation would use exchange-specific APIs
    const response = await this.makeRequest(exchange, '/api/v3/account');

    const balances: Record<string, number> = {};
    response.balances?.forEach((balance: any) => {
      const free = parseFloat(balance.free);
      if (free > 0) {
        balances[balance.asset] = free;
      }
    });

    return balances;
  }

  /**
   * Place order on exchange
   */
  async placeOrder(
    userId: string,
    exchange: string,
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: number,
    price?: number
  ): Promise<any> {
    const keys = await this.getApiKeys(userId, exchange);

    const orderData = {
      symbol,
      side,
      quantity,
      price,
      type: price ? 'LIMIT' : 'MARKET',
      timestamp: Date.now(),
    };

    const response = await this.makeRequest(exchange, '/api/v3/order', 'POST', orderData);

    return {
      orderId: response.orderId,
      symbol: response.symbol,
      side: response.side,
      quantity: response.origQty,
      price: response.price,
      status: response.status,
      timestamp: response.transactTime,
    };
  }

  /**
   * Get order status
   */
  async getOrderStatus(userId: string, exchange: string, orderId: string, symbol: string): Promise<any> {
    const keys = await this.getApiKeys(userId, exchange);

    const response = await this.makeRequest(exchange, `/api/v3/order?symbol=${symbol}&orderId=${orderId}`);

    return {
      orderId: response.orderId,
      symbol: response.symbol,
      status: response.status,
      executedQty: response.executedQty,
      cummulativeQuoteQty: response.cummulativeQuoteQty,
    };
  }

  /**
   * Get exchange config
   */
  getExchangeConfig(exchange: string): ExchangeConfig | null {
    return EXCHANGE_CONFIGS[exchange] || null;
  }

  /**
   * List all supported exchanges
   */
  listExchanges(): string[] {
    return Object.keys(EXCHANGE_CONFIGS);
  }
}

export const exchangeService = new ExchangeService();
