import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCorsHeaders } from "@/lib/chat/getCorsHeaders";
import { validateHeaders } from "@/lib/chat/validateHeaders";
import { getMessages } from "@/lib/messages/getMessages";

export const chatRequestSchema = z
  .object({
    // Chat content
    prompt: z.string().optional(),
    messages: z.array(z.any()).default([]),
    // Core routing / context fields
    roomId: z.string().optional(),
    accountId: z.string().optional(),
    artistId: z.string().optional(),
    organizationId: z.string().optional(),
    model: z.string().optional(),
    excludeTools: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    const hasMessages = Array.isArray(data.messages) && data.messages.length > 0;
    const hasPrompt = typeof data.prompt === "string" && data.prompt.trim().length > 0;

    if ((hasMessages && hasPrompt) || (!hasMessages && !hasPrompt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one of messages or prompt must be provided",
        path: ["messages"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one of messages or prompt must be provided",
        path: ["prompt"],
      });
    }
  });

type BaseChatRequestBody = z.infer<typeof chatRequestSchema>;

export type ChatRequestBody = BaseChatRequestBody & {
  accountId: string;
  accessToken: string;
};

/**
 * Validates chat request body and auth headers.
 *
 * Mirrors the behavior of other API validators: returns
 * - Response (400/401/500) when invalid (body or headers)
 * - Parsed & augmented body when valid (including header-derived accountId)
 *
 * @param request
 */
export async function validateChatRequest(
  request: NextRequest,
): Promise<Response | ChatRequestBody> {
  const json = await request.json();
  const validationResult = chatRequestSchema.safeParse(json);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        status: "error",
        message: "Invalid input",
        errors: validationResult.error.issues.map(err => ({
          field: err.path.join("."),
          message: err.message,
        })),
      },
      {
        status: 400,
        headers: getCorsHeaders(),
      },
    );
  }

  const validatedBody: BaseChatRequestBody & { accessToken?: string } = validationResult.data;

  // If auth headers are present, resolve accountId via GET /api/accounts/id
  const headerValidationResult = await validateHeaders(request);
  if (headerValidationResult instanceof Response) {
    return headerValidationResult;
  }
  if (headerValidationResult.accountId) {
    validatedBody.accountId = headerValidationResult.accountId;
  }
  if (headerValidationResult.accessToken) {
    validatedBody.accessToken = headerValidationResult.accessToken;
  }

  const hasAccountId =
    typeof validatedBody.accountId === "string" && validatedBody.accountId.trim().length > 0;
  const hasAccessToken =
    typeof validatedBody.accessToken === "string" && validatedBody.accessToken.trim().length > 0;

  if (!hasAccountId || !hasAccessToken) {
    return NextResponse.json(
      {
        status: "error",
        message: "x-api-key header required",
      },
      {
        status: 401,
        headers: getCorsHeaders(),
      },
    );
  }

  // Normalize chat content:
  // - If messages are provided, keep them as-is
  // - If only prompt is provided, convert it into a single user UIMessage
  const hasMessages = Array.isArray(validatedBody.messages) && validatedBody.messages.length > 0;
  const hasPrompt =
    typeof validatedBody.prompt === "string" && validatedBody.prompt.trim().length > 0;

  if (!hasMessages && hasPrompt) {
    validatedBody.messages = getMessages(validatedBody.prompt);
  }

  return validatedBody as ChatRequestBody;
}
