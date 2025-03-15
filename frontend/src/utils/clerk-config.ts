export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  appearance: {
    baseTheme: undefined,
  },
  navigate: (to: string) => {
    window.location.href = to;
  },
  afterSignIn: () => {
    window.location.href = "/dashboard";
  },
  afterSignUp: () => {
    window.location.href = "/assessment";
  },
  signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  afterSignOutUrl: "/",
  // CORS and cookie settings
  cookieToken: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  },
  // Development settings
  domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN,
  isSatellite: false,
  frontendApi: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API,
  // Development settings
  developmentOrigin: "http://localhost:3000",
};
