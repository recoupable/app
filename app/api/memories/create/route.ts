import supabase from "@/lib/supabase/serverClient";

/**
 *
 * @param req
 */
export async function POST(req: Request) {
  const body = await req.json();
  const content = body.content;
  const room_id = body.room_id;

  try {
    const { data, error } = await supabase
      .from("memories")
      .insert({
        content,
        room_id,
      })
      .select("*")
      .single();

    return Response.json({ data, error }, { status: 200 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
