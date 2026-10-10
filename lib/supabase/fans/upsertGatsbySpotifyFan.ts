import { createHash } from "node:crypto";
import supabase from "@/lib/supabase/serverClient";
/** Match Gatsby's existing fan capture namespace without storing provider tokens. */
export async function upsertGatsbySpotifyFan(profile: {
  id: string;
  email?: string | null;
  display_name?: string | null;
}) {
  const hex = createHash("sha256")
    .update(`GatsbyWebsite1:spotify:${profile.id}`)
    .digest("hex");
  const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
  const { error } = await supabase.from("fans").upsert(
    {
      id,
      clientId: "GatsbyWebsite1",
      email: profile.email || null,
      display_name: profile.display_name || null,
      type: "spotify",
      last_login: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw new Error("Could not save fan");
}
