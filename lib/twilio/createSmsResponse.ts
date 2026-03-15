import twilio from "twilio";

const MessagingResponse = twilio.twiml.MessagingResponse;

/**
 * Creates a TwiML messaging response
 *
 * @param message - Message to send back to the user
 * @returns TwiML string response
 */
export const createSmsResponse = (message: string): string => {
  const twiml = new MessagingResponse();
  twiml.message(message);
  return twiml.toString();
};
