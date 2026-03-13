import supabase from "@/lib/supabase/serverClient";

/**
 * Delete an account from the database by its ID
 * This will cascade delete related records due to foreign key constraints
 * including: account_info, account_socials, rooms, and other dependent records
 *
 * @param accountId - The ID of the account to delete
 * @returns Object with success status, metadata, and any error
 */
export async function deleteAccountById(accountId: string) {
  try {
    // Delete the account directly
    const { error } = await supabase.from("accounts").delete().eq("id", accountId);

    if (error) {
      console.error("Error deleting account:", error);
      return {
        success: false,
        error,
        accountId,
      };
    }

    return {
      success: true,
      accountId,
      message: "Account successfully deleted",
    };
  } catch (error) {
    console.error("Unexpected error in deleteAccountById:", error);
    return {
      success: false,
      error,
      accountId,
    };
  }
}

export default deleteAccountById;
