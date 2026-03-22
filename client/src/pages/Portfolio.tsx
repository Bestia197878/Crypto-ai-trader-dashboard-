import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function Portfolio() {
  const { isAuthenticated } = useAuth();

  // Fetch portfolio data
  const tradesQuery = trpc.trading.getTrades.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const portfolioQuery = trpc.trading.getPortfolioSnapshots.useQuery(undefined, {
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
            <p>Please sign in to view your portfolio.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trades = tradesQuery.data || [];
  const portfolioSnapshots = portfolioQuery.data || [];

  // Calculate current holdings
  const holdings = new Map<string, { amount: number; value: number; price: number }>();
  
  trades.forEach((trade) => {
    const key = trade.symbol;
    const amount = parseFloat(trade.amount);
    const price = parseFloat(trade.price);
    const value = parseFloat(trade.totalValue);

    if (!holdings.has(key)) {
      holdings.set(key, { amount: 0, value: 0, price: 0 });
    }

    const holding = holdings.get(key)!;
    if (trade.side === "BUY") {
      holding.amount += amount;
      holding.value += value;
    } else {
      holding.amount -= amount;
      holding.value -= value;
    }
    holding.price = price;
  });

  const totalPortfolioValue = Array.from(holdings.values()).reduce(
    (sum, h) => sum + h.value,
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">View your current holdings and trade history</p>
        </div>

        {/* Current Holdings */}
        <Card>
          <CardHeader>
            <CardTitle>Current Holdings</CardTitle>
            <CardDescription>Total Portfolio Value: ${totalPortfolioValue.toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">% of Portfolio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(holdings.entries()).map(([symbol, holding]) => (
                    <TableRow key={symbol}>
                      <TableCell className="font-medium">{symbol}</TableCell>
                      <TableCell className="text-right">{holding.amount.toFixed(4)}</TableCell>
                      <TableCell className="text-right">${holding.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${holding.value.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {((holding.value / totalPortfolioValue) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Trade History */}
        <Card>
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>All executed trades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No trades yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    trades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-medium">{trade.symbol}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              trade.side === "BUY"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {trade.side}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">${parseFloat(trade.price).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{parseFloat(trade.amount).toFixed(4)}</TableCell>
                        <TableCell className="text-right">${parseFloat(trade.totalValue).toFixed(2)}</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell>{new Date(trade.executedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              trade.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : trade.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {trade.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
