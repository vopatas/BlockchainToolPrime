import { useEffect, useState } from "react";
import { BrowserProvider, Eip1193Provider, JsonRpcSigner } from "ethers";

export function useMetaMask() {
  const [provider, setProvider] = useState<Eip1193Provider | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>();

  useEffect(() => {
    const eth = (window as any).ethereum as Eip1193Provider | undefined;
    if (!eth) return;
    setProvider(eth);
    eth.request({ method: "eth_chainId" }).then((cid) => {
      setChainId(parseInt(cid as string, 16));
    });
    if (typeof (eth as any).on === "function") {
      (eth as any).on("chainChanged", (cid: string) => setChainId(parseInt(cid, 16)));
      (eth as any).on("accountsChanged", async (accounts: string[]) => {
        if (!accounts || accounts.length === 0) {
          setSigner(undefined);
          return;
        }
        try {
          const ethersProvider = new BrowserProvider(eth);
          const s = await ethersProvider.getSigner();
          setSigner(s);
        } catch (e) {
          setSigner(undefined);
        }
      });
    }
  }, []);

  const connect = async () => {
    if (!provider) return;
    await provider.request?.({ method: "eth_requestAccounts" });
    const ethersProvider = new BrowserProvider(provider);
    const s = await ethersProvider.getSigner();
    setSigner(s);
  };

  return { provider, chainId, signer, connect };
}


