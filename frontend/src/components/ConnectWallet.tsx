import React from 'react';

interface ConnectWalletProps {
  onConnect: () => void;
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center animate-fade-in">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl text-white">📖</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Onchain Diary</h1>
          <p className="text-gray-600">Your private thoughts, secured on blockchain</p>
        </div>
        
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Features</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-green-500 mr-2 font-bold">✓</span>
                Encrypted diary entries
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2 font-bold">✓</span>
                Immutable blockchain storage
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2 font-bold">✓</span>
                Complete privacy control
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onConnect}
          className="btn-primary w-full text-lg py-4 mb-4"
        >
          <div className="flex items-center justify-center">
            <span className="text-2xl mr-2">🦊</span>
            Connect MetaMask Wallet
          </div>
        </button>
        
        <p className="text-xs text-gray-500">
          Make sure you have MetaMask installed and connected to the correct network
        </p>
      </div>
    </div>
  );
};
