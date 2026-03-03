import { NEW_API_BASE_URL } from "@/lib/consts";

export const PULSE_API_URL = `${NEW_API_BASE_URL}/api/pulses`;

export type Pulse = {
  id: string | null;
  account_id: string;
  active: boolean;
};

export type PulseResponse = {
  status: "success";
  pulses: Pulse[];
};

export type GetPulseParams = {
  accessToken: string;
};

export async function getPulse({
  accessToken,
}: GetPulseParams): Promise<PulseResponse> {
  const response = await fetch(PULSE_API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get pulse");
  }

  return response.json();
}
