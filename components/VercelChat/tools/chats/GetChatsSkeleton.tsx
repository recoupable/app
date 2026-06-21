import { MessageSquare } from "lucide-react";
import { ToolCardSkeleton } from "../shared/ToolCardSkeleton";

const GetChatsSkeleton = () => {
  return (
    <ToolCardSkeleton
      icon={MessageSquare}
      rows={4}
      className="max-w-md"
    />
  );
};

export default GetChatsSkeleton;
