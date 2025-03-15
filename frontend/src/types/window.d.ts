import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider & {
      on(
        event: "accountsChanged",
        callback: (accounts: string[]) => void,
      ): void;
      on(event: "chainChanged", callback: (chainId: string) => void): void;
      on(
        event: "connect",
        callback: (connectInfo: { chainId: string }) => void,
      ): void;
      on(
        event: "disconnect",
        callback: (error: { code: number; message: string }) => void,
      ): void;
      removeAllListeners(): void;
    };
  }
}
