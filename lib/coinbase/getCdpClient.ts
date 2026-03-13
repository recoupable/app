import { CdpClient } from "@coinbase/cdp-sdk";

let cdp: CdpClient | null = null;

/**
 *
 */
export function getCdpClient(): CdpClient {
  if (!cdp) {
    cdp = new CdpClient();
  }
  return cdp;
}
