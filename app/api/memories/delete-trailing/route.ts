import { NextRequest, NextResponse } from "next/server";
import { deleteTrailingMessages } from "@/lib/messages/deleteTrailingMessages";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Memory ID is required" },
        { status: 400 }
      );
    }

    await deleteTrailingMessages({ id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trailing messages:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to delete trailing messages";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
