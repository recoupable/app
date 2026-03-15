import { NextRequest } from "next/server";
import handleApifyWebhook from "@/lib/apify/handleApifyWebhook";
import apifyPayloadSchema from "@/lib/apify/apifyPayloadSchema";

/**
 * API endpoint for Apify webhooks.
 * Accepts a POST request with a JSON payload, optionally fetches a dataset, and always responds with 200.
 *
 * @param req
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Optionally validate the payload shape
    const parsed = apifyPayloadSchema.safeParse(body);
    console.log("Received Apify webhook:", parsed);

    if (!parsed.success) {
      return new Response(JSON.stringify({ message: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const result = await handleApifyWebhook(parsed.data);
    console.log("handleApifyWebhook result:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Always respond with 200, even if parsing fails
    return new Response(JSON.stringify({ message: "Apify webhook received (invalid JSON)" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
