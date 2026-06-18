"use client";

import { PrivyProvider as Privy } from "@privy-io/react-auth";

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vercel automatically provides different values for NEXT_PUBLIC_PRIVY_APP_ID
  // based on environment (Production vs Preview/Development)
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // Validate app ID is present
  if (!appId) {
    console.error('❌ Missing Privy app ID. Check environment variables:', {
      hasAppId: !!process.env.NEXT_PUBLIC_PRIVY_APP_ID,
      vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV
    });
    throw new Error('Missing required NEXT_PUBLIC_PRIVY_APP_ID environment variable');
  }

  return (
    <Privy
      appId={appId}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#003199",
          logo: "/Recoup_Icon_Wordmark_Black.svg",
        },
        loginMethods: ["email"],
        // v3 moved createOnLogin under a per-chain key (was top-level in v1/v2).
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </Privy>
  );
}
