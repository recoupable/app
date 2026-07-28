import SetupEntry from "@/components/Onboarding/SetupEntry";

/**
 * `/setup` — the welcome email's "Confirm your roster" CTA target, and the
 * route the authenticated home forwards an incomplete account to. Opens the
 * sequence at the account's DERIVED step rather than assuming step 1
 * (chat#1889); the derived-step resolution needs client state, so the page
 * mounts `SetupEntry`.
 */
export default function SetupPage() {
  return <SetupEntry />;
}
