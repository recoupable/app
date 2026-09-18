import { siteTable } from "./siteTable";
export async function insertSignup(
  siteId: string,
  email: string,
  consentText: string,
) {
  const { error } = await siteTable("site_signups").upsert(
    { site_id: siteId, email: email.toLowerCase(), consent_text: consentText },
    { onConflict: "site_id,email", ignoreDuplicates: true },
  );
  if (error) throw new Error("Could not save signup");
}
