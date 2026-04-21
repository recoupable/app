import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { GatewayModelSelect } from "./GatewayModelSelect";

const ModelSelect = () => {
  const { model, setModel } = useVercelChatContext();

  return <GatewayModelSelect value={model} onValueChange={setModel} />;
};

export default ModelSelect;
