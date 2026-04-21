import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { GatewayModelSelect } from "./GatewayModelSelect";

const ModelSelect = () => {
  const { model, setModel, availableModels } = useVercelChatContext();

  return (
    <GatewayModelSelect
      value={model}
      onValueChange={setModel}
      availableModels={availableModels}
    />
  );
};

export default ModelSelect;
