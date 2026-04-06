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
import ApiOverrideSync from "./ApiOverrideSync";
import { AccountOverrideProvider } from "./AccountOverrideProvider";

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
                  <FunnelReportProvider>
                    <ArtistProvider>
                      <SidebarExpansionProvider>
                        <ConversationsProvider>
                          <PaymentProvider>{children}</PaymentProvider>
                        </ConversationsProvider>
                      </SidebarExpansionProvider>
                    </ArtistProvider>
                  </FunnelReportProvider>
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
