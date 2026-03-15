import createAccount from "./accounts/createAccount";
import createAccountInfo from "./artist/createAccountInfo";
import getArtistById from "./artist/getArtistById";
import associateArtistWithAccount from "./artist/associateArtistWithAccount";
import insertAccountWorkspaceId from "./account_workspace_ids/insertAccountWorkspaceId";
import { addArtistToOrganization } from "./artist_organization_ids/addArtistToOrganization";

/**
 * Create a new account in the database and associate it with an owner account
 *
 * @param name - Name of the account to create
 * @param account_id - ID of the owner account that will have access
 * @param isWorkspace - If true, creates a workspace; if false, creates an artist (default)
 * @param organizationId - Optional organization ID to link the new artist to
 * @returns Created account object or null if creation failed
 */
export async function createArtistInDb(
  name: string,
  account_id: string,
  isWorkspace: boolean = false,
  organizationId?: string | null,
) {
  try {
    // Step 1: Create the account (no account_type needed)
    const account = await createAccount(name);
    if (!account) return null;

    // Step 2: Create account info for the account
    const infoCreated = await createAccountInfo(account.id);
    if (!infoCreated) return null;

    // Step 3: Get the full account data
    const artist = await getArtistById(account.id);
    if (!artist) return null;

    // Step 4: Associate the account with the owner via the appropriate join table
    if (isWorkspace) {
      // For workspaces, add to account_workspace_ids
      const workspaceLinked = await insertAccountWorkspaceId(account_id, account.id);
      if (!workspaceLinked) return null;
    } else {
      // For artists, add to account_artist_ids
      const associated = await associateArtistWithAccount(account_id, account.id);
      if (!associated) return null;
    }

    // Step 5: Link to organization if provided
    if (organizationId) {
      await addArtistToOrganization(account.id, organizationId);
    }

    // Build return object by explicitly picking fields
    // This avoids fragile spread-order dependencies where account_info.id
    // could accidentally overwrite accounts.id
    const accountInfo = artist.account_info?.[0];

    return {
      // Core account fields from accounts table
      id: artist.id,
      account_id: artist.id, // Alias used by ArtistRecord type
      name: artist.name,
      isWorkspace, // Return this so UI knows what type it is
      created_at: artist.created_at,
      updated_at: artist.updated_at,

      // Profile fields from account_info table (explicitly picked, not spread)
      image: accountInfo?.image ?? null,
      instruction: accountInfo?.instruction ?? null,
      knowledges: accountInfo?.knowledges ?? null,
      label: accountInfo?.label ?? null,
      organization: accountInfo?.organization ?? null,
      company_name: accountInfo?.company_name ?? null,
      job_title: accountInfo?.job_title ?? null,
      role_type: accountInfo?.role_type ?? null,
      onboarding_status: accountInfo?.onboarding_status ?? null,
      onboarding_data: accountInfo?.onboarding_data ?? null,

      // Related data arrays
      account_info: artist.account_info,
      account_socials: artist.account_socials,
    };
  } catch (error) {
    console.error("Unexpected error creating artist:", error);
    return null;
  }
}

export default createArtistInDb;
