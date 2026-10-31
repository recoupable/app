import { useContext } from "react";
import { AgentTemplateContext } from "@/providers/AgentTemplateProvider";

/** All template consumers share the provider's actor/login-scoped cache. */
export function useAgentTemplateScope() {
  const scope = useContext(AgentTemplateContext);
  if (!scope) throw new Error("Agent templates require AgentTemplateProvider.");
  return scope;
}
