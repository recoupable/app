import { Tables } from "@/types/database.types";
import TaskCard from "@/components/VercelChat/tools/tasks/TaskCard";
import TaskSkeleton from "./TaskSkeleton";
import TaskDetailsDialog from "@/components/VercelChat/dialogs/tasks/TaskDetailsDialog";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useUserProvider } from "@/providers/UserProvder";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

type ScheduledAction = Tables<"scheduled_actions">;
type AccountEmail = Tables<"account_emails">;

interface TasksListProps {
  tasks: ScheduledAction[];
  isLoading: boolean;
  isError: boolean;
}

const TasksList: React.FC<TasksListProps> = ({ tasks, isLoading, isError }) => {
  const { userData } = useUserProvider();
  const { selectedArtist } = useArtistProvider();
  const isArtistSelected = !!selectedArtist;

  // Extract unique account IDs from tasks
  const accountIds = useMemo(
    () => [...new Set(tasks.map(task => task.account_id))],
    [tasks]
  );

  // Batch fetch emails for all task owners
  const { data: accountEmails = [] } = useQuery<AccountEmail[]>({
    queryKey: ["task-owner-emails", accountIds],
    queryFn: async () => {
      if (accountIds.length === 0 || !userData || !selectedArtist) return [];
      const params = new URLSearchParams();
      accountIds.forEach(id => params.append("accountIds", id));
      params.append("currentAccountId", userData.id);
      params.append("artistAccountId", selectedArtist.account_id);
      const response = await fetch(`/api/account-emails?${params}`);
      if (!response.ok) throw new Error("Failed to fetch emails");
      return response.json();
    },
    enabled: accountIds.length > 0 && !!userData && !!selectedArtist,
  });

  // Create lookup map for O(1) email access
  const emailByAccountId = useMemo(() => {
    const map = new Map<string, string>();
    accountEmails.forEach(ae => {
      if (ae.account_id && ae.email) {
        map.set(ae.account_id, ae.email);
      }
    });
    return map;
  }, [accountEmails]);

  if (isError) {
    return <div className="text-sm text-red-600 dark:text-red-400">Failed to load tasks</div>;
  }

  if (isLoading || !isArtistSelected || !userData) {
    return (
      <div className="space-y-4">
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          You have no scheduled tasks for this artist.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground dark:text-white">Scheduled</h3>
      </div>
      {tasks.map((task, index) => (
        <TaskDetailsDialog key={task.id} task={task}>
          <div
            className={
              index !== tasks.length - 1 ? "border-b border-border " : ""
            }
          >
            <TaskCard 
              task={task} 
              ownerEmail={emailByAccountId.get(task.account_id)}
            />
          </div>
        </TaskDetailsDialog>
      ))}
    </div>
  );
};

export default TasksList;
