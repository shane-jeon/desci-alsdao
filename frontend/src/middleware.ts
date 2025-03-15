import { clerkMiddleware } from "@clerk/nextjs/server";

// Apply Clerk middleware to all requests
export default clerkMiddleware();

// Configure middleware to run on all paths except static files
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/webhook (Clerk webhook)
     * 2. Static files
     * 3. _next files (Next.js internals)
     */
    "/((?!api/webhook|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
