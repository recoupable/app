import { Elysia } from "elysia";
import { getAccountIdFromPrivyToken } from "@/lib/auth/getAccountIdFromPrivyToken";
import { getAccountIdFromApiKey } from "@/lib/supabase/account_api_keys/getAccountIdFromApiKey";

export const authPlugin = new Elysia({ name: "auth-plugin" })
  .derive({as: "global"}, async ({ cookie, request }) => {
    const apiKey = request.headers.get("x-api-key");
    const privyToken = cookie["privy-token"].value as string;
    
    let user: { userId: string; identifier: string } | null = null;

    if (apiKey) {
      try {
        user = {
          userId: await getAccountIdFromApiKey(apiKey),
          identifier: apiKey,
        };
      } catch (error) {
        console.error("Elysia auth apiKey validation failed:", error);
      }
    } else if (privyToken) {
      try {
        const accountId = await getAccountIdFromPrivyToken(privyToken);
        if (accountId) {
          user = {
            userId: accountId,
            identifier: privyToken,
          };
        }
      } catch (error) {
        console.error("Elysia auth privyToken validation failed:", error);
      }
    }

    return { user };
  })
  .macro({
    auth: {
        beforeHandle({ user, status }) {
          if (!user) {
            return status(401, "Authentication required");
          }
        },
    },
  });
