import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Play, Square, RotateCw, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function BotControl() {
  const { isAuthenticated } = useAuth();
  const [botStatus, setBotStatus] = useState<"running" | "stopped">("running");
  const [lastAction, setLastAction] = useState<string>("");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to control the bot.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartBot = () => {
    setBotStatus("running");
    setLastAction("Bot started at " + new Date().toLocaleTimeString());
  };

  const handleStopBot = () => {
    setBotStatus("stopped");
    setLastAction("Bot stopped at " + new Date().toLocaleTimeString());
  };

  const handleRefreshStatus = () => {
    setLastAction("Status refreshed at " + new Date().toLocaleTimeString());
  };

  // Mock strategies data
  const strategies = [
    {
      id: 1,
      name: "Grid Trading",
      status: "active",
      trades: 5,
      winRate: "60%",
      pnl: "$250",
    },
    {
      id: 2,
      name: "DCA Strategy",
      status: "active",
      trades: 3,
      winRate: "67%",
      pnl: "$180",
    },
    {
      id: 3,
      name: "Arbitrage",
      status: "monitoring",
      trades: 0,
      winRate: "-",
      pnl: "$0",
    },
  ];

  // Mock AI agents data
  const aiAgents = [
    {
      id: 1,
      name: "DON Agents",
      count: 12,
      active: 4,
      status: "healthy",
    },
    {
      id: 2,
      name: "PPO Agents",
      count: 4,
      active: 4,
      status: "healthy",
    },
    {
      id: 3,
      name: "SAC Agents",
      count: 4,
      active: 4,
      status: "healthy",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Bot Control</h1>
          <p className="text-muted-foreground">Manage trading bot and strategies</p>
        </div>

        {/* Bot Status */}
        <Card>
          <CardHeader>
            <CardTitle>Bot Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`text-lg font-semibold ${botStatus === "running" ? "text-green-600" : "text-red-600"}`}>
                  {botStatus === "running" ? "🟢 RUNNING" : "🔴 STOPPED"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-lg font-semibold">15h 12m</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Positions</p>
                <p className="text-lg font-semibold">1</p>
              </div>
            </div>

            {lastAction && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">{lastAction}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleStartBot}
                disabled={botStatus === "running"}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Start Bot
              </Button>
              <Button
                onClick={handleStopBot}
                disabled={botStatus === "stopped"}
                variant="destructive"
                className="gap-2"
              >
                <Square className="w-4 h-4" />
                Stop Bot
              </Button>
              <Button
                onClick={handleRefreshStatus}
                variant="outline"
                className="gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Strategies */}
        <Card>
          <CardHeader>
            <CardTitle>Active Strategies</CardTitle>
            <CardDescription>Trading strategies currently running</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategies.map((strategy) => (
                    <TableRow key={strategy.id}>
                      <TableCell className="font-medium">{strategy.name}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            strategy.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {strategy.status === "active" ? "🟢 Active" : "🟡 Monitoring"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{strategy.trades}</TableCell>
                      <TableCell className="text-right">{strategy.winRate}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {strategy.pnl}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* AI Agents Status */}
        <Card>
          <CardHeader>
            <CardTitle>AI Agents Status</CardTitle>
            <CardDescription>Reinforcement learning agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiAgents.map((agent) => (
                <div key={agent.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {agent.active}/{agent.count} agents active
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        agent.status === "healthy"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {agent.status === "healthy" ? "✓ Healthy" : "✗ Error"}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(agent.active / agent.count) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warnings */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="w-5 h-5" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800">
            <ul className="list-disc list-inside space-y-2">
              <li>Ensure API keys are properly configured before starting the bot</li>
              <li>Monitor bot performance regularly to prevent losses</li>
              <li>Set appropriate stop-loss limits for each strategy</li>
              <li>Keep sufficient balance in your exchange accounts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
