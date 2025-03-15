"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ConnectWallet } from "@/components/ConnectWallet";

export default function Home() {
  const router = useRouter();
  const { isSignedIn, user } = useUser(); // Check if the user is signed in and get user data
  const [isMounted, setIsMounted] = useState(false);

  // Ensure the code is run only on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && isSignedIn) {
      // Check if this is the user's first sign-in
      // For example, you could have a `hasCompletedAssessment` flag in your user metadata.
      if (!user?.publicMetadata?.hasCompletedAssessment) {
        router.push("/assessment"); // Redirect to the assessment page
      } else {
        router.push("/dashboard"); // Redirect to the dashboard if they completed the assessment
      }
    }
  }, [isMounted, isSignedIn, router, user]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <SignedOut>
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome to Caregiving Assistant
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to access your personalized dashboard.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <SignInButton>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md hover:bg-blue-700">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-md hover:bg-indigo-700">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {/* Only show this content if the user is signed in */}
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back to NeuroHarmony
          </h1>
          <p className="mt-2 text-gray-600">Connect your wallet to continue</p>
          <div className="mt-6">
            <ConnectWallet />
          </div>
        </div>
      </SignedIn>
    </main>
  );
}
