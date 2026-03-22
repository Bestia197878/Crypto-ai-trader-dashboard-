# CryptoBot v8.1 ULTIMATE - Web Dashboard

A comprehensive web-based dashboard for automated cryptocurrency trading with 20 AI agents (12 RL + 8 LLM).

## Features

- 📊 **Real-time Dashboard** - Live portfolio metrics and trading data
- 💰 **Portfolio Management** - Track holdings and trade history
- 📈 **Advanced Analytics** - Sharpe ratio, max drawdown, win rate analysis
- 🎮 **Bot Control** - Start/stop bot and manage strategies
- ⚙️ **Settings Panel** - Configure trading parameters and API keys
- 🤖 **AI Agents** - 12 RL agents + 8 LLM agents for decision making
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark Theme** - Eye-friendly dark interface

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Charts**: Recharts
- **Deployment**: Docker + Docker Compose

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd cryptobot-web
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Production Build

```bash
npm run build
npm start
```

## Docker Deployment

### Build Docker Image
```bash
docker build -t cryptobot-web .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

Access the application at `http://localhost:3001`

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3001
NODE_ENV=production

# Exchange API Keys
BINANCE_API_KEY=your_key
OKX_API_KEY=your_key
BYBIT_API_KEY=your_key
KUCOIN_API_KEY=your_key

# Notifications
TELEGRAM_BOT_TOKEN=your_token
DISCORD_WEBHOOK_URL=your_webhook
```

### Trading Settings

Configure trading parameters in the Settings page:
- Initial Capital
- Risk Level (LOW, MODERATE, HIGH)
- Max Daily Loss
- Trading Pairs
- Timeframe

## API Endpoints

### Portfolio
- `GET /api/portfolio` - Get portfolio overview
- `GET /api/trades` - Get trade history

### Analytics
- `GET /api/analytics` - Get performance metrics

### Bot Control
- `GET /api/bot/status` - Get bot status
- `POST /api/bot/start` - Start bot
- `POST /api/bot/stop` - Stop bot

### Settings
- `GET /api/settings` - Get current settings
- `POST /api/settings` - Update settings

### Health
- `GET /api/health` - Health check

## Project Structure

```
cryptobot-web/
├── server/
│   └── index.js              # Express server
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   ├── Portfolio.jsx     # Portfolio page
│   │   ├── Analytics.jsx     # Analytics page
│   │   ├── BotControl.jsx    # Bot control page
│   │   └── Settings.jsx      # Settings page
│   ├── App.jsx               # Main app component
│   ├── App.css               # Styling
│   └── main.jsx              # Entry point
├── index.html                # HTML template
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
├── Dockerfile                # Docker image
├── docker-compose.yml        # Docker compose
└── README.md                 # This file
```

## Features in Detail

### Dashboard
- Portfolio value and P&L
- Bot status and uptime
- Daily P&L chart
- Asset distribution pie chart
- Portfolio growth line chart

### Portfolio
- Current holdings with values
- Trade history with P&L
- Trade status (open/closed)

### Analytics
- Sharpe Ratio
- Max Drawdown
- Win Rate
- Profit Factor
- Average Win/Loss
- Best/Worst Trades

### Bot Control
- Start/Stop bot
- View active strategies
- Monitor AI agents status
- 12 RL Agents (DQN, PPO, SAC)
- 8 LLM Agents (DeepSeek, Grok)

### Settings
- Trading parameters
- API keys configuration
- Notification settings
- Trading pairs management

## Performance

- Response time: <100ms
- Chart rendering: <500ms
- Real-time updates: 5-second intervals
- Supports 1000+ trades in history

## Security

- API keys stored in environment variables
- No sensitive data in frontend
- HTTPS recommended for production
- CORS configured for API access

## Troubleshooting

### Port already in use
```bash
# Change port in .env
PORT=3002
```

### API connection errors
- Check if backend server is running
- Verify API endpoint in vite.config.js
- Check CORS configuration

### Docker issues
```bash
# Rebuild image
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Deployment

### Heroku
```bash
git push heroku main
```

### AWS
1. Build Docker image
2. Push to ECR
3. Deploy to ECS

### DigitalOcean
1. Create droplet
2. Install Docker
3. Run docker-compose

### Vercel (Frontend only)
```bash
npm run build
vercel deploy
```

## Support

For issues and questions:
1. Check the documentation
2. Review API endpoints
3. Check browser console for errors
4. Check server logs

## License

MIT License

## Disclaimer

This software is provided as-is for educational purposes. Use at your own risk. The creators are not responsible for any financial losses. Always test with small amounts first.

---

**CryptoBot v8.1 ULTIMATE** - Automated Cryptocurrency Trading with AI
