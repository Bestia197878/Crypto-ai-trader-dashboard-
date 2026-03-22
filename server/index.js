import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for demo
const mockPortfolio = {
  totalValue: 27500.00,
  totalInvested: 25000.00,
  totalPnL: 2500.00,
  pnlPercent: 10.0,
  trades: 3,
  winRate: 66.7,
  lastUpdate: new Date().toISOString()
};

const mockTrades = [
  {
    id: 1,
    symbol: 'BTC/USDT',
    type: 'BUY',
    price: 45000,
    amount: 0.1,
    total: 4500,
    date: new Date(Date.now() - 86400000).toISOString(),
    pnl: 500,
    status: 'closed'
  },
  {
    id: 2,
    symbol: 'ETH/USDT',
    type: 'BUY',
    price: 2500,
    amount: 1,
    total: 2500,
    date: new Date(Date.now() - 172800000).toISOString(),
    pnl: 250,
    status: 'closed'
  },
  {
    id: 3,
    symbol: 'BTC/USDT',
    type: 'BUY',
    price: 44500,
    amount: 0.05,
    total: 2225,
    date: new Date(Date.now() - 259200000).toISOString(),
    pnl: 1750,
    status: 'open'
  }
];

const mockAnalytics = {
  sharpeRatio: 2.15,
  maxDrawdown: 5.2,
  winRate: 66.7,
  profitFactor: 3.2,
  avgWin: 850,
  avgLoss: 265,
  bestTrade: 1750,
  worstTrade: -150,
  totalTrades: 3,
  winningTrades: 2,
  losingTrades: 1
};

// API Routes

// Portfolio
app.get('/api/portfolio', (req, res) => {
  res.json(mockPortfolio);
});

// Trades
app.get('/api/trades', (req, res) => {
  res.json(mockTrades);
});

// Analytics
app.get('/api/analytics', (req, res) => {
  res.json(mockAnalytics);
});

// Bot Status
app.get('/api/bot/status', (req, res) => {
  res.json({
    status: 'running',
    uptime: Math.floor(Math.random() * 86400),
    lastTrade: new Date(Date.now() - 3600000).toISOString(),
    activePositions: 1,
    nextAction: 'Monitor'
  });
});

// Bot Control
app.post('/api/bot/start', (req, res) => {
  res.json({ success: true, message: 'Bot started' });
});

app.post('/api/bot/stop', (req, res) => {
  res.json({ success: true, message: 'Bot stopped' });
});

// Settings
app.get('/api/settings', (req, res) => {
  res.json({
    initialCapital: 10000,
    riskLevel: 'MODERATE',
    maxDailyLoss: 1000,
    tradingPairs: ['BTC/USDT', 'ETH/USDT'],
    timeframe: '1h'
  });
});

app.post('/api/settings', (req, res) => {
  res.json({ success: true, message: 'Settings updated' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 CryptoBot Web Server running on http://localhost:${PORT}`);
});
