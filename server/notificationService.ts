/**
 * Notification Service for CryptoBot v8.1
 * Handles email, in-app, and Telegram notifications
 */

export type NotificationType = 'TRADE_EXECUTED' | 'RISK_ALERT' | 'BOT_STATUS' | 'PERFORMANCE' | 'ERROR';

export interface Notification {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  channel: 'EMAIL' | 'IN_APP' | 'TELEGRAM';
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  telegramNotifications: boolean;
  tradeExecutionAlerts: boolean;
  riskAlerts: boolean;
  dailyPerformanceSummary: boolean;
  errorAlerts: boolean;
}

/**
 * Email Notification Service
 */
class EmailNotificationService {
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      // Integration with email service (SendGrid, AWS SES, etc.)
      console.log(`[Email] Sending to ${to}: ${subject}`);

      // TODO: Implement actual email sending
      // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     personalizations: [{ to: [{ email: to }] }],
      //     from: { email: 'noreply@cryptobot.ai' },
      //     subject,
      //     content: [{ type: 'text/html', value: body }],
      //   }),
      // });

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  generateTradeExecutionEmail(trade: any): string {
    return `
      <h2>Trade Executed</h2>
      <p><strong>Symbol:</strong> ${trade.symbol}</p>
      <p><strong>Side:</strong> ${trade.side}</p>
      <p><strong>Price:</strong> $${trade.price.toFixed(2)}</p>
      <p><strong>Quantity:</strong> ${trade.quantity}</p>
      <p><strong>Timestamp:</strong> ${new Date(trade.timestamp).toISOString()}</p>
    `;
  }

  generatePerformanceSummaryEmail(stats: any): string {
    return `
      <h2>Daily Performance Summary</h2>
      <p><strong>Date:</strong> ${new Date().toDateString()}</p>
      <p><strong>Total Trades:</strong> ${stats.totalTrades}</p>
      <p><strong>Winning Trades:</strong> ${stats.winningTrades}</p>
      <p><strong>Losing Trades:</strong> ${stats.losingTrades}</p>
      <p><strong>Win Rate:</strong> ${stats.winRate.toFixed(2)}%</p>
      <p><strong>Daily P&L:</strong> $${stats.dailyPnL.toFixed(2)}</p>
      <p><strong>Portfolio Value:</strong> $${stats.portfolioValue.toFixed(2)}</p>
    `;
  }
}

/**
 * Telegram Notification Service
 */
class TelegramNotificationService {
  private botToken: string;
  private apiUrl: string = 'https://api.telegram.org';

  constructor(botToken: string = process.env.TELEGRAM_BOT_TOKEN || '') {
    this.botToken = botToken;
  }

  async sendMessage(chatId: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }

  generateTradeExecutionMessage(trade: any): string {
    return `
<b>🔔 Trade Executed</b>
<b>Symbol:</b> ${trade.symbol}
<b>Side:</b> ${trade.side === 'BUY' ? '📈 BUY' : '📉 SELL'}
<b>Price:</b> $${trade.price.toFixed(2)}
<b>Quantity:</b> ${trade.quantity}
<b>Time:</b> ${new Date(trade.timestamp).toLocaleTimeString()}
    `;
  }

  generateRiskAlertMessage(alert: any): string {
    return `
<b>⚠️ Risk Alert</b>
<b>Type:</b> ${alert.type}
<b>Current Value:</b> ${alert.currentValue}
<b>Threshold:</b> ${alert.threshold}
<b>Action:</b> ${alert.action}
    `;
  }
}

/**
 * In-App Notification Service
 */
class InAppNotificationService {
  private notifications: Map<string, Notification[]> = new Map();

  async createNotification(notification: Notification): Promise<string> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    notification.id = id;

    if (!this.notifications.has(notification.userId)) {
      this.notifications.set(notification.userId, []);
    }

    this.notifications.get(notification.userId)!.push(notification);

    // TODO: Save to database
    // await db.insert(notifications).values(notification);

    return id;
  }

  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.slice(-limit).reverse();
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    const index = userNotifications.findIndex((n) => n.id === notificationId);
    if (index > -1) {
      userNotifications.splice(index, 1);
    }
  }
}

/**
 * Main Notification Service
 */
export class NotificationService {
  private emailService: EmailNotificationService;
  private telegramService: TelegramNotificationService;
  private inAppService: InAppNotificationService;
  private preferences: Map<string, NotificationPreferences> = new Map();

  constructor() {
    this.emailService = new EmailNotificationService();
    this.telegramService = new TelegramNotificationService();
    this.inAppService = new InAppNotificationService();
  }

  /**
   * Set notification preferences
   */
  async setPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    const current = this.preferences.get(userId) || {
      userId,
      emailNotifications: true,
      inAppNotifications: true,
      telegramNotifications: false,
      tradeExecutionAlerts: true,
      riskAlerts: true,
      dailyPerformanceSummary: true,
      errorAlerts: true,
    };

    this.preferences.set(userId, { ...current, ...preferences });

    // TODO: Save to database
    // await db.update(notificationPreferences).set(preferences).where(eq(notificationPreferences.userId, userId));
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    return (
      this.preferences.get(userId) || {
        userId,
        emailNotifications: true,
        inAppNotifications: true,
        telegramNotifications: false,
        tradeExecutionAlerts: true,
        riskAlerts: true,
        dailyPerformanceSummary: true,
        errorAlerts: true,
      }
    );
  }

  /**
   * Send trade execution notification
   */
  async notifyTradeExecution(userId: string, trade: any, userEmail?: string, telegramChatId?: string): Promise<void> {
    const prefs = await this.getPreferences(userId);

    if (!prefs.tradeExecutionAlerts) return;

    const notification: Notification = {
      userId,
      type: 'TRADE_EXECUTED',
      title: `${trade.side} ${trade.symbol}`,
      message: `Executed ${trade.side} of ${trade.quantity} ${trade.symbol} at $${trade.price.toFixed(2)}`,
      data: trade,
      read: false,
      createdAt: new Date(),
      channel: 'IN_APP',
    };

    // In-app notification
    if (prefs.inAppNotifications) {
      await this.inAppService.createNotification(notification);
    }

    // Email notification
    if (prefs.emailNotifications && userEmail) {
      const emailBody = this.emailService.generateTradeExecutionEmail(trade);
      await this.emailService.sendEmail(userEmail, `Trade Executed: ${trade.symbol}`, emailBody);
    }

    // Telegram notification
    if (prefs.telegramNotifications && telegramChatId) {
      const message = this.telegramService.generateTradeExecutionMessage(trade);
      await this.telegramService.sendMessage(telegramChatId, message);
    }
  }

  /**
   * Send risk alert
   */
  async notifyRiskAlert(userId: string, alert: any, userEmail?: string, telegramChatId?: string): Promise<void> {
    const prefs = await this.getPreferences(userId);

    if (!prefs.riskAlerts) return;

    const notification: Notification = {
      userId,
      type: 'RISK_ALERT',
      title: `Risk Alert: ${alert.type}`,
      message: `${alert.type} threshold exceeded. Current: ${alert.currentValue}, Threshold: ${alert.threshold}`,
      data: alert,
      read: false,
      createdAt: new Date(),
      channel: 'IN_APP',
    };

    if (prefs.inAppNotifications) {
      await this.inAppService.createNotification(notification);
    }

    if (prefs.telegramNotifications && telegramChatId) {
      const message = this.telegramService.generateRiskAlertMessage(alert);
      await this.telegramService.sendMessage(telegramChatId, message);
    }
  }

  /**
   * Send daily performance summary
   */
  async sendDailyPerformanceSummary(userId: string, stats: any, userEmail?: string): Promise<void> {
    const prefs = await this.getPreferences(userId);

    if (!prefs.dailyPerformanceSummary) return;

    if (prefs.emailNotifications && userEmail) {
      const emailBody = this.emailService.generatePerformanceSummaryEmail(stats);
      await this.emailService.sendEmail(userEmail, 'Daily Performance Summary', emailBody);
    }
  }

  /**
   * Send error notification
   */
  async notifyError(userId: string, error: any, userEmail?: string): Promise<void> {
    const prefs = await this.getPreferences(userId);

    if (!prefs.errorAlerts) return;

    const notification: Notification = {
      userId,
      type: 'ERROR',
      title: 'Bot Error',
      message: error.message || 'An unexpected error occurred',
      data: error,
      read: false,
      createdAt: new Date(),
      channel: 'IN_APP',
    };

    if (prefs.inAppNotifications) {
      await this.inAppService.createNotification(notification);
    }

    if (prefs.emailNotifications && userEmail) {
      await this.emailService.sendEmail(userEmail, 'Bot Error Alert', `Error: ${error.message}`);
    }
  }

  /**
   * Get user notifications
   */
  async getNotifications(userId: string, limit?: number): Promise<Notification[]> {
    return this.inAppService.getNotifications(userId, limit);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.inAppService.markAsRead(userId, notificationId);
  }

  /**
   * Delete notification
   */
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    await this.inAppService.deleteNotification(userId, notificationId);
  }
}

export const notificationService = new NotificationService();
