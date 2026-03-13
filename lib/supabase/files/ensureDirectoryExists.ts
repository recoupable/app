import supabase from "@/lib/supabase/serverClient";

/**
 * Ensure a directory exists in the database, creating it if needed
 * This makes directories visible in the UI
 *
 * @param ownerAccountId
 * @param artistAccountId
 * @param path
 */
export async function ensureDirectoryExists(
  ownerAccountId: string,
  artistAccountId: string,
  path: string,
): Promise<void> {
  // Skip if path is empty or root
  if (!path || path === "root") return;

  // Split path into segments (e.g., "reports/2025" -> ["reports", "2025"])
  const segments = path.split("/").filter(Boolean);
  const baseStoragePath = `files/${ownerAccountId}/${artistAccountId}/`;

  // Create each directory level if it doesn't exist
  for (let i = 0; i < segments.length; i++) {
    const currentPath = segments.slice(0, i + 1).join("/");
    const storageKey = `${baseStoragePath}${currentPath}/`;
    const directoryName = segments[i];

    // Check if directory entry exists
    const { data: exists } = await supabase
      .from("files")
      .select("id")
      .eq("storage_key", storageKey)
      .eq("is_directory", true)
      .limit(1)
      .maybeSingle();

    // Create directory entry if it doesn't exist
    if (!exists) {
      const { error } = await supabase.from("files").insert({
        owner_account_id: ownerAccountId,
        artist_account_id: artistAccountId,
        storage_key: storageKey,
        file_name: directoryName,
        is_directory: true,
        mime_type: null,
        size_bytes: null,
      });

      if (error) {
        // Ignore duplicate errors (race condition with concurrent creates)
        if (!error.message.includes("duplicate") && !error.code?.includes("23505")) {
          throw new Error(`Failed to create directory '${directoryName}': ${error.message}`);
        }
      }
    }
  }
}
