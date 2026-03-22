import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { TrendingUp, TrendingDown, Activity, Zap, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [botRunning, setBotRunning] = useState(false);

  // Fetch trading data
  const tradesQuery = trpc.trading.getTrades.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const backtestQuery = trpc.trading.getBacktestResults.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const portfolioQuery = trpc.trading.getPortfolioSnapshots.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Crypto AI Trader</CardTitle>
            <CardDescription>Automated multi-exchange trading dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Welcome to the Crypto AI Trader Dashboard. Sign in to access your trading portfolio, backtest results, and bot controls.
            </p>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
            >
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate portfolio metrics
  const latestSnapshot = portfolioQuery.data?.[0];
  const totalValue = latestSnapshot ? parseFloat(latestSnapshot.totalValue) : 0;
  const previousSnapshot = portfolioQuery.data?.[1];
  const previousValue = previousSnapshot ? parseFloat(previousSnapshot.totalValue) : 0;
  const dayChange = totalValue - previousValue;
  const dayChangePercent = previousValue > 0 ? (dayChange / previousValue) * 100 : 0;

  const latestBacktest = backtestQuery.data?.[0];
  const profitLoss = latestBacktest ? parseFloat(latestBacktest.profitLoss) : 0;
  const profitLossPercent = latestBacktest ? parseFloat(latestBacktest.profitLossPercent) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trading Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || "Trader"}</p>
          </div>
          <Button
            onClick={() => setBotRunning(!botRunning)}
            variant={botRunning ? "destructive" : "default"}
            size="lg"
            className="gap-2"
          >
            <Activity className="w-4 h-4" />
            {botRunning ? "Stop Bot" : "Start Bot"}
          </Button>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <p className={`text-xs ${dayChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {dayChange >= 0 ? "+" : ""}{dayChange.toFixed(2)} ({dayChangePercent.toFixed(2)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tradesQuery.data?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Latest Backtest P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${profitLoss.toFixed(2)}
              </div>
              <p className={`text-xs ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {profitLossPercent >= 0 ? "+" : ""}{profitLossPercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bot Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${botRunning ? "text-green-600" : "text-gray-600"}`}>
                {botRunning ? "Running" : "Stopped"}
              </div>
              <p className="text-xs text-muted-foreground">
                {botRunning ? "Active" : "Inactive"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Trades
            </CardTitle>
            <CardDescription>Latest trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            {tradesQuery.isLoading ? (
              <p className="text-muted-foreground">Loading trades...</p>
            ) : tradesQuery.data && tradesQuery.data.length > 0 ? (
              <div className="space-y-3">
                {tradesQuery.data.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {trade.side === "BUY" ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{trade.symbol}</p>
                        <p className="text-sm text-muted-foreground">{trade.exchange}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${parseFloat(trade.totalValue).toFixed(2)}</p>
                      <p className={`text-sm ${trade.side === "BUY" ? "text-green-600" : "text-red-600"}`}>
                        {trade.side}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No trades yet</p>
            )}
          </CardContent>
        </Card>

        {/* Backtest Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Backtest Results
            </CardTitle>
            <CardDescription>Historical performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {backtestQuery.isLoading ? (
              <p className="text-muted-foreground">Loading backtest results...</p>
            ) : backtestQuery.data && backtestQuery.data.length > 0 ? (
              <div className="space-y-3">
                {backtestQuery.data.slice(0, 3).map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{result.symbol} ({result.exchange})</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.startDate).toLocaleDateString()} - {new Date(result.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${parseFloat(result.profitLoss) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${parseFloat(result.profitLoss).toFixed(2)}
                      </p>
                      <p className={`text-sm ${parseFloat(result.profitLossPercent) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {parseFloat(result.profitLossPercent) >= 0 ? "+" : ""}{parseFloat(result.profitLossPercent).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No backtest results yet</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Run Backtest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test your trading strategy on historical data
              </p>
              <Button variant="outline" className="w-full">
                Start Backtest
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Configure Bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Adjust trading parameters and strategy settings
              </p>
              <Button variant="outline" className="w-full">
                Configure
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Detailed performance metrics and charts
              </p>
              <Button variant="outline" className="w-full">
                Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
