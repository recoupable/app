import { NextRequest, NextResponse } from "next/server";
import { parseSmsWebhook } from "@/lib/twilio/parseSmsWebhook";
import { processAndReply } from "@/lib/twilio/processAndReply";

/**
 * POST /api/twilio/sms
 * Webhook endpoint to receive SMS messages from Twilio
 *
 * Strategy: Respond immediately (within 15s timeout), then process AI asynchronously
 *
 * @param request
 */
export async function POST(request: NextRequest) {
  try {
    // Parse incoming SMS webhook data
    const formData = await request.formData();
    const smsData = parseSmsWebhook(formData);

    console.log(`[${new Date().toISOString()}] SMS received from ${smsData.from}: ${smsData.body}`);

    // Process AI generation and send response asynchronously (don't await)
    processAndReply(smsData).catch(error => {
      console.error("Error in async SMS processing:", error);
    });

    // Respond immediately to Twilio (within 15s timeout)
    // Empty 200 response acknowledges receipt
    return new NextResponse(null, {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing SMS webhook:", error);

    // Still respond with 200 to Twilio to avoid retries
    return new NextResponse(null, {
      status: 200,
    });
  }
}

// Make this route dynamic to handle real-time webhooks
export const dynamic = "force-dynamic";
