import { JsonRpcProvider, isAddress, Eip1193Provider } from "ethers";
import { RelayerSDKLoader, FhevmWindowType } from "./RelayerSDKLoader";

export type FhevmInstance = any;

function getChainId(p: Eip1193Provider | string): Promise<number> {
  if (typeof p === "string") {
    const rpc = new JsonRpcProvider(p);
    return rpc.getNetwork().then((n) => Number(n.chainId)).finally(() => rpc.destroy());
  }
  return p.request({ method: "eth_chainId" }).then((cid) => parseInt(cid as string, 16));
}

async function getWeb3Client(rpcUrl: string) {
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    return await rpc.send("web3_clientVersion", []);
  } finally {
    rpc.destroy();
  }
}

async function tryMock(rpcUrl?: string) {
  if (!rpcUrl) return undefined;
  const v = await getWeb3Client(rpcUrl);
  if (typeof v !== "string" || !v.toLowerCase().includes("hardhat")) return undefined;
  const metaRpc = new JsonRpcProvider(rpcUrl);
  try {
    const meta = await metaRpc.send("fhevm_relayer_metadata", []);
    if (!meta || typeof meta !== "object") return undefined;
    const { ACLAddress, InputVerifierAddress, KMSVerifierAddress } = meta;
    if (!ACLAddress?.startsWith("0x") || !InputVerifierAddress?.startsWith("0x") || !KMSVerifierAddress?.startsWith("0x")) return undefined;
    const mock = await import("./mock/fhevmMock");
    return mock.fhevmMockCreateInstance({ rpcUrl, chainId: 31337, metadata: meta });
  } catch {
    return undefined;
  } finally {
    metaRpc.destroy();
  }
}

export async function createFhevmInstance(parameters: {
  provider: Eip1193Provider | string;
  mockChains?: Record<number, string>;
}): Promise<FhevmInstance> {
  const { provider, mockChains } = parameters;
  const chainId = await getChainId(provider);
  const rpcUrl = typeof provider === "string" ? provider : mockChains?.[chainId];

  const mock = await tryMock(rpcUrl);
  if (mock) return mock;

  const loader = new RelayerSDKLoader();
  await loader.load();
  const relayerSDK = (window as unknown as FhevmWindowType).relayerSDK;
  if (!relayerSDK.__initialized__) {
    const ok = await relayerSDK.initSDK();
    if (!ok) throw new Error("initSDK failed");
    relayerSDK.__initialized__ = true;
  }
  const aclAddress = relayerSDK.SepoliaConfig.aclContractAddress;
  if (!isAddress(aclAddress)) throw new Error("invalid acl address");

  const instance = await relayerSDK.createInstance({
    ...relayerSDK.SepoliaConfig,
    network: provider,
  });
  return instance;
}


