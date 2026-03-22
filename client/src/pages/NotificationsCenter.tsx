import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mail, MessageSquare, Settings, Trash2, Check } from 'lucide-react';

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'TRADE_EXECUTED',
      title: 'BTC/USDT - BUY Order Executed',
      message: 'Successfully bought 0.5 BTC at $43,200',
      timestamp: Date.now() - 5 * 60 * 1000,
      read: false,
      icon: '📈',
    },
    {
      id: 2,
      type: 'RISK_ALERT',
      title: 'Risk Alert: Max Drawdown Exceeded',
      message: 'Portfolio drawdown has exceeded 15% threshold',
      timestamp: Date.now() - 30 * 60 * 1000,
      read: false,
      icon: '⚠️',
    },
    {
      id: 3,
      type: 'BOT_STATUS',
      title: 'Bot Status: Strategy Switched',
      message: 'Active strategy changed from Momentum to Mean Reversion',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      read: true,
      icon: '🔄',
    },
    {
      id: 4,
      type: 'PERFORMANCE',
      title: 'Daily Performance Summary',
      message: 'Today: +2.5% return, 5 trades executed, 80% win rate',
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
      read: true,
      icon: '📊',
    },
  ]);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    telegramNotifications: false,
    tradeExecutionAlerts: true,
    riskAlerts: true,
    dailyPerformanceSummary: true,
    errorAlerts: true,
  });

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications Center</h1>
          <p className="text-gray-500">Manage your alerts and notification preferences</p>
        </div>
        <Badge variant="default" className="text-lg px-3 py-1">
          {unreadCount} Unread
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} /> Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings size={16} /> Preferences
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {/* Notification Controls */}
          <div className="flex gap-2">
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm" disabled={unreadCount === 0}>
              <Check size={16} className="mr-2" /> Mark All as Read
            </Button>
            <Button onClick={handleClearAll} variant="outline" size="sm" disabled={notifications.length === 0}>
              <Trash2 size={16} className="mr-2" /> Clear All
            </Button>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all ${notification.read ? 'opacity-75' : 'bg-blue-50 border-blue-200'}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="text-2xl flex-shrink-0">{notification.icon}</div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg">{notification.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-2">{formatTime(notification.timestamp)}</p>
                          </div>
                          <Badge variant={notification.read ? 'secondary' : 'default'}>
                            {notification.type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteNotification(notification.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-blue-600" />
                  <div>
                    <p className="font-semibold">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive alerts via email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-green-600" />
                  <div>
                    <p className="font-semibold">In-App Notifications</p>
                    <p className="text-sm text-gray-500">Show notifications in the app</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.inAppNotifications}
                  onChange={(e) => setPreferences({ ...preferences, inAppNotifications: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare size={20} className="text-purple-600" />
                  <div>
                    <p className="font-semibold">Telegram Notifications</p>
                    <p className="text-sm text-gray-500">Send alerts to Telegram</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.telegramNotifications}
                  onChange={(e) => setPreferences({ ...preferences, telegramNotifications: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Types</CardTitle>
              <CardDescription>Configure which alerts you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Trade Execution Alerts</p>
                  <p className="text-sm text-gray-500">Notify when trades are executed</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.tradeExecutionAlerts}
                  onChange={(e) => setPreferences({ ...preferences, tradeExecutionAlerts: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Risk Alerts</p>
                  <p className="text-sm text-gray-500">Alert when risk thresholds are exceeded</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.riskAlerts}
                  onChange={(e) => setPreferences({ ...preferences, riskAlerts: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Daily Performance Summary</p>
                  <p className="text-sm text-gray-500">Send daily performance report</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.dailyPerformanceSummary}
                  onChange={(e) => setPreferences({ ...preferences, dailyPerformanceSummary: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Error Alerts</p>
                  <p className="text-sm text-gray-500">Alert when errors occur</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.errorAlerts}
                  onChange={(e) => setPreferences({ ...preferences, errorAlerts: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full">Save Preferences</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
