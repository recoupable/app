import { UIMessage } from "ai";
import { sendMessage } from "@/lib/telegram/sendMessage";
import { SerializedError } from "@/lib/errors/serializeError";
import { formatErrorMessage } from "./formatErrorMessage";
import { createErrorLog } from "@/lib/supabase/error_logs/createErrorLog";

export interface ErrorContext {
  email?: string;
  roomId?: string;
  messages?: UIMessage[];
  path: string;
  error: SerializedError;
}

/**
 * Sends error notification to Telegram and stores in Supabase error_logs
 * Non-blocking to avoid impacting API operations
 *
 * @param params
 */
export async function sendErrorNotification(params: ErrorContext): Promise<void> {
  try {
    const message = formatErrorMessage(params);
    const telegramResponse = await sendMessage(message, { parse_mode: "Markdown" });

    // Store error in Supabase database (non-blocking)
    // Database failures should not impact Telegram notifications
    createErrorLog({
      ...params,
      telegram_message_id: telegramResponse.message_id,
    }).catch(err => {
      console.error("Failed to store error log in database:", err);
    });
  } catch (err) {
    console.error("Error in sendErrorNotification:", err);
  }
}
