import { UseFormReturn } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { CreateAgentFormData } from "./schemas";

interface AgentVisibilityControlProps {
  form: UseFormReturn<CreateAgentFormData>;
}

const AgentVisibilityControl = ({ form }: AgentVisibilityControlProps) => {
  const isPrivate = form.watch("isPrivate");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className={`text-sm ${!isPrivate ? "text-foreground" : "text-muted-foreground"}`}
      >
        Public
      </span>
      <Switch
        id="isPrivate"
        checked={isPrivate}
        aria-label={isPrivate ? "Private agent" : "Public agent"}
        onCheckedChange={(checked) =>
          form.setValue("isPrivate", checked, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />
      <span
        className={`text-sm ${isPrivate ? "text-foreground" : "text-muted-foreground"}`}
      >
        Private
      </span>
    </div>
  );
};

export default AgentVisibilityControl;
