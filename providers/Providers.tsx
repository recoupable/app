"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PrivyProvider from "./PrivyProvider";
import { UserProvider } from "./UserProvder";
import { ArtistProvider } from "./ArtistProvider";
import { ConversationsProvider } from "./ConversationsProvider";
import { FunnelReportProvider } from "./FunnelReportProvider";
import { PaymentProvider } from "./PaymentProvider";
import { SidebarExpansionProvider } from "./SidebarExpansionContext";
import { MiniKitProvider } from "./MiniKitProvider";
import WagmiProvider from "./WagmiProvider";
import { MiniAppProvider } from "./MiniAppProvider";
import { ThemeProvider } from "./ThemeProvider";
import { OrganizationProvider } from "./OrganizationProvider";
import OnboardingGuard from "@/components/Onboarding/OnboardingGuard";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange
    >
      <WagmiProvider>
        <PrivyProvider>
          <MiniKitProvider>
            <MiniAppProvider>
              <UserProvider>
                <OrganizationProvider>
                  <FunnelReportProvider>
                    <ArtistProvider>
                      <OnboardingGuard>
                        <SidebarExpansionProvider>
                          <ConversationsProvider>
                            <PaymentProvider>{children}</PaymentProvider>
                          </ConversationsProvider>
                        </SidebarExpansionProvider>
                      </OnboardingGuard>
                    </ArtistProvider>
                  </FunnelReportProvider>
                </OrganizationProvider>
              </UserProvider>
            </MiniAppProvider>
          </MiniKitProvider>
        </PrivyProvider>
      </WagmiProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default Providers;
