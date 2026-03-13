import supabase from "@/lib/supabase/serverClient";
import getAccountByEmail from "@/lib/supabase/accounts/getAccountByEmail";
import { ErrorContext } from "@/lib/telegram/errors/sendErrorNotification";
import { formatErrorMessage } from "@/lib/telegram/errors/formatErrorMessage";
import type { Database } from "@/types/database.types";
import { extractToolNameFromError } from "@/lib/supabase/error_logs/errorTypeParser";

interface CreateErrorLogParams extends ErrorContext {
  telegram_message_id: number;
}

type ErrorLogInsert = Database["public"]["Tables"]["error_logs"]["Insert"];

/**
 * Creates an error log entry in Supabase error_logs table
 * Maps ErrorContext data to appropriate database columns
 * Handles account lookup and graceful error handling
 *
 * @param params
 */
export async function createErrorLog(params: CreateErrorLogParams): Promise<void> {
  try {
    // Look up account_id from email if provided
    let account_id: string | null = null;
    if (params.email) {
      try {
        const accountEmail = await getAccountByEmail(params.email);
        account_id = accountEmail?.account_id || null;
      } catch (error) {
        console.error("Failed to lookup account by email:", error);
        // Continue without account_id rather than failing
      }
    }

    // Extract last message content
    const last_message =
      params.messages && params.messages.length > 0
        ? params.messages[params.messages.length - 1]?.parts
            .filter(part => part.type === "text")
            .join("")
        : null;

    // Generate raw message using existing formatter
    const raw_message = formatErrorMessage(params);

    // Use robust tool/error type extraction
    const tool_name = extractToolNameFromError(
      params.error.message || "",
      params.error.stack || "",
      params.error.name || "",
    );

    // Insert error log record
    const errorLogData: ErrorLogInsert = {
      account_id,
      room_id: params.roomId || null,
      error_message: params.error.message,
      error_timestamp: new Date().toISOString(),
      error_type: params.error.name,
      last_message,
      raw_message,
      stack_trace: params.error.stack || null,
      telegram_message_id: params.telegram_message_id,
      tool_name,
    };

    const { error } = await supabase.from("error_logs").insert(errorLogData);

    if (error) {
      console.error("Failed to insert error log:", error);
    }
  } catch (error) {
    console.error("Error in createErrorLog:", error);
    // Don't throw - this should not break the calling flow
  }
}
