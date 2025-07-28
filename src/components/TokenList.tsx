import React from 'react';
import { Coins, ExternalLink } from 'lucide-react';
import { Token } from '../types';

interface TokenListProps {
  tokens: Token[];
}

const TokenList: React.FC<TokenListProps> = ({ tokens }) => {
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K`;
    }
    return amount.toFixed(2);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <Coins className="w-5 h-5 text-pump-400" />
        <h2 className="text-xl font-bold">Token Holdings</h2>
      </div>

      {tokens.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          No tokens found
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tokens.map((token, index) => (
            <div
              key={token.mint}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {token.symbol || `Token ${index + 1}`}
                  </span>
                  <a
                    href={`https://pump.fun/${token.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pump-400 hover:text-pump-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-gray-400 font-mono truncate">
                  {formatAddress(token.mint)}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-sm">
                  {formatAmount(token.amount)}
                </p>
                {token.value && (
                  <p className="text-xs text-green-400">
                    ${token.value.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenList;