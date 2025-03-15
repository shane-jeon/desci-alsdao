import { useUser } from "@clerk/nextjs";
import { useWeb3 } from "../contexts/Web3Context";
import { useEffect, useState } from "react";

export const ConnectWallet = () => {
  const { isSignedIn } = useUser();
  const { account, connectWallet, disconnectWallet, isConnecting, error } =
    useWeb3();
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Clear any cached MetaMask connections when the component mounts
  useEffect(() => {
    if (!isSignedIn && account) {
      disconnectWallet();
    }
  }, [isSignedIn, account, disconnectWallet]);

  const handleConnect = async () => {
    if (isReconnecting) return;

    try {
      setIsReconnecting(true);
      // First disconnect any existing connections
      disconnectWallet();
      // Then try to connect
      await connectWallet();
    } catch (err) {
      console.error("Error connecting wallet:", err);
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {!isSignedIn ? (
        <p className="text-red-500">Please sign in with Clerk first</p>
      ) : (
        <>
          {error && <p className="text-red-500">{error}</p>}
          {account ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
              <button
                onClick={disconnectWallet}
                className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600">
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting || isReconnecting}
              className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-400">
              {isConnecting || isReconnecting
                ? "Connecting..."
                : "Connect Wallet"}
            </button>
          )}
        </>
      )}
    </div>
  );
};
