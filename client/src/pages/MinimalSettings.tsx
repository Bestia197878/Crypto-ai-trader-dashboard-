import { Bell, Lock, Eye, ToggleRight, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function MinimalSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    twoFactor: true,
    darkMode: true,
    soundAlerts: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-zinc-400">Manage your account and preferences</p>
      </div>

      {/* Account Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Account</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <SettingItem
            icon={<Lock className="w-5 h-5" />}
            label="Password"
            description="Change your password"
            action={<ChevronRight className="w-5 h-5 text-zinc-500" />}
          />
          <SettingItem
            icon={<Eye className="w-5 h-5" />}
            label="Privacy"
            description="Control who can see your profile"
            action={<ChevronRight className="w-5 h-5 text-zinc-500" />}
          />
          <SettingItem
            icon={<Lock className="w-5 h-5" />}
            label="Two-Factor Authentication"
            description="Add an extra layer of security"
            action={
              <button
                onClick={() => toggleSetting('twoFactor')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  settings.twoFactor ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {settings.twoFactor ? 'Enabled' : 'Disabled'}
              </button>
            }
          />
        </div>
      </div>

      {/* Notifications Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <SettingItem
            icon={<Bell className="w-5 h-5" />}
            label="Email Notifications"
            description="Receive updates via email"
            action={
              <button
                onClick={() => toggleSetting('emailNotifications')}
                className="text-blue-500 hover:text-blue-400 transition-colors"
              >
                <ToggleRight className={`w-6 h-6 ${settings.emailNotifications ? 'text-green-500' : 'text-zinc-600'}`} />
              </button>
            }
          />
          <SettingItem
            icon={<Bell className="w-5 h-5" />}
            label="Push Notifications"
            description="Receive push notifications"
            action={
              <button
                onClick={() => toggleSetting('pushNotifications')}
                className="text-blue-500 hover:text-blue-400 transition-colors"
              >
                <ToggleRight className={`w-6 h-6 ${settings.pushNotifications ? 'text-green-500' : 'text-zinc-600'}`} />
              </button>
            }
          />
          <SettingItem
            icon={<Bell className="w-5 h-5" />}
            label="Sound Alerts"
            description="Play sound for trade alerts"
            action={
              <button
                onClick={() => toggleSetting('soundAlerts')}
                className="text-blue-500 hover:text-blue-400 transition-colors"
              >
                <ToggleRight className={`w-6 h-6 ${settings.soundAlerts ? 'text-green-500' : 'text-zinc-600'}`} />
              </button>
            }
          />
        </div>
      </div>

      {/* Display Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Display</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <SettingItem
            icon={<Eye className="w-5 h-5" />}
            label="Dark Mode"
            description="Use dark theme"
            action={
              <button
                onClick={() => toggleSetting('darkMode')}
                className="text-blue-500 hover:text-blue-400 transition-colors"
              >
                <ToggleRight className={`w-6 h-6 ${settings.darkMode ? 'text-green-500' : 'text-zinc-600'}`} />
              </button>
            }
          />
        </div>
      </div>

      {/* API Keys Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">API Keys</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Connected Exchanges</p>
              <p className="text-sm text-zinc-500">Manage your exchange API keys</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
              Add Key
            </button>
          </div>

          <div className="space-y-3">
            {['Binance', 'OKX', 'Bybit'].map((exchange) => (
              <div key={exchange} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded hover:bg-zinc-800 transition-colors">
                <div>
                  <p className="font-medium text-sm">{exchange}</p>
                  <p className="text-xs text-zinc-500">Connected</p>
                </div>
                <button className="text-zinc-400 hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
        <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4">
          <p className="text-sm text-red-400 mb-4">These actions cannot be undone.</p>
          <button className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded text-red-500 font-medium transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingItem({
  icon,
  label,
  description,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="text-zinc-500">{icon}</div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
