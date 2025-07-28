import React from 'react';
import { Play, Square, RotateCcw, AlertTriangle } from 'lucide-react';
import { BotStatus } from '../types';

interface TradingControlsProps {
  botStatus: BotStatus;
  onStart: () => void;
  onStop: () => void;
  onSellAll: () => void;
  onResetTimer: () => void;
  onSellPercentage: (percentage: number) => void;
}

const TradingControls: React.FC<TradingControlsProps> = ({
  botStatus,
  onStart,
  onStop,
  onSellAll,
  onResetTimer,
  onSellPercentage
}) => {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Trading Controls</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Bot Control</h3>
          {botStatus === 'stopped' ? (
            <button
              onClick={onStart}
              className="w-full btn-success flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Bot</span>
            </button>
          ) : (
            <button
              onClick={onStop}
              className="w-full btn-danger flex items-center justify-center space-x-2"
            >
              <Square className="w-4 h-4" />
              <span>Stop Bot</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Trade Actions</h3>
          <button
            onClick={onResetTimer}
            disabled={botStatus !== 'trading'}
            className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Timer</span>
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Partial Sells</h3>
          <div className="space-y-1">
            <button
              onClick={() => onSellPercentage(25)}
              disabled={botStatus !== 'trading'}
              className="w-full btn-secondary text-xs py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sell 25%
            </button>
            <button
              onClick={() => onSellPercentage(50)}
              disabled={botStatus !== 'trading'}
              className="w-full btn-secondary text-xs py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sell 50%
            </button>
            <button
              onClick={() => onSellPercentage(75)}
              disabled={botStatus !== 'trading'}
              className="w-full btn-secondary text-xs py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sell 75%
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Emergency</h3>
          <button
            onClick={onSellAll}
            className="w-full btn-danger flex items-center justify-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Sell All</span>
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-300">
          <strong>Note:</strong> Trade actions are only available when the bot is actively trading. 
          Emergency sell all is always available to liquidate all SPL tokens.
        </p>
      </div>
    </div>
  );
};

export default TradingControls;