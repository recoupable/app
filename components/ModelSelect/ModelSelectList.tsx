import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";
import ModelSelectItem from "./ModelSelectItem";

interface ModelSelectListProps {
  featuredModels: GatewayLanguageModelEntry[];
  otherModels: GatewayLanguageModelEntry[];
}

const ModelSelectList = ({ featuredModels, otherModels }: ModelSelectListProps) => (
  <>
    {featuredModels.map((model) => (
      <ModelSelectItem key={model.id} model={model} />
    ))}

    {otherModels.length > 0 && (
      <>
        {featuredModels.length > 0 && <div className="my-1 h-px bg-border" />}
        <div className="px-3 py-2.5 text-sm font-medium text-muted-foreground">
          More Models
        </div>
        {otherModels.map((model) => (
          <ModelSelectItem key={model.id} model={model} />
        ))}
      </>
    )}
  </>
);

export default ModelSelectList;
