import React from 'react';
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';
import { TradeData, BotStatus } from '../types';

interface DashboardProps {
  currentTrade: TradeData | null;
  botStatus: BotStatus;
}

const Dashboard: React.FC<DashboardProps> = ({ currentTrade, botStatus }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrade) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Current Trade</h2>
        <div className="text-center py-8 text-gray-400">
          {botStatus === 'running' ? 'Searching for trading opportunities...' : 'No active trades'}
        </div>
      </div>
    );
  }

  const profitLossColor = currentTrade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400';
  const profitLossIcon = currentTrade.profitLoss >= 0 ? TrendingUp : TrendingDown;
  const ProfitLossIcon = profitLossIcon;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Current Trade</h2>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            {formatTime(currentTrade.timeRemaining)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-pump-400">{currentTrade.ticker}</h3>
            <p className="text-sm text-gray-400 font-mono">{currentTrade.mint}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Buy Price</p>
              <p className="font-semibold">{formatCurrency(currentTrade.buyPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Price</p>
              <p className="font-semibold">{formatCurrency(currentTrade.currentPrice)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ProfitLossIcon className={`w-5 h-5 ${profitLossColor}`} />
            <span className={`text-lg font-bold ${profitLossColor}`}>
              {currentTrade.profitLoss >= 0 ? '+' : ''}{currentTrade.profitLoss.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Market Cap</span>
              <span className="text-sm font-medium">
                {formatCurrency(currentTrade.currentMarketCap)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Initial: {formatCurrency(currentTrade.initialMarketCap)}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Bonding Curve</span>
              <span className="text-sm font-medium">{currentTrade.bondingCurve}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-pump-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(currentTrade.bondingCurve, 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`https://pump.fun/${currentTrade.mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-pump-400 hover:text-pump-300 transition-colors"
            >
              <Target className="w-4 h-4" />
              <span className="text-sm">View on Pump.fun</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;