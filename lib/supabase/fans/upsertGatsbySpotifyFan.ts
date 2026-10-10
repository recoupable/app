import { v5 as uuidv5 } from "uuid";
import supabase from "@/lib/supabase/serverClient";
/** Match Gatsby's existing fan capture namespace without storing provider tokens. */
export async function upsertGatsbySpotifyFan(profile: {
  id: string;
  email?: string | null;
  display_name?: string | null;
}) {
  const id = uuidv5(`GatsbyWebsite1:spotify:${profile.id}`, uuidv5.URL);
  const { error } = await supabase.from("fans").upsert(
    {
      id,
      clientId: "GatsbyWebsite1",
      ...(profile.email ? { email: profile.email } : {}),
      ...(profile.display_name ? { display_name: profile.display_name } : {}),
      type: "spotify",
      last_login: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw new Error("Could not save fan");
}
