import React from 'react';

interface StatusIndicatorProps {
  chainId?: number;
  fhevmStatus?: string;
  error?: Error | null;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  chainId, 
  fhevmStatus, 
  error 
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'connecting':
      case 'loading':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
        return <span className="text-sm font-bold">✓</span>;
      case 'connecting':
      case 'loading':
        return <span className="text-sm animate-pulse">⟳</span>;
      case 'error':
        return <span className="text-sm font-bold">✗</span>;
      default:
        return <span className="text-sm">⏱</span>;
    }
  };

  return (
    <div className="glass-card p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Connection Status</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Network</span>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${chainId ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-50 border-gray-200'}`}>
              <span className="mr-1">🌐</span>
              Chain ID: {chainId || 'Not connected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">FHEVM</span>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(fhevmStatus)}`}>
              {getStatusIcon(fhevmStatus)}
              <span className="ml-1 capitalize">{fhevmStatus || 'Disconnected'}</span>
            </span>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <span className="text-red-400 mt-0.5 mr-2 flex-shrink-0 font-bold">⚠</span>
              <div>
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
