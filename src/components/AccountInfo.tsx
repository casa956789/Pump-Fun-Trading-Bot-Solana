import React from 'react';
import { Wallet, Copy } from 'lucide-react';
import { AccountData } from '../types';

interface AccountInfoProps {
  accountData: AccountData;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ accountData }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Not connected';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const totalTokenValue = accountData.tokens.reduce((sum, token) => sum + (token.value || 0), 0);

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <Wallet className="w-5 h-5 text-pump-400" />
        <h2 className="text-xl font-bold">Account Info</h2>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm">{formatAddress(accountData.address)}</span>
            {accountData.address && (
              <button
                onClick={() => copyToClipboard(accountData.address)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">SOL Balance</p>
            <p className="text-lg font-semibold">{accountData.balance.toFixed(4)} SOL</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Token Count</p>
            <p className="text-lg font-semibold">{accountData.tokens.length}</p>
          </div>
        </div>

        {totalTokenValue > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-1">Est. Token Value</p>
            <p className="text-lg font-semibold text-green-400">
              ${totalTokenValue.toFixed(2)}
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Status</span>
            <span className={`font-medium ${
              accountData.balance > 0.01 ? 'text-green-400' : 'text-red-400'
            }`}>
              {accountData.balance > 0.01 ? 'Ready to Trade' : 'Low Balance'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;