import { useEffect, useRef, useState } from "react";
import { createFhevmInstance } from "./internal/fhevm";
import type { Eip1193Provider } from "ethers";

export type FhevmGoState = "idle" | "loading" | "ready" | "error";

export function useFhevm(parameters: {
  provider: Eip1193Provider | string | undefined;
  chainId: number | undefined;
  enabled?: boolean;
  initialMockChains?: Readonly<Record<number, string>>;
}) {
  const { provider, enabled = true, initialMockChains } = parameters;
  const [instance, setInstance] = useState<any>();
  const [status, setStatus] = useState<FhevmGoState>("idle");
  const [error, setError] = useState<Error | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || !provider) {
      setInstance(undefined);
      setStatus("idle");
      setError(undefined);
      return;
    }
    const ac = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ac;
    setStatus("loading");
    setError(undefined);
    createFhevmInstance({ provider, mockChains: initialMockChains as Record<number, string> | undefined })
      .then((i) => { if (!ac.signal.aborted) { setInstance(i); setStatus("ready"); } })
      .catch((e) => { if (!ac.signal.aborted) { setError(e); setStatus("error"); } });
    return () => ac.abort();
  }, [provider, enabled]);

  return { instance, status, error };
}


