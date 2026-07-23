import { redirect } from "next/navigation";

/**
 * `/setup` — the welcome email's "Confirm your roster" CTA target. Sends the
 * user straight into the interactive setup flow at the first step (roster).
 */
export default function SetupPage() {
  redirect("/setup/artists");
}
