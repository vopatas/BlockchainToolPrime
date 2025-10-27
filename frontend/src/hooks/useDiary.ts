import { Contract, Eip1193Provider, JsonRpcSigner, ZeroHash, keccak256, toUtf8Bytes } from "ethers";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { OnchainDiaryABI } from "@/abi/OnchainDiaryABI";
import { OnchainDiaryAddresses } from "@/abi/OnchainDiaryAddresses";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface DiaryEntry {
  contentHash: string;
  timestamp: bigint;
  content?: string; // 解密后的内容
  isDecrypting?: boolean;
}

export function useDiary(params: {
  instance: any | undefined;
  chainId: number | undefined;
  signer: JsonRpcSigner | undefined;
  provider: Eip1193Provider | undefined;
}) {
  const { instance, chainId, signer } = params;
  const [handle, setHandle] = useState<string | undefined>();
  const [clear, setClear] = useState<string | bigint | undefined>();
  const [message, setMessage] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  
  // 存储用户输入的原文，用于后续解密验证
  const userInputsRef = useRef<Map<string, string>>(new Map());

  const contractInfo = useMemo(() => {
    if (!chainId) return {} as any;
    const entry = (OnchainDiaryAddresses as any)[String(chainId)];
    return { address: entry?.address as `0x${string}` | undefined, abi: (OnchainDiaryABI as any).abi };
  }, [chainId]);

  const canRefresh = useMemo(() => Boolean(contractInfo.address && signer), [contractInfo.address, signer]);
  const canDecrypt = useMemo(() => Boolean(contractInfo.address && signer && instance && handle && handle !== ZeroHash && !busy), [contractInfo.address, signer, instance, handle, busy]);
  const canWrite = useMemo(() => Boolean(contractInfo.address && signer && instance && !busy && input.length > 0), [contractInfo.address, signer, instance, busy, input]);

  const refresh = useCallback(async () => {
    if (!contractInfo.address || !signer) return;
    const c = new Contract(contractInfo.address, contractInfo.abi, signer);
    const h = await c.getEncryptedTotal(await signer.getAddress());
    setHandle(h);
  }, [contractInfo.address, signer]);

  // 获取所有日记条目
  const fetchEntries = useCallback(async () => {
    if (!contractInfo.address || !signer) return;
    setLoadingEntries(true);
    try {
      const c = new Contract(contractInfo.address, contractInfo.abi, signer);
      const userAddress = await signer.getAddress();
      const rawEntries = await c.getEntries(userAddress);
      
      const formattedEntries: DiaryEntry[] = rawEntries.map((entry: any) => ({
        contentHash: entry.contentHash,
        timestamp: entry.timestamp,
        // 默认不预填充内容，保持加密显示，需手动解密后才显示
      }));
      
      // 按时间戳倒序排列（最新的在前）
      formattedEntries.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      
      setEntries(formattedEntries);
    } catch (e: any) {
      console.error("Failed to fetch entries:", e);
      setMessage(`Failed to fetch entries: ${e.message}`);
    } finally {
      setLoadingEntries(false);
    }
  }, [contractInfo.address, signer]);

  const write = useCallback(async () => {
    if (!contractInfo.address || !signer || !instance || !input) return;
    setBusy(true);
    try {
      const c = new Contract(contractInfo.address, contractInfo.abi, signer);
      const contentHash = keccak256(toUtf8Bytes(input));
      
      // 存储用户输入的原文，用于后续解密
      userInputsRef.current.set(contentHash, input);
      
      const enc = await instance.createEncryptedInput(contractInfo.address, await signer.getAddress()).add32(1).encrypt();
      const tx = await c.writeEntry(contentHash, enc.handles[0], enc.inputProof);
      setMessage(`tx: ${tx.hash}`);
      await tx.wait();
      setMessage(`write ok`);
      await refresh();
      await fetchEntries(); // 刷新日记列表
      setInput(""); // 清空输入框
    } catch (e: any) {
      setMessage(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [contractInfo.address, signer, instance, input, refresh, fetchEntries]);

  const decrypt = useCallback(async () => {
    if (!contractInfo.address || !signer || !instance || !handle || handle === ZeroHash) return;
    setBusy(true);
    try {
      const sig = await FhevmDecryptionSignature.loadOrSign(instance, [contractInfo.address], signer, window.localStorage);
      if (!sig) throw new Error("build signature failed");
      const res = await instance.userDecrypt(
        [{ handle, contractAddress: contractInfo.address }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );
      setClear(res[handle]);
      setMessage("decrypt ok");
    } catch (e: any) {
      setMessage(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [contractInfo.address, signer, instance, handle]);

  // 解密单个日记条目（这里我们使用本地存储的原文，因为实际的加密内容不在链上）
  const decryptEntry = useCallback(async (contentHash: string) => {
    // 检查是否有本地存储的原文
    const localContent = userInputsRef.current.get(contentHash);
    if (localContent) {
      setEntries(prev => prev.map(entry => 
        entry.contentHash === contentHash 
          ? { ...entry, content: localContent }
          : entry
      ));
      return;
    }

    // 如果没有本地存储，显示无法解密的消息
    setEntries(prev => prev.map(entry => 
      entry.contentHash === contentHash 
        ? { ...entry, content: "Content not available (written in another session)" }
        : entry
    ));
  }, []);

  // 当账户(signer)变化时，重置本地缓存并将当前列表恢复为加密显示
  useEffect(() => {
    // 清空本地已缓存的明文，避免误展示其他账号/会话的内容
    userInputsRef.current.clear();
    // 将已加载的条目内容置空，保持加密态
    setEntries(prev => prev.map(e => ({ ...e, content: undefined })));
  }, [signer]);

  return { 
    input, 
    setInput, 
    refresh, 
    decrypt, 
    write, 
    handle, 
    clear, 
    message, 
    canRefresh, 
    canDecrypt, 
    canWrite,
    entries,
    loadingEntries,
    fetchEntries,
    decryptEntry
  };
}


