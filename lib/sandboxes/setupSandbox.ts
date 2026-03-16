import { NEW_API_BASE_URL } from "@/lib/consts";

type SetupSandboxResponse =
  | {
      status: "success";
      runId: string;
    }
  | {
      status: "error";
      error: string;
    };

export async function setupSandbox(accessToken: string): Promise<SetupSandboxResponse> {
  const response = await fetch(`${NEW_API_BASE_URL}/api/sandboxes/setup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to setup sandbox: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as SetupSandboxResponse;
}

