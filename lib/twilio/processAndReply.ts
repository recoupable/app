import { ParsedSmsMessage } from "@/types/twilio";
import { sendSmsMessage } from "./sendSmsMessage";
import { SMS_FALLBACK_MESSAGE } from "./constants";

/**
 * Processes incoming SMS and sends reply via Twilio API
 * This runs asynchronously after the webhook response
 *
 * @param smsData - Parsed SMS message data
 */
export const processAndReply = async (smsData: ParsedSmsMessage): Promise<void> => {
  try {
    // Send fallback message
    await sendSmsMessage(smsData.from, SMS_FALLBACK_MESSAGE);
  } catch (error) {
    console.error("Error in processAndReply:", error);
  }
};
