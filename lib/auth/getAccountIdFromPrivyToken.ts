import { PrivyClient } from "@privy-io/node";
import getAccountDetailsByEmails from "@/lib/supabase/account_emails/getAccountDetailsByEmails";

const PRIVY_APP_ID = process.env.PRIVY_APP_ID || process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_PROJECT_SECRET = process.env.PRIVY_PROJECT_SECRET;
const PRIVY_JWT_VERIFICATION_KEY = process.env.PRIVY_JWT_VERIFICATION_KEY;

const privyClient =
  PRIVY_APP_ID && PRIVY_PROJECT_SECRET && PRIVY_JWT_VERIFICATION_KEY
    ? new PrivyClient({
        appId: PRIVY_APP_ID,
        appSecret: PRIVY_PROJECT_SECRET,
        jwtVerificationKey: Buffer.from(PRIVY_JWT_VERIFICATION_KEY, "base64").toString("utf8"),
      })
    : null;

export async function getAccountIdFromPrivyToken(privyToken: string): Promise<string> {
  if (!privyClient) {
    throw new Error("Privy client is not configured");
  }

  const verified = await privyClient.utils().auth().verifyAccessToken(privyToken);
  const privyUser = await privyClient.users()._get(verified.user_id);
  const email = privyUser.linked_accounts?.find((account) => account.type === "email")?.address;

  if (!email) {
    throw new Error("No email found in Privy user");
  }

  const accountDetails = await getAccountDetailsByEmails([email]);
  const accountId = accountDetails[0]?.account_id;

  if (!accountId) {
    throw new Error("No account found for Privy user email");
  }

  return accountId;
}

export default getAccountIdFromPrivyToken;
