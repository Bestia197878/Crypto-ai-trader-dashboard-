import { TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

export default function MinimalTrading() {
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');

  const openTrades = [
    {
      id: 1,
      symbol: 'BTC/USDT',
      side: 'BUY',
      amount: '0.5234',
      entryPrice: '$42,100',
      currentPrice: '$42,850',
      profit: '+$386.50',
      profitPercent: '+0.92%',
    },
    {
      id: 2,
      symbol: 'ETH/USDT',
      side: 'SELL',
      amount: '5.2341',
      entryPrice: '$2,450',
      currentPrice: '$2,420',
      profit: '+$155.30',
      profitPercent: '+1.22%',
    },
    {
      id: 3,
      symbol: 'SOL/USDT',
      side: 'BUY',
      amount: '125.5',
      entryPrice: '$95.50',
      currentPrice: '$98.20',
      profit: '+$339.85',
      profitPercent: '+2.83%',
    },
  ];

  const tradeHistory = [
    {
      id: 1,
      symbol: 'BTC/USDT',
      side: 'BUY',
      price: '$41,500',
      amount: '0.2',
      profit: '+$280',
      date: '2 hours ago',
    },
    {
      id: 2,
      symbol: 'ETH/USDT',
      side: 'SELL',
      price: '$2,380',
      amount: '2.5',
      profit: '+$175',
      date: '5 hours ago',
    },
    {
      id: 3,
      symbol: 'SOL/USDT',
      side: 'BUY',
      price: '$92.50',
      amount: '50',
      profit: '+$290',
      date: '1 day ago',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Trading</h1>
        <p className="text-zinc-400">Monitor and manage your active trades</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Open Trades" value={openTrades.length.toString()} />
        <StatCard label="Total P&L" value="+$881.65" positive />
        <StatCard label="Win Rate" value="72.5%" positive />
        <StatCard label="Avg. Return" value="+1.85%" positive />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('open')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeTab === 'open'
              ? 'text-white border-b-2 border-blue-600'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Open Trades ({openTrades.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeTab === 'history'
              ? 'text-white border-b-2 border-blue-600'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          History ({tradeHistory.length})
        </button>
      </div>

      {/* Open Trades */}
      {activeTab === 'open' && (
        <div className="space-y-4">
          {openTrades.map((trade) => (
            <div key={trade.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-lg">{trade.symbol}</p>
                  <p className="text-xs text-zinc-500">
                    {trade.side === 'BUY' ? <Plus className="w-3 h-3 inline mr-1 text-green-500" /> : <Minus className="w-3 h-3 inline mr-1 text-red-500" />}
                    {trade.side} {trade.amount}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-500">{trade.profit}</p>
                  <p className="text-xs text-green-500">{trade.profitPercent}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Entry</p>
                  <p className="font-medium">{trade.entryPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Current</p>
                  <p className="font-medium">{trade.currentPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">P&L</p>
                  <p className="font-medium text-green-500">{trade.profitPercent}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm transition-colors">
                  Edit
                </button>
                <button className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded text-sm text-red-500 transition-colors">
                  Close
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trade History */}
      {activeTab === 'history' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Symbol</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Side</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">P&L</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory.map((trade) => (
                  <tr key={trade.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{trade.symbol}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${trade.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{trade.price}</td>
                    <td className="px-6 py-4 text-sm">{trade.amount}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-500">{trade.profit}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{trade.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-bold ${positive ? 'text-green-500' : 'text-white'}`}>{value}</p>
    </div>
  );
}
