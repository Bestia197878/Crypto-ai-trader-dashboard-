import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from "recharts";

export default function Analytics() {
  const { isAuthenticated } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"1M" | "3M" | "6M" | "1Y">("1M");

  // Fetch backtest results
  const backtestQuery = trpc.trading.getBacktestResults.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const tradesQuery = trpc.trading.getTrades.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to view analytics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const backtestResults = backtestQuery.data || [];
  const trades = tradesQuery.data || [];

  // Calculate comprehensive trading metrics
  const winningTrades = trades.filter((t) => t.side === "BUY").length;
  const losingTrades = trades.filter((t) => t.side === "SELL").length;
  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(2) : "0";

  // Calculate profit/loss
  const totalProfit = backtestResults.reduce((sum, r) => sum + parseFloat(r.profitLoss), 0);
  const avgProfit = backtestResults.length > 0 ? (totalProfit / backtestResults.length).toFixed(2) : "0";

  // Calculate Sharpe Ratio (simplified)
  const returns = backtestResults.map((r) => parseFloat(r.profitLoss));
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 0 ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? ((avgReturn / stdDev) * Math.sqrt(252)).toFixed(2) : "0";

  // Calculate Max Drawdown
  let maxDrawdown = 0;
  let peak = 0;
  returns.forEach((ret) => {
    peak = Math.max(peak, ret);
    const drawdown = ((peak - ret) / peak) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });

  // Prepare chart data
  const profitLossData = backtestResults.map((r) => ({
    name: new Date(r.startDate).toLocaleDateString(),
    profit: parseFloat(r.profitLoss),
    winRate: parseFloat(r.winRate),
  }));

  const tradeTypeData = [
    { name: "Buy", value: winningTrades },
    { name: "Sell", value: losingTrades },
  ];

  // Monthly performance data
  const monthlyData = [
    { month: "Jan", return: 5.2, trades: 12 },
    { month: "Feb", return: -2.1, trades: 8 },
    { month: "Mar", return: 8.5, trades: 15 },
    { month: "Apr", return: 3.2, trades: 10 },
    { month: "May", return: 6.8, trades: 14 },
    { month: "Jun", return: 4.1, trades: 11 },
  ];

  // Risk metrics data
  const riskMetrics = [
    { metric: "Sharpe Ratio", value: sharpeRatio, color: "text-blue-600" },
    { metric: "Max Drawdown", value: `${maxDrawdown.toFixed(2)}%`, color: "text-red-600" },
    { metric: "Win Rate", value: `${winRate}%`, color: "text-green-600" },
    { metric: "Profit Factor", value: (totalProfit / Math.abs(totalProfit - totalProfit)).toFixed(2), color: "text-purple-600" },
  ];

  const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Trading performance and risk analysis</p>
          </div>
          <div className="flex gap-2">
            {(["1M", "3M", "6M", "1Y"] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrades}</div>
              <p className="text-xs text-gray-500">+2 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{winRate}%</div>
              <p className="text-xs text-gray-500">Winning trades: {winningTrades}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${totalProfit.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Avg: ${avgProfit}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sharpe Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{sharpeRatio}</div>
              <p className="text-xs text-gray-500">Risk-adjusted return</p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Max Drawdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-red-600`}>{maxDrawdown.toFixed(2)}%</div>
              <p className="text-xs text-gray-500">Peak decline</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Trade Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${avgReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                {avgReturn.toFixed(2)}%
              </div>
              <p className="text-xs text-gray-500">Per trade</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Std Deviation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stdDev.toFixed(2)}</div>
              <p className="text-xs text-gray-500">Return volatility</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Losing Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{losingTrades}</div>
              <p className="text-xs text-gray-500">{((losingTrades / totalTrades) * 100).toFixed(1)}% of total</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>Return percentage by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="return" fill="#3b82f6" name="Return (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Trade Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Trade Type Distribution</CardTitle>
              <CardDescription>Buy vs Sell trades</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tradeTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tradeTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Profit/Loss Over Time */}
        {profitLossData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Profit/Loss Over Time</CardTitle>
              <CardDescription>Historical backtest results</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={profitLossData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit/Loss ($)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Detailed Backtest Results */}
        {backtestResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Backtest Results</CardTitle>
              <CardDescription>Detailed performance metrics by strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backtestResults.slice(0, 5).map((result, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Symbol</p>
                        <p className="font-semibold">{result.symbol}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Timeframe</p>
                        <Badge variant="outline">{result.timeframe}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Profit/Loss</p>
                        <p className={`font-semibold ${parseFloat(result.profitLoss) >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ${parseFloat(result.profitLoss).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Win Rate</p>
                        <p className="font-semibold">{result.winRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Period</p>
                        <p className="text-sm">{new Date(result.startDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
