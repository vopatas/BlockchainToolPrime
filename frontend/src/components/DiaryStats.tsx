import React from 'react';

interface DiaryStatsProps {
  handle?: string;
  clear?: string | bigint;
  onRefresh: () => void;
  onDecrypt: () => void;
  canRefresh: boolean;
  canDecrypt: boolean;
  message?: string;
  isLoading?: boolean;
}

export const DiaryStats: React.FC<DiaryStatsProps> = ({
  handle,
  clear,
  onRefresh,
  onDecrypt,
  canRefresh,
  canDecrypt,
  message,
  isLoading = false
}) => {
  const hasEntries = handle && handle !== "0x0000000000000000000000000000000000000000000000000000000000000000";
  const isDecrypted = clear !== undefined;

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Your Diary Statistics</h3>
        <div className="flex space-x-2">
          <button
            onClick={onRefresh}
            disabled={!canRefresh || isLoading}
            className="btn-secondary text-sm py-2 px-4"
            title="Refresh your diary data"
          >
            <span className={`mr-1 ${isLoading ? 'animate-pulse' : ''}`}>🔄</span>
            Refresh
          </button>
          
          {hasEntries && (
            <button
              onClick={onDecrypt}
              disabled={!canDecrypt || isLoading}
              className="btn-primary text-sm py-2 px-4"
              title="Decrypt your diary entries"
            >
              <span className="mr-1">🔓</span>
              Decrypt
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="status-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Encrypted Handle</p>
              <p className="text-xs text-gray-500 mt-1">
                {hasEntries ? 'Data available' : 'No entries yet'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${hasEntries ? 'bg-green-400' : 'bg-gray-300'}`}></div>
          </div>
          {handle && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono break-all">
              {handle.slice(0, 20)}...{handle.slice(-10)}
            </div>
          )}
        </div>

        <div className="status-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-xs text-gray-500 mt-1">
                {isDecrypted ? 'Decrypted' : 'Encrypted'}
              </p>
            </div>
            <div className="text-right">
              {isDecrypted ? (
                <div className="text-2xl font-bold text-primary-600">
                  {String(clear)}
                </div>
              ) : (
                <div className="text-2xl text-gray-400">
                  🔒
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!hasEntries && (
        <div className="text-center py-8">
          <div className="text-6xl text-gray-300 mb-4">📖</div>
          <h4 className="text-lg font-medium text-gray-600 mb-2">No diary entries yet</h4>
          <p className="text-gray-500">Start writing your first entry to see your statistics here.</p>
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">ℹ️</span>
            <span className="text-sm text-blue-700 font-medium">Status:</span>
            <span className="text-sm text-blue-600 ml-1">{message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
