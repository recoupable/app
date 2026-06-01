import Link from "next/link";
import { MessageSquare, CheckCircle2, ChevronRight } from "lucide-react";

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

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm max-w-md">
      <div className="px-4 py-3 border-b border-border bg-muted rounded-t-lg">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
          <h3 className="text-sm font-semibold text-foreground">Chats</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {chats.length === 0
            ? "No chats found"
            : `Found ${chats.length} chat${chats.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {chats.length > 0 && (
        <div className="p-2 max-h-72 overflow-y-auto">
          <ul className="space-y-1">
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
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors group"
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground truncate flex-1">
                      {displayTitle}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {chats.length === 0 && (
        <div className="p-6 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No chats available</p>
        </div>
      )}
    </div>
  );
};

export default GetChatsResult;
