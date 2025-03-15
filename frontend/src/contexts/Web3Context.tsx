import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useUser } from "@clerk/nextjs";

// Hardhat local network configuration
const EXPECTED_CHAIN_ID = 31337;
const EXPECTED_CHAIN_NAME = "Hardhat Local";
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545";

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnecting: false,
  error: null,
});

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useUser();

  const setupProvider = async () => {
    if (!window.ethereum) return null;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      console.log("Connected to network:", network.name);

      // Check if we're on the correct network
      if (network.chainId !== BigInt(EXPECTED_CHAIN_ID)) {
        try {
          // Try to switch to the correct network
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}`,
                  chainName: EXPECTED_CHAIN_NAME,
                  rpcUrls: [RPC_URL],
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      return provider;
    } catch (err) {
      console.error("Error setting up provider:", err);
      return null;
    }
  };

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum || !isSignedIn) return;

      try {
        const provider = await setupProvider();
        if (!provider) return;

        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          setAccount(accounts[0].address);
          setProvider(provider);
          setSigner(signer);
          console.log("Restored existing connection:", accounts[0].address);
        }
      } catch (err) {
        console.error("Error checking existing connection:", err);
      }
    };

    checkConnection();
  }, [isSignedIn]);

  const connectWallet = async () => {
    if (!isSignedIn) {
      setError("Please sign in with Clerk first");
      return;
    }

    if (!window.ethereum) {
      setError("MetaMask is not installed");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = await setupProvider();
      if (!provider) {
        throw new Error("Failed to setup provider");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const signer = await provider.getSigner();
      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      console.log("Connected to wallet:", accounts[0]);

      // Setup event listeners
      window.ethereum.on("accountsChanged", (newAccounts: string[]) => {
        console.log("Accounts changed:", newAccounts);
        if (newAccounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(newAccounts[0]);
        }
      });

      window.ethereum.on("chainChanged", () => {
        console.log("Chain changed, reloading...");
        window.location.reload();
      });

      window.ethereum.on("disconnect", () => {
        console.log("MetaMask disconnected");
        disconnectWallet();
      });
    } catch (err) {
      console.error("Error connecting to MetaMask:", err);
      setError("Failed to connect to MetaMask");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (window.ethereum) {
      window.ethereum.removeAllListeners();
    }
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setError(null);
    console.log("Wallet disconnected");
  };

  // Clean up listeners on unmount
  useEffect(() => {
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
        isConnecting,
        error,
      }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
