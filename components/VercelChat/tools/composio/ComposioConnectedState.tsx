import { CheckCircle2 } from "lucide-react";
import { ToolCard, ToolCardBody } from "../shared/ToolCard";

interface ComposioConnectedStateProps {
  displayName: string;
}

/**
 * Component shown when a connector is successfully connected.
 */
export function ComposioConnectedState({
  displayName,
}: ComposioConnectedStateProps) {
  return (
    <ToolCard
      icon={CheckCircle2}
      tone="success"
      emphasized
      title={`${displayName} connected`}
      subtitle="Ready to use"
      className="max-w-md"
    >
      <ToolCardBody>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your {displayName} account is connected and ready to use.
        </p>
      </ToolCardBody>
    </ToolCard>
  );
}

export default ComposioConnectedState;
