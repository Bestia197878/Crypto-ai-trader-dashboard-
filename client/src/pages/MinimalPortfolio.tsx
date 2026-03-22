import { ArrowUpRight, ArrowDownLeft, MoreVertical } from 'lucide-react';

export default function MinimalPortfolio() {
  const holdings = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: '0.5234',
      value: '$22,150.40',
      change: '+5.2%',
      allocation: 90,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      amount: '5.2341',
      value: '$12,570.50',
      change: '+3.1%',
      allocation: 51,
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      amount: '125.5',
      value: '$12,350.00',
      change: '-1.2%',
      allocation: 50,
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      amount: '5,000',
      value: '$5,000.00',
      change: '0%',
      allocation: 20,
    },
  ];

  const totalValue = 52070.9;
  const totalChange = 2.8;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
        <p className="text-zinc-400">Manage your cryptocurrency holdings</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Total Value</p>
          <p className="text-3xl font-bold mb-2">${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
          <p className="text-sm text-green-500">↑ {totalChange}% today</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Assets</p>
          <p className="text-3xl font-bold mb-2">{holdings.length}</p>
          <p className="text-sm text-zinc-400">Cryptocurrencies</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Diversification</p>
          <p className="text-3xl font-bold mb-2">4</p>
          <p className="text-sm text-zinc-400">Different coins</p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Asset</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Value</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Change</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Allocation</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.symbol} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{holding.symbol}</p>
                      <p className="text-xs text-zinc-500">{holding.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{holding.amount}</td>
                  <td className="px-6 py-4 text-sm font-medium">{holding.value}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${holding.change.includes('-') ? 'text-red-500' : 'text-green-500'}`}>
                      {holding.change.includes('-') ? <ArrowDownLeft className="w-4 h-4 inline mr-1" /> : <ArrowUpRight className="w-4 h-4 inline mr-1" />}
                      {holding.change}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${holding.allocation}%` }} />
                      </div>
                      <span className="text-xs text-zinc-400 w-8 text-right">{holding.allocation}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-zinc-700 rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-zinc-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocation Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">Allocation Breakdown</h2>
        <div className="flex items-end justify-around gap-4 h-64">
          {holdings.map((holding) => (
            <div key={holding.symbol} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full flex items-end justify-center h-48">
                <div
                  className="w-12 bg-gradient-to-t from-blue-600 to-blue-500 rounded-t transition-all hover:from-blue-500 hover:to-blue-400"
                  style={{ height: `${holding.allocation}%` }}
                />
              </div>
              <p className="text-sm font-medium">{holding.symbol}</p>
              <p className="text-xs text-zinc-500">{holding.allocation}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
