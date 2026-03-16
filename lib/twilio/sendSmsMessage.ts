import twilioClient from "./client";

/**
 * Sends an SMS message using Twilio's REST API
 * Reference: https://www.twilio.com/docs/messaging/api/message-resource#create-a-message-resource
 *
 * @param to - Recipient phone number
 * @param body - Message content
 * @returns Message SID or null on error
 */
export const sendSmsMessage = async (to: string, body: string): Promise<string | null> => {
  try {
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioClient) {
      console.error("Twilio client not initialized. Check credentials.");
      return null;
    }

    if (!fromNumber) {
      console.error("TWILIO_PHONE_NUMBER not configured");
      return null;
    }

    const message = await twilioClient.messages.create({
      body,
      from: fromNumber,
      to,
    });

    console.log(`SMS sent successfully: ${message.sid}`);
    return message.sid;
  } catch (error) {
    console.error("Error sending SMS via Twilio API:", error);
    return null;
  }
};
