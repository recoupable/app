import { NextResponse } from "next/server";
import { fetchOnboardingTemplates } from "@/lib/onboarding/fetchOnboardingTemplates";

export const runtime = "edge";

/**
 * GET /api/onboarding-templates
 * Fetches all onboarding templates (system templates with 'onboarding' tag)
 */
export async function GET() {
  try {
    const templates = await fetchOnboardingTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching onboarding templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding templates" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
