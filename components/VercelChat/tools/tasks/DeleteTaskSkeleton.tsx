import { Trash2 } from "lucide-react";
import { ToolCardSkeleton } from "../shared/ToolCardSkeleton";

const DeleteTaskSkeleton = () => {
  return <ToolCardSkeleton icon={Trash2} label="Deleting task" rows={1} />;
};

export default DeleteTaskSkeleton;
