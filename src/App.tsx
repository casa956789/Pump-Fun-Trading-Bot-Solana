import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Dashboard from './components/Dashboard';
import TradingControls from './components/TradingControls';
import AccountInfo from './components/AccountInfo';
import TradingLog from './components/TradingLog';
import TokenList from './components/TokenList';
import Settings from './components/Settings';
import { BotStatus, TradeData, AccountData, LogEntry, Token } from './types';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [botStatus, setBotStatus] = useState<BotStatus>('stopped');
  const [accountData, setAccountData] = useState<AccountData>({
    address: '',
    balance: 0,
    tokens: []
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentTrade, setCurrentTrade] = useState<TradeData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to bot server');
    });

    newSocket.on('botStatus', (status: BotStatus) => {
      setBotStatus(status);
    });

    newSocket.on('accountUpdate', (data: AccountData) => {
      setAccountData(data);
    });

    newSocket.on('log', (entry: LogEntry) => {
      setLogs(prev => [...prev.slice(-99), entry]);
    });

    newSocket.on('tradeUpdate', (trade: TradeData) => {
      setCurrentTrade(trade);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const startBot = () => {
    socket?.emit('startBot');
  };

  const stopBot = () => {
    socket?.emit('stopBot');
  };

  const sellAll = () => {
    socket?.emit('sellAll');
  };

  const resetTimer = () => {
    socket?.emit('resetTimer');
  };

  const sellPercentage = (percentage: number) => {
    socket?.emit('sellPercentage', percentage);
  };

  const updateSettings = (settings: any) => {
    socket?.emit('updateSettings', settings);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-pump-500">Pump.fun Trading Bot</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              botStatus === 'running' ? 'bg-green-600' :
              botStatus === 'trading' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              {botStatus.toUpperCase()}
            </div>
          </div>
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'dashboard' ? 'bg-pump-600' : 'hover:bg-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'settings' ? 'bg-pump-600' : 'hover:bg-gray-700'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
      </header>

      <main className="p-6">
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Dashboard currentTrade={currentTrade} botStatus={botStatus} />
              <TradingControls
                botStatus={botStatus}
                onStart={startBot}
                onStop={stopBot}
                onSellAll={sellAll}
                onResetTimer={resetTimer}
                onSellPercentage={sellPercentage}
              />
              <TradingLog logs={logs} />
            </div>
            <div className="space-y-6">
              <AccountInfo accountData={accountData} />
              <TokenList tokens={accountData.tokens} />
            </div>
          </div>
        ) : (
          <Settings onUpdateSettings={updateSettings} />
        )}
      </main>
    </div>
  );
}

export default App;