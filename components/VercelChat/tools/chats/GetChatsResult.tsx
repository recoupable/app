"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNowStrict } from "date-fns";
import { MessageSquare, ChevronRight } from "lucide-react";
import { ToolCard, ToolCardBody } from "../shared/ToolCard";
import { ToolEmpty } from "../shared/ToolEmpty";

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

/** Compact relative time (e.g. "2d ago"); returns null for missing/invalid input. */
function relativeTime(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${formatDistanceToNowStrict(date)} ago`;
}

/** Deterministic tonal tint for the first-letter avatar so rows read as distinct. */
const AVATAR_TINTS = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
];

function tintFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
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
          <motion.ul
            className="max-h-72 space-y-0.5 overflow-y-auto"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.045 } },
            }}
          >
            {chats.map((chat) => {
              const displayTitle =
                chat.title && chat.title.trim().length > 0
                  ? chat.title
                  : "Untitled Chat";
              const updated = relativeTime(chat.updatedAt);
              const initial = displayTitle.charAt(0).toUpperCase();

              return (
                <motion.li
                  key={chat.id}
                  variants={{
                    hidden: { opacity: 0, y: 4 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`/sessions/${chat.sessionId}/chats/${chat.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/row flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/60"
                  >
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${tintFor(
                        chat.id,
                      )}`}
                    >
                      {initial}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {displayTitle}
                    </span>
                    {updated ? (
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground transition-opacity group-hover/row:opacity-0">
                        {updated}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover/row:translate-x-0 group-hover/row:opacity-100" />
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
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
