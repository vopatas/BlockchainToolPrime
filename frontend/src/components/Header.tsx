import React from 'react';

interface HeaderProps {
  userAddress?: string;
  onDisconnect?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userAddress, onDisconnect }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="glass-card p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl mr-3 flex items-center justify-center">
            <span className="text-xl text-white">📖</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Onchain Diary</h1>
            <p className="text-sm text-gray-600">Your private blockchain journal</p>
          </div>
        </div>

        {userAddress && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">
                {formatAddress(userAddress)}
              </span>
            </div>
            
            {onDisconnect && (
              <button
                onClick={onDisconnect}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Disconnect wallet"
              >
                <span className="text-lg">🚪</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
