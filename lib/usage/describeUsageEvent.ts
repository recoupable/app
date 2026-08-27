/** "api · main": the surface a charge came from and the agent that ran. */
const describeUsageEvent = ({ source, agent_type }: { source: string; agent_type: string | null }): string =>
  agent_type ? `${source} · ${agent_type}` : source;

export default describeUsageEvent;
