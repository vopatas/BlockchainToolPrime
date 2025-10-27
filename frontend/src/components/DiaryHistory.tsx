import React from 'react';
import { DiaryEntry } from '../hooks/useDiary';

interface DiaryHistoryProps {
  entries: DiaryEntry[];
  loadingEntries: boolean;
  onDecryptEntry: (contentHash: string) => void;
  onRefreshEntries: () => void;
}

export const DiaryHistory: React.FC<DiaryHistoryProps> = ({
  entries,
  loadingEntries,
  onDecryptEntry,
  onRefreshEntries
}) => {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatContentHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const getWordCount = (content: string) => {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Diary History</h2>
        <button
          onClick={onRefreshEntries}
          disabled={loadingEntries}
          className="btn-secondary text-sm py-2 px-4"
          title="Refresh diary entries"
        >
          <span className={`mr-1 ${loadingEntries ? 'animate-pulse' : ''}`}>🔄</span>
          Refresh
        </button>
      </div>

      {loadingEntries ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4 animate-pulse">📖</div>
          <p className="text-gray-500">Loading your diary entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl text-gray-300 mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No diary entries yet</h3>
          <p className="text-gray-500">Start writing your first entry to see it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div key={entry.contentHash} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <span className="mr-1">📅</span>
                    {formatDate(entry.timestamp)}
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <span className="mr-1">🔗</span>
                    Hash: {formatContentHash(entry.contentHash)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    entry.content 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <span className="mr-1">{entry.content ? '🔓' : '🔒'}</span>
                    {entry.content ? 'Decrypted' : 'Encrypted'}
                  </span>
                  {!entry.content && (
                    <button
                      onClick={() => onDecryptEntry(entry.contentHash)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded-lg transition-colors"
                    >
                      <span className="mr-1">🔓</span>
                      Decrypt
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3">
                {entry.content ? (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 font-medium">Content:</span>
                      <span className="text-xs text-gray-400">
                        {getWordCount(entry.content)} words
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-2">🔒</div>
                    <p className="text-sm text-gray-500">
                      Content is encrypted. Click decrypt to view.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Note: Content is only available if written in this session
                    </p>
                  </div>
                )}
              </div>

              {index === 0 && (
                <div className="mt-2 flex items-center text-xs text-blue-600">
                  <span className="mr-1">✨</span>
                  Latest entry
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-blue-500 mt-0.5 mr-2 flex-shrink-0">ℹ️</span>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Privacy & Security</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your diary entries are stored on the blockchain with content hashes only. 
                The actual content is encrypted and only you can decrypt it. 
                Content written in previous sessions may not be available for decryption.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
