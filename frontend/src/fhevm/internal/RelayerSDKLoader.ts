export const SDK_CDN_URL =
  "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs";

export type FhevmWindowType = Window & {
  relayerSDK: any & { __initialized__?: boolean };
};

export class RelayerSDKLoader {
  load(): Promise<void> {
    if (typeof window === "undefined") return Promise.reject(new Error("browser only"));
    if ("relayerSDK" in window) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${SDK_CDN_URL}"]`);
      if (existing) { resolve(); return; }
      const s = document.createElement("script");
      s.src = SDK_CDN_URL;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("load relayer sdk failed"));
      document.head.appendChild(s);
    });
  }
}


