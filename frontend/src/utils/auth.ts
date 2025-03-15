import { useClerk } from "@clerk/nextjs";

export const useSignOut = () => {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    // Clear any local storage or session data
    window.localStorage.clear();
    window.sessionStorage.clear();

    // Clear any cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Sign out from Clerk
    await signOut();

    // Redirect to home page
    window.location.href = "/";
  };

  return handleSignOut;
};
