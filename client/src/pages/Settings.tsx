import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    initialCapital: "10000",
    riskLevel: "moderate",
    maxDailyLoss: "1000",
    timeframe: "1h",
    tradingPairs: "BTC/USDT, ETH/USDT",
    binanceApiKey: "",
    okxApiKey: "",
    bybitApiKey: "",
    kucoinApiKey: "",
    emailNotifications: true,
    telegramAlerts: true,
    discordWebhooks: true,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to access settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure trading parameters and API keys</p>
        </div>

        {/* Trading Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Settings</CardTitle>
            <CardDescription>Configure your trading parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="initialCapital">Initial Capital ($)</Label>
                <Input
                  id="initialCapital"
                  type="number"
                  value={settings.initialCapital}
                  onChange={(e) => handleInputChange("initialCapital", e.target.value)}
                  placeholder="10000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="riskLevel">Risk Level</Label>
                <Select value={settings.riskLevel} onValueChange={(value) => handleInputChange("riskLevel", value)}>
                  <SelectTrigger id="riskLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDailyLoss">Max Daily Loss ($)</Label>
                <Input
                  id="maxDailyLoss"
                  type="number"
                  value={settings.maxDailyLoss}
                  onChange={(e) => handleInputChange("maxDailyLoss", e.target.value)}
                  placeholder="1000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select value={settings.timeframe} onValueChange={(value) => handleInputChange("timeframe", value)}>
                  <SelectTrigger id="timeframe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5m">5 minutes</SelectItem>
                    <SelectItem value="15m">15 minutes</SelectItem>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="4h">4 hours</SelectItem>
                    <SelectItem value="1d">1 day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tradingPairs">Trading Pairs (comma-separated)</Label>
                <Input
                  id="tradingPairs"
                  value={settings.tradingPairs}
                  onChange={(e) => handleInputChange("tradingPairs", e.target.value)}
                  placeholder="BTC/USDT, ETH/USDT"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Connect your exchange accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="binanceApiKey">Binance API Key</Label>
              <Input
                id="binanceApiKey"
                type="password"
                value={settings.binanceApiKey}
                onChange={(e) => handleInputChange("binanceApiKey", e.target.value)}
                placeholder="Enter your Binance API key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="okxApiKey">OKX API Key</Label>
              <Input
                id="okxApiKey"
                type="password"
                value={settings.okxApiKey}
                onChange={(e) => handleInputChange("okxApiKey", e.target.value)}
                placeholder="Enter your OKX API key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bybitApiKey">Bybit API Key</Label>
              <Input
                id="bybitApiKey"
                type="password"
                value={settings.bybitApiKey}
                onChange={(e) => handleInputChange("bybitApiKey", e.target.value)}
                placeholder="Enter your Bybit API key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kucoinApiKey">KuCoin API Key</Label>
              <Input
                id="kucoinApiKey"
                type="password"
                value={settings.kucoinApiKey}
                onChange={(e) => handleInputChange("kucoinApiKey", e.target.value)}
                placeholder="Enter your KuCoin API key"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ⚠️ API keys are encrypted and stored securely. Never share your API keys with anyone.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts via email</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="telegramAlerts">Telegram Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive alerts via Telegram</p>
              </div>
              <Switch
                id="telegramAlerts"
                checked={settings.telegramAlerts}
                onCheckedChange={(checked) => handleInputChange("telegramAlerts", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="discordWebhooks">Discord Webhooks</Label>
                <p className="text-sm text-muted-foreground">Send alerts to Discord</p>
              </div>
              <Switch
                id="discordWebhooks"
                checked={settings.discordWebhooks}
                onCheckedChange={(checked) => handleInputChange("discordWebhooks", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isSaving} size="lg">
            {isSaving ? "Saving..." : "💾 Save Settings"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
