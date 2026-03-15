import { Account, toAccount } from "viem/accounts";
import { getCdpClient } from "./getCdpClient";

/**
 *
 */
export async function getOrCreatePurchaserAccount(): Promise<Account> {
  const cdpClient = getCdpClient();
  const account = await cdpClient.evm.getOrCreateAccount({
    name: "Purchaser",
  });

  return toAccount(account);
}
