"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PrivyProvider from "./PrivyProvider";
import { UserProvider } from "./UserProvder";
import { ArtistProvider } from "./ArtistProvider";
import { ConversationsProvider } from "./ConversationsProvider";
import { PaymentProvider } from "./PaymentProvider";
import { MiniKitProvider } from "./MiniKitProvider";
import WagmiProvider from "./WagmiProvider";
import { MiniAppProvider } from "./MiniAppProvider";
import { ThemeProvider } from "./ThemeProvider";
import { OrganizationProvider } from "./OrganizationProvider";
import ApiOverrideSync from "./ApiOverrideSync";
import { AccountOverrideProvider } from "./AccountOverrideProvider";
import { UpgradePromptProvider } from "./UpgradePromptProvider";
import CreditsUpgradePrompt from "@/components/UpgradePrompt/CreditsUpgradePrompt";
import PlanLimitUpgradeModal from "@/components/UpgradePrompt/PlanLimitUpgradeModal";
import CheckoutClaimSync from "@/components/Checkout/CheckoutClaimSync";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ApiOverrideSync />
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange
    >
      <WagmiProvider>
        <PrivyProvider>
          <AccountOverrideProvider>
          <MiniKitProvider>
            <MiniAppProvider>
              <UserProvider>
                <OrganizationProvider>
                  <ArtistProvider>
                    <ConversationsProvider>
                      <PaymentProvider>
                        <CheckoutClaimSync />
                        <UpgradePromptProvider>
                          {children}
                          <CreditsUpgradePrompt />
                          <PlanLimitUpgradeModal />
                        </UpgradePromptProvider>
                      </PaymentProvider>
                    </ConversationsProvider>
                  </ArtistProvider>
                </OrganizationProvider>
              </UserProvider>
            </MiniAppProvider>
          </MiniKitProvider>
        </AccountOverrideProvider>
        </PrivyProvider>
      </WagmiProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default Providers;
