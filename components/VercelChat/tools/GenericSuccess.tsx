import { Check } from "lucide-react";
import { ToolCard } from "./shared/ToolCard";
import { humanizeToolName } from "@/lib/tools/humanizeToolName";

/**
 * Default success surface for tools without a bespoke result component.
 * Kept intentionally compact — it should read as a quiet confirmation,
 * not compete with rich result cards.
 */
const GenericSuccess = ({
  image,
  name,
  message,
  children,
}: {
  image?: string;
  name: string;
  message: string;
  children?: React.ReactNode;
}) => {
  const prettyName = humanizeToolName(name);

  return (
    <ToolCard
      tone="success"
      icon={image ? undefined : Check}
      media={
        image ? (
          <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={prettyName}
              width={36}
              height={36}
              className="size-full object-cover"
            />
          </div>
        ) : undefined
      }
      title={prettyName}
      subtitle={message}
      className="max-w-sm"
    >
      {children ? <div className="p-3">{children}</div> : null}
    </ToolCard>
  );
};

export default GenericSuccess;
