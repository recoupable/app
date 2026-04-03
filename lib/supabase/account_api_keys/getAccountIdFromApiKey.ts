import { createHmac } from "crypto";
import serverClient from "@/lib/supabase/serverClient";

const PRIVY_PROJECT_SECRET = process.env.PRIVY_PROJECT_SECRET;

function hashApiKey(rawKey: string): string {
  if (!PRIVY_PROJECT_SECRET) {
    throw new Error("Missing PRIVY_PROJECT_SECRET");
  }

  return createHmac("sha256", PRIVY_PROJECT_SECRET).update(rawKey).digest("hex");
}

export async function getAccountIdFromApiKey(apiKey: string): Promise<string> {
  const keyHash = hashApiKey(apiKey);

  const { data, error } = await serverClient
    .from("account_api_keys")
    .select("account")
    .eq("key_hash", keyHash)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed API key lookup: ${error.message}`);
  }

  const accountId = data?.account;
  if (!accountId) {
    throw new Error("No account found for API key");
  }

  return accountId;
}

export default getAccountIdFromApiKey;
