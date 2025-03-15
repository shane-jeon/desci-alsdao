import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkConfig } from "@/utils/clerk-config";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...clerkConfig}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
