import { SignIn } from "@clerk/nextjs";

const web3Config = {
  chainId: 31337, // Hardhat local network
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            formButtonPrimary: "bg-blue-500 hover:bg-blue-600",
            footerActionLink: "text-blue-500 hover:text-blue-600",
          },
          layout: {
            socialButtonsPlacement: "bottom",
            socialButtonsVariant: "blockButton",
          },
        }}
        afterSignInUrl="/dashboard"
      />
    </div>
  );
}
