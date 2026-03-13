import supabase from "../serverClient";

interface InsertMemoryEmailParams {
  email_id: string;
  memory: string;
  message_id: string;
}

/**
 * Inserts a new memory_email record to link an email with a memory.
 *
 * @param params - The parameters for the memory_email
 * @param params.email_id - The email ID from Resend
 * @param params.memory - The memory ID (same as message_id in this context)
 * @param params.message_id - The message ID from the chat
 * @returns The inserted memory_email record
 */
export async function insertMemoryEmail(params: InsertMemoryEmailParams): Promise<void> {
  const { error } = await supabase.from("memory_emails").insert(params);

  if (error) {
    console.error("Error creating memory_email:", error);
    throw error;
  }
}
