import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
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
        afterSignUpUrl="/assessment"
      />
    </div>
  );
}
