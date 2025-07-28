import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw } from 'lucide-react';
import { BotSettings } from '../types';

interface SettingsProps {
  onUpdateSettings: (settings: BotSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ onUpdateSettings }) => {
  const [settings, setSettings] = useState<BotSettings>({
    minimumBuyAmount: 0.015,
    maxBondingCurveProgress: 10,
    sellBondingCurveProgress: 15,
    profitTarget1: 1.25,
    profitTarget2: 1.25,
    stopLossLimit: 0.90,
    monitorInterval: 5000,
    sellTimeout: 120000,
    tradeDelay: 90000,
    priorityFee: 0.0003
  });

  const handleInputChange = (key: keyof BotSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    onUpdateSettings(settings);
  };

  const handleReset = () => {
    setSettings({
      minimumBuyAmount: 0.015,
      maxBondingCurveProgress: 10,
      sellBondingCurveProgress: 15,
      profitTarget1: 1.25,
      profitTarget2: 1.25,
      stopLossLimit: 0.90,
      monitorInterval: 5000,
      sellTimeout: 120000,
      tradeDelay: 90000,
      priorityFee: 0.0003
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-pump-400" />
            <h2 className="text-xl font-bold">Bot Settings</h2>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleReset} className="btn-secondary flex items-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-pump-400">Trading Parameters</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum Buy Amount (SOL)
              </label>
              <input
                type="number"
                step="0.001"
                value={settings.minimumBuyAmount}
                onChange={(e) => handleInputChange('minimumBuyAmount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pump-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Bonding Curve Progress (%)
              </label>
              <input
                type="number"
                value={settings.maxBondingCurveProgress}
                onChange={(e) => handleInputChange('maxBondingCurveProgress', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pump-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sell Bonding Curve Progress (%)
              </label>
              <input
                type="number"
                value={settings.sellBondingCurveProgress}
                onChange={(e) => handleInputChange('sellBondingCurveProgress', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pump-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority Fee (SOL)
              </label>
              <input
                type="number"
                step="0.0001"
                value={settings.priorityFee}
                onChange={(e) => handleInputChange('priorityFee', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pump-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-pump-400">Risk Management</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Profit Target (multiplier)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.profitTarget1}
                onChange={(e) => handleInputChange('profitTarget1', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pump-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Second Profit Target (multiplier)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.profitTarget2}
                onChange={(e) => handleInputChange('profitTarget2', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pump-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stop Loss Limit (multiplier)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.stopLossLimit}
                onChange={(e) => handleInputChange('stopLossLimit', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pump-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-pump-400 mb-4">Timing Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Monitor Interval (ms)
              </label>
              <input
                type="number"
                value={settings.monitorInterval}
                onChange={(e) => handleInputChange('monitorInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pump-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sell Timeout (ms)
              </label>
              <input
                type="number"
                value={settings.sellTimeout}
                onChange={(e) => handleInputChange('sellTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pump-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trade Delay (ms)
              </label>
              <input
                type="number"
                value={settings.tradeDelay}
                onChange={(e) => handleInputChange('tradeDelay', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-pump-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-300">
            <strong>Warning:</strong> Changing these settings will affect the bot's trading behavior. 
            Make sure you understand the implications before modifying values. 
            Settings are applied immediately when saved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;