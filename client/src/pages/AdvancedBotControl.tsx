import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Play, Pause, StopCircle, Settings, TrendingUp, Activity } from 'lucide-react';

export function AdvancedBotControl() {
  const [botStatus, setBotStatus] = useState<'running' | 'paused' | 'stopped'>('running');
  const [selectedStrategy, setSelectedStrategy] = useState('momentum');
  const [strategies, setStrategies] = useState([
    {
      id: 'momentum',
      name: 'Momentum Strategy',
      description: 'SMA Crossover + RSI',
      status: 'active',
      winRate: 62.5,
      trades: 24,
      profit: 1250.5,
    },
    {
      id: 'mean-reversion',
      name: 'Mean Reversion',
      description: 'Bollinger Bands',
      status: 'inactive',
      winRate: 58.3,
      trades: 12,
      profit: 450.2,
    },
    {
      id: 'rsi',
      name: 'RSI Strategy',
      description: 'Relative Strength Index',
      status: 'inactive',
      winRate: 55.0,
      trades: 20,
      profit: 320.8,
    },
  ]);

  const [activePositions, setActivePositions] = useState([
    {
      id: 1,
      symbol: 'BTC/USDT',
      side: 'LONG',
      entryPrice: 42500,
      currentPrice: 43200,
      quantity: 0.5,
      pnl: 350,
      pnlPercent: 1.64,
      stopLoss: 41500,
      takeProfit: 45000,
    },
    {
      id: 2,
      symbol: 'ETH/USDT',
      side: 'LONG',
      entryPrice: 2250,
      currentPrice: 2310,
      quantity: 5,
      pnl: 300,
      pnlPercent: 2.67,
      stopLoss: 2150,
      takeProfit: 2500,
    },
  ]);

  const [parameters, setParameters] = useState({
    riskPerTrade: 2.0,
    maxPositions: 5,
    stopLossPercent: 2.0,
    takeProfitPercent: 5.0,
    timeframe: '1h',
    symbols: 'BTC,ETH,BNB,XRP',
  });

  const handleBotControl = (action: 'start' | 'pause' | 'stop') => {
    if (action === 'start') setBotStatus('running');
    else if (action === 'pause') setBotStatus('paused');
    else setBotStatus('stopped');
  };

  const handleClosePosition = (positionId: number) => {
    setActivePositions(activePositions.filter((p) => p.id !== positionId));
  };

  const handleStrategyToggle = (strategyId: string) => {
    setStrategies(
      strategies.map((s) =>
        s.id === strategyId ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
      )
    );
    setSelectedStrategy(strategyId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bot Control Panel</h1>
          <p className="text-gray-500">Advanced strategy management and position monitoring</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={botStatus === 'running' ? 'default' : botStatus === 'paused' ? 'secondary' : 'destructive'}>
            {botStatus === 'running' ? '🟢 Running' : botStatus === 'paused' ? '🟡 Paused' : '🔴 Stopped'}
          </Badge>
        </div>
      </div>

      {/* Bot Control */}
      <Card>
        <CardHeader>
          <CardTitle>Bot Control</CardTitle>
          <CardDescription>Manage bot execution and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={() => handleBotControl('start')}
              disabled={botStatus === 'running'}
              className="flex items-center gap-2"
            >
              <Play size={18} /> Start Bot
            </Button>
            <Button
              onClick={() => handleBotControl('pause')}
              disabled={botStatus === 'stopped'}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Pause size={18} /> Pause Bot
            </Button>
            <Button
              onClick={() => handleBotControl('stop')}
              disabled={botStatus === 'stopped'}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <StopCircle size={18} /> Stop Bot
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="strategies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="positions">Active Positions</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
        </TabsList>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strategies.map((strategy) => (
              <Card
                key={strategy.id}
                className={`cursor-pointer transition-all ${
                  strategy.status === 'active' ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleStrategyToggle(strategy.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{strategy.name}</CardTitle>
                      <CardDescription>{strategy.description}</CardDescription>
                    </div>
                    <Badge variant={strategy.status === 'active' ? 'default' : 'secondary'}>
                      {strategy.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Win Rate</span>
                    <span className="font-semibold text-green-600">{strategy.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Trades</span>
                    <span className="font-semibold">{strategy.trades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Profit</span>
                    <span className="font-semibold text-green-600">${strategy.profit.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-4">
          {activePositions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <Activity size={32} className="mx-auto mb-2 opacity-50" />
                <p>No active positions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activePositions.map((position) => (
                <Card key={position.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Symbol</p>
                        <p className="font-bold">{position.symbol}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Side</p>
                        <Badge variant={position.side === 'LONG' ? 'default' : 'destructive'}>{position.side}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Entry Price</p>
                        <p className="font-semibold">${position.entryPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Price</p>
                        <p className="font-semibold">${position.currentPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className="font-semibold">{position.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">P&L</p>
                        <p className={`font-bold ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 pb-4 border-b">
                      <div>
                        <p className="text-sm text-gray-500">Stop Loss</p>
                        <p className="font-semibold text-red-600">${position.stopLoss.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Take Profit</p>
                        <p className="font-semibold text-green-600">${position.takeProfit.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleClosePosition(position.id)}>
                        Close Position
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Parameters Tab */}
        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} /> Strategy Parameters
              </CardTitle>
              <CardDescription>Configure bot trading parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Risk Per Trade (%)</label>
                  <input
                    type="number"
                    value={parameters.riskPerTrade}
                    onChange={(e) => setParameters({ ...parameters, riskPerTrade: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Positions</label>
                  <input
                    type="number"
                    value={parameters.maxPositions}
                    onChange={(e) => setParameters({ ...parameters, maxPositions: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stop Loss (%)</label>
                  <input
                    type="number"
                    value={parameters.stopLossPercent}
                    onChange={(e) => setParameters({ ...parameters, stopLossPercent: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Take Profit (%)</label>
                  <input
                    type="number"
                    value={parameters.takeProfitPercent}
                    onChange={(e) => setParameters({ ...parameters, takeProfitPercent: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timeframe</label>
                  <select
                    value={parameters.timeframe}
                    onChange={(e) => setParameters({ ...parameters, timeframe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option>1m</option>
                    <option>5m</option>
                    <option>15m</option>
                    <option>1h</option>
                    <option>4h</option>
                    <option>1d</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Trading Symbols</label>
                  <input
                    type="text"
                    value={parameters.symbols}
                    onChange={(e) => setParameters({ ...parameters, symbols: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="BTC,ETH,BNB"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex items-center gap-2">
                  <TrendingUp size={18} /> Save Parameters
                </Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>

          {/* Risk Warning */}
          <Card className="border-yellow-500 bg-yellow-50">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-yellow-900">Risk Warning</p>
                <p className="text-sm text-yellow-800">
                  Ensure you understand the risks of automated trading. Start with small position sizes and monitor the
                  bot regularly.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
