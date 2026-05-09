import { NextResponse } from "next/server";
import { createAgentTemplate } from "@/lib/supabase/agent_templates/createAgentTemplate";
import { updateAgentTemplate } from "@/lib/supabase/agent_templates/updateAgentTemplate";
import { deleteAgentTemplate } from "@/lib/supabase/agent_templates/deleteAgentTemplate";
import { verifyAgentTemplateOwner } from "@/lib/supabase/agent_templates/verifyAgentTemplateOwner";

export const runtime = "edge";

/** Listing is served by Recoup API (`GET /api/agent-templates`); Chat keeps create/update/delete here. */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      prompt,
      tags,
      isPrivate,
      shareEmails,
      userId,
    }: {
      title: string;
      description: string;
      prompt: string;
      tags: string[];
      isPrivate: boolean;
      shareEmails?: string[];
      userId?: string | null;
    } = body;

    const data = await createAgentTemplate({
      title,
      description,
      prompt,
      tags,
      isPrivate,
      shareEmails,
      userId,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating agent template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, userId } = (await request.json()) as { id: string; userId: string };
    if (!id || !userId) {
      return NextResponse.json({ error: "Missing id or userId" }, { status: 400 });
    }

    const isOwner = await verifyAgentTemplateOwner(id, userId);
    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteAgentTemplate(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      userId,
      title,
      description,
      prompt,
      tags,
      isPrivate,
      shareEmails,
    }: {
      id: string;
      userId: string;
      title?: string;
      description?: string;
      prompt?: string;
      tags?: string[];
      isPrivate?: boolean;
      shareEmails?: string[];
    } = body;

    if (!id || !userId) {
      return NextResponse.json({ error: "Missing id or userId" }, { status: 400 });
    }

    const isOwner = await verifyAgentTemplateOwner(id, userId);
    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateFields: {
      title?: string;
      description?: string;
      prompt?: string;
      tags?: string[];
      is_private?: boolean;
    } = {};
    if (typeof title !== "undefined") updateFields.title = title;
    if (typeof description !== "undefined") updateFields.description = description;
    if (typeof prompt !== "undefined") updateFields.prompt = prompt;
    if (typeof tags !== "undefined") updateFields.tags = tags;
    if (typeof isPrivate !== "undefined") updateFields.is_private = isPrivate;

    const data = await updateAgentTemplate(id, updateFields, shareEmails);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating agent template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0; 