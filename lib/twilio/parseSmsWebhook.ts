import { ParsedSmsMessage } from "@/types/twilio";

/**
 * Parses Twilio SMS webhook FormData into a structured object
 *
 * @param formData - FormData from Twilio webhook request
 * @returns Parsed SMS message data
 */
export const parseSmsWebhook = (formData: FormData): ParsedSmsMessage => {
  const from = formData.get("From");
  const to = formData.get("To");
  const body = formData.get("Body");
  const messageSid = formData.get("MessageSid");
  const accountSid = formData.get("AccountSid");
  const numMedia = formData.get("NumMedia");

  if (!from || !to || !body || !messageSid || !accountSid) {
    throw new Error("Missing required webhook fields");
  }

  return {
    from: from.toString(),
    to: to.toString(),
    body: body.toString(),
    messageSid: messageSid.toString(),
    accountSid: accountSid.toString(),
    mediaCount: numMedia ? parseInt(numMedia.toString(), 10) : 0,
  };
};
