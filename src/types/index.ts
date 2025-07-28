export type BotStatus = 'stopped' | 'running' | 'trading';

export interface TradeData {
  mint: string;
  ticker: string;
  initialMarketCap: number;
  currentMarketCap: number;
  bondingCurve: number;
  profitLoss: number;
  timeRemaining: number;
  buyPrice: number;
  currentPrice: number;
}

export interface AccountData {
  address: string;
  balance: number;
  tokens: Token[];
}

export interface Token {
  mint: string;
  amount: number;
  symbol?: string;
  value?: number;
}

export interface LogEntry {
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface BotSettings {
  minimumBuyAmount: number;
  maxBondingCurveProgress: number;
  sellBondingCurveProgress: number;
  profitTarget1: number;
  profitTarget2: number;
  stopLossLimit: number;
  monitorInterval: number;
  sellTimeout: number;
  tradeDelay: number;
  priorityFee: number;
}