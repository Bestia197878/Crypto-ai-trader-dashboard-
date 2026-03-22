import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PortfolioPage() {
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const { data: trades } = trpc.trading.getTrades.useQuery();

  // Mock holdings data - 30 USDT total portfolio
  const holdings = [
    { symbol: 'BTC', amount: 0.0005, price: 42500, value: 21.25, change: 5.2 },
    { symbol: 'ETH', amount: 0.005, price: 2250, value: 11.25, change: 3.1 },
    { symbol: 'BNB', amount: 0.02, price: 600, value: 12.00, change: 2.8 },
    { symbol: 'XRP', amount: 1, price: 2.5, value: 2.50, change: -1.2 },
  ];

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-gray-500">Your current holdings and trading history</p>
      </div>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
          <CardDescription>Total value and allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Holdings</p>
              <p className="text-3xl font-bold">{holdings.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">24h Change</p>
              <p className="text-3xl font-bold text-green-600">+2.4%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Holdings</CardTitle>
          <CardDescription>Your cryptocurrency positions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">24h Change</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => (
                <TableRow key={holding.symbol}>
                  <TableCell className="font-medium">{holding.symbol}</TableCell>
                  <TableCell className="text-right">{holding.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${holding.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">${holding.value.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={holding.change > 0 ? 'default' : 'destructive'}>
                      {holding.change > 0 ? '+' : ''}{holding.change}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Sell
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Trade History */}
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <CardDescription>All executed trades</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades?.slice(0, 10).map((trade: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{new Date(trade.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'}>
                      {trade.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{trade.amount}</TableCell>
                  <TableCell className="text-right">${trade.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${(trade.amount * trade.price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={trade.status === 'closed' ? 'default' : 'secondary'}>
                      {trade.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
