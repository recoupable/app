import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Validate environment variables are present
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase credentials:", {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_KEY,
    environment: process.env.VERCEL_ENV || "local",
  });
  throw new Error("Missing required Supabase environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
