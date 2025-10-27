import React, { useState } from 'react';

interface DiaryWriterProps {
  input: string;
  setInput: (value: string) => void;
  onWrite: () => void;
  canWrite: boolean;
  isLoading?: boolean;
}

export const DiaryWriter: React.FC<DiaryWriterProps> = ({
  input,
  setInput,
  onWrite,
  canWrite,
  isLoading = false
}) => {
  const [wordCount, setWordCount] = useState(0);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setWordCount(value.trim().split(/\s+/).filter(word => word.length > 0).length);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="glass-card p-6 mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Write Today's Entry</h2>
        <div className="text-sm text-gray-500 flex items-center">
          <span className="mr-1">📅</span>
          {today}
        </div>
      </div>
      
      <div className="relative">
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="What's on your mind today? Share your thoughts, experiences, or reflections..."
          className="input-field min-h-[200px] resize-none"
          disabled={isLoading}
        />
        
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {wordCount} words
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-1 text-green-500">🔒</span>
          Encrypted & secure
        </div>
        
        <button
          onClick={onWrite}
          disabled={!canWrite || isLoading}
          className="btn-primary"
        >
          {isLoading ? (
            <div className="flex items-center">
              <span className="mr-2 animate-pulse">⟳</span>
              Writing to blockchain...
            </div>
          ) : (
            <div className="flex items-center">
              <span className="mr-2">🚀</span>
              Publish Entry
            </div>
          )}
        </button>
      </div>
      
      {input.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-blue-500 mt-0.5 mr-2 flex-shrink-0">ℹ️</span>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Privacy Notice</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your diary entry will be encrypted before being stored on the blockchain. Only you can decrypt and read your entries.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
