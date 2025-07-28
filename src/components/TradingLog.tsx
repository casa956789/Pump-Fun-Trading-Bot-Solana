import React, { useEffect, useRef } from 'react';
import { ScrollText, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { LogEntry } from '../types';

interface TradingLogProps {
  logs: LogEntry[];
}

const TradingLog: React.FC<TradingLogProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-300';
      case 'warning':
        return 'text-yellow-300';
      case 'error':
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <ScrollText className="w-5 h-5 text-pump-400" />
        <h2 className="text-xl font-bold">Trading Log</h2>
        <span className="text-sm text-gray-400">({logs.length} entries)</span>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No log entries yet
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-gray-500 text-xs mt-0.5 min-w-0 flex-shrink-0">
                  {formatTime(log.timestamp)}
                </span>
                <div className="flex-shrink-0 mt-0.5">
                  {getLogIcon(log.type)}
                </div>
                <span className={`${getLogColor(log.type)} break-words`}>
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingLog;