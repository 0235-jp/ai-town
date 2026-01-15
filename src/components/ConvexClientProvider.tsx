import { ReactNode } from 'react';
import { ConvexReactClient, ConvexProvider } from 'convex/react';
// import { ConvexProviderWithClerk } from 'convex/react-clerk';
// import { ClerkProvider, useAuth } from '@clerk/clerk-react';

/**
 * Determines the Convex deployment to use.
 *
 * Uses the same hostname as the current page to support both local and external access.
 */
function convexUrl(): string {
  // Use environment variable if set, otherwise derive from current hostname
  const envUrl = import.meta.env.VITE_CONVEX_URL as string;
  if (envUrl && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  // For self-hosted: use same hostname as current page with Convex port
  return `http://${window.location.hostname}:3210`;
}

const convex = new ConvexReactClient(convexUrl(), { unsavedChangesWarning: false });

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    // <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string}>
    // <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
    <ConvexProvider client={convex}>{children}</ConvexProvider>
    // </ConvexProviderWithClerk>
    // </ClerkProvider>
  );
}
