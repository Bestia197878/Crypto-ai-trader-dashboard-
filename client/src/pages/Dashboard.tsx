import { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { useWebSocket } from '@/hooks/useWebSocket';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Dashboard() {
  const { isConnected, prices, subscribe } = useWebSocket();
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [equityCurve, setEquityCurve] = useState<any[]>([]);
  const [botStatus, setBotStatus] = useState<'running' | 'stopped'>('running');

  const { data: metrics } = trpc.trading.getPortfolioMetrics.useQuery();
  const { data: trades } = trpc.trading.getTrades.useQuery();

  useEffect(() => {
    // Subscribe to major trading pairs
    subscribe(['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT']);
  }, [subscribe]);

  // Generate mock equity curve data
  useEffect(() => {
    const data = [];
    let value = 30; // 30 USDT starting value
    for (let i = 0; i < 30; i++) {
      value += (Math.random() - 0.48) * 1.5; // Proportional volatility
      data.push({
        day: i + 1,
        value: Math.max(value, 25),
        drawdown: Math.random() * 10,
      });
    }
    setEquityCurve(data);
  }, []);

  // Generate mock portfolio allocation
  const allocationData = [
    { name: 'BTC', value: 35 },
    { name: 'ETH', value: 25 },
    { name: 'BNB', value: 15 },
    { name: 'XRP', value: 15 },
    { name: 'Other', value: 10 },
  ];

  // Generate mock performance data
  const performanceData = [
    { month: 'Jan', return: 5.2 },
    { month: 'Feb', return: -2.1 },
    { month: 'Mar', return: 8.5 },
    { month: 'Apr', return: 3.2 },
    { month: 'May', return: 6.8 },
    { month: 'Jun', return: 4.1 },
  ];

  const recentTrades = trades?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Real-time portfolio overview and trading metrics</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </Badge>
          <Button
            onClick={() => setBotStatus(botStatus === 'running' ? 'stopped' : 'running')}
            variant={botStatus === 'running' ? 'destructive' : 'default'}
          >
            {botStatus === 'running' ? 'Stop Bot' : 'Start Bot'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$30.00</div>
            <p className="text-xs text-green-600">+12.5% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.tradeCount || 0}</div>
            <p className="text-xs text-gray-500">Win rate: {metrics?.winRate?.toFixed(1) || 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$3.90</div>
            <p className="text-xs text-gray-500">+13.2% ROI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={botStatus === 'running' ? 'default' : 'secondary'}>
                {botStatus === 'running' ? 'RUNNING' : 'STOPPED'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">Last trade: 2 min ago</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve */}
        <Card>
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
            <CardDescription>Portfolio value over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={equityCurve}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
            <CardDescription>Asset distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Returns */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Returns</CardTitle>
            <CardDescription>Performance by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="return" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Latest 5 executed trades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrades.map((trade: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2 border-b">
                  <div>
                    <p className="font-medium">{trade.symbol}</p>
                    <p className="text-xs text-gray-500">{trade.type.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${trade.price.toFixed(2)}</p>
                    <p className={`text-xs ${trade.type === 'buy' ? 'text-red-600' : 'text-green-600'}`}>
                      {trade.amount} units
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.85</div>
            <p className="text-xs text-gray-500">Risk-adjusted return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-8.5%</div>
            <p className="text-xs text-gray-500">Largest peak-to-trough decline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics?.winRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-gray-500">Percentage of profitable trades</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
