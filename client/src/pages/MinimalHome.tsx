import { TrendingUp, TrendingDown, DollarSign, Zap } from 'lucide-react';

export default function MinimalHome() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-zinc-400">Welcome back to your trading dashboard</p>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<DollarSign className="w-5 h-5" />}
          title="Portfolio Value"
          value="$24,580.50"
          change="+2.5%"
          positive={true}
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="24h Gain"
          value="$1,245.30"
          change="+5.3%"
          positive={true}
        />
        <MetricCard
          icon={<Zap className="w-5 h-5" />}
          title="Active Bots"
          value="3"
          change="2 trading"
          positive={true}
        />
        <MetricCard
          icon={<TrendingDown className="w-5 h-5" />}
          title="Win Rate"
          value="68.5%"
          change="+2.1%"
          positive={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Portfolio Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Portfolio Performance</h2>
            <select className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-sm text-zinc-300 hover:text-white transition-colors">
              <option>7 Days</option>
              <option>30 Days</option>
              <option>90 Days</option>
              <option>1 Year</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-around gap-2">
            {[65, 45, 72, 38, 82, 55, 90].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-blue-600 to-blue-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase mb-2">Total Trades</p>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-xs text-green-500 mt-2">↑ 45 this week</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase mb-2">Avg. Return</p>
            <p className="text-2xl font-bold">2.3%</p>
            <p className="text-xs text-green-500 mt-2">↑ Per trade</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase mb-2">Best Day</p>
            <p className="text-2xl font-bold">+12.5%</p>
            <p className="text-xs text-zinc-400 mt-2">Mar 15, 2024</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Trades</h2>
        <div className="space-y-3">
          {[
            { symbol: 'BTC/USDT', type: 'BUY', price: '$42,150', time: '2 min ago', profit: '+$245' },
            { symbol: 'ETH/USDT', type: 'SELL', price: '$2,450', time: '15 min ago', profit: '+$120' },
            { symbol: 'SOL/USDT', type: 'BUY', price: '$98.50', time: '1 hour ago', profit: '+$45' },
          ].map((trade, i) => (
            <div key={i} className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">{trade.symbol}</p>
                  <p className="text-xs text-zinc-500">{trade.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${trade.type === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                  {trade.type}
                </p>
                <p className="text-xs text-green-500">{trade.profit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  change,
  positive,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-zinc-800 rounded-lg text-blue-500">{icon}</div>
      </div>
      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{title}</p>
      <p className="text-2xl font-bold mb-2">{value}</p>
      <p className={`text-xs ${positive ? 'text-green-500' : 'text-red-500'}`}>{change}</p>
    </div>
  );
}
