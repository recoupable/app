"use client";

import Link from "next/link";
import { MessageSquare, ChevronRight } from "lucide-react";
import { ToolCard, ToolCardBody } from "../shared/ToolCard";
import ToolEmpty from "../shared/ToolEmpty";

/**
 * Row shape returned by the `get_chats` MCP tool — the session-scoped
 * projection emitted by recoup-api `GET /api/chats`.
 */
interface GetChatsResultRow {
  id: string;
  title: string;
  accountId: string;
  sessionId: string;
  updatedAt: string;
}

export interface GetChatsResultType {
  chats?: GetChatsResultRow[];
  status?: string;
  message?: string;
}

interface GetChatsResultProps {
  result: GetChatsResultType;
}

const GetChatsResult = ({ result }: GetChatsResultProps) => {
  const chats = result?.chats ?? [];
  const count = chats.length;

  return (
    <ToolCard
      icon={MessageSquare}
      tone={count > 0 ? "info" : "neutral"}
      title="Chats"
      subtitle={
        count === 0
          ? "No chats found"
          : `Found ${count} chat${count === 1 ? "" : "s"}`
      }
      className="max-w-md"
      trailing={
        count > 0 ? (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {count}
          </span>
        ) : undefined
      }
    >
      {count > 0 ? (
        <ToolCardBody>
          <ul className="max-h-72 space-y-0.5 overflow-y-auto">
            {chats.map((chat) => {
              const displayTitle =
                chat.title && chat.title.trim().length > 0
                  ? chat.title
                  : "Untitled Chat";

              return (
                <li key={chat.id}>
                  <Link
                    href={`/sessions/${chat.sessionId}/chats/${chat.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/row flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/60"
                  >
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {displayTitle}
                    </span>
                    <ChevronRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover/row:translate-x-0 group-hover/row:opacity-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </ToolCardBody>
      ) : (
        <ToolEmpty
          icon={MessageSquare}
          title="No chats available"
          description="When chats are created they'll show up here."
        />
      )}
    </ToolCard>
  );
};

export default GetChatsResult;
