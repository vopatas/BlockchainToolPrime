import React, { useState, useEffect } from "react";
import { useFhevm } from "../fhevm/useFhevm";
import { useMetaMask } from "../providers/useMetaMask";
import { useDiary } from "../hooks/useDiary";
import { ConnectWallet } from "../components/ConnectWallet";
import { Header } from "../components/Header";
import { StatusIndicator } from "../components/StatusIndicator";
import { DiaryWriter } from "../components/DiaryWriter";
import { DiaryStats } from "../components/DiaryStats";
import { DiaryHistory } from "../components/DiaryHistory";

export const App = () => {
  const { provider, chainId, signer, connect } = useMetaMask();
  const [userAddress, setUserAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { instance, status, error } = useFhevm({
    provider,
    chainId,
    enabled: true,
    initialMockChains: { 31337: "http://localhost:8545" },
  });

  const diary = useDiary({ instance, chainId, signer, provider });

  // Get user address when signer is available
  useEffect(() => {
    const getUserAddress = async () => {
      if (signer) {
        try {
          const address = await signer.getAddress();
          setUserAddress(address);
        } catch (error) {
          console.error("Failed to get user address:", error);
        }
      }
    };
    getUserAddress();
  }, [signer]);

  // Auto-refresh diary data when connected
  useEffect(() => {
    if (diary.canRefresh && !diary.handle) {
      diary.refresh();
    }
  }, [diary.canRefresh]);

  // Auto-fetch diary entries when connected
  useEffect(() => {
    if (diary.fetchEntries && signer) {
      diary.fetchEntries();
    }
  }, [diary.fetchEntries, signer]);

  const handleWrite = async () => {
    setIsLoading(true);
    try {
      await diary.write();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrypt = async () => {
    setIsLoading(true);
    try {
      await diary.decrypt();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await diary.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  // Show connection screen if not connected
  if (!signer) {
    return <ConnectWallet onConnect={connect} />;
  }

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto">
      <Header userAddress={userAddress} />
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <DiaryWriter
            input={diary.input}
            setInput={diary.setInput}
            onWrite={handleWrite}
            canWrite={diary.canWrite}
            isLoading={isLoading}
          />
          
          <DiaryStats
            handle={diary.handle}
            clear={diary.clear}
            onRefresh={handleRefresh}
            onDecrypt={handleDecrypt}
            canRefresh={diary.canRefresh}
            canDecrypt={diary.canDecrypt}
            message={diary.message}
            isLoading={isLoading}
          />
        </div>
        
        <div className="xl:col-span-1">
          <StatusIndicator
            chainId={chainId}
            fhevmStatus={status}
            error={error}
          />
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">How it works</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-700">Write your entry</p>
                  <p>Share your daily thoughts and experiences</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-700">Encrypt & store</p>
                  <p>Your entry is encrypted and stored on blockchain</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-700">Access anytime</p>
                  <p>Only you can decrypt and read your entries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <DiaryHistory
            entries={diary.entries}
            loadingEntries={diary.loadingEntries}
            onDecryptEntry={diary.decryptEntry}
            onRefreshEntries={diary.fetchEntries}
          />
        </div>
      </div>
    </div>
  );
};


