import getSocialPlatformByLink from "../getSocialPlatformByLink";
import supabase from "./serverClient";

export interface ArtistAgent {
  type: string;
  agentId: string;
  updated_at: string;
}

/**
 *
 * @param artistSocialIds
 */
export async function getArtistAgents(artistSocialIds: string[]): Promise<ArtistAgent[]> {
  const { data, error } = await supabase
    .from("agent_status")
    .select("*, agent:agents(*)")
    .in("social_id", artistSocialIds);

  if (error) {
    console.error("Error fetching artist agents:", error);
    return [];
  }

  if (!data) return [];

  const agentIds = [...new Set(data.map(ele => ele.agent.id))];

  const { data: agents } = await supabase
    .from("agents")
    .select("*, agent_status(*, social:socials(*))")
    .in("id", agentIds);

  if (!agents) return [];

  const transformedAgents = agents.map(agent => ({
    type: new String(
      agent.agent_status.length > 1
        ? "wrapped"
        : getSocialPlatformByLink(agent.agent_status[0].social.profile_url),
    ).toLowerCase(),
    agentId: agent.id,
    updated_at: agent.updated_at,
  }));

  // eslint-disable-next-line
  const aggregatedAgents: any = {};

  transformedAgents.forEach(agent => {
    const type = agent.type.toLowerCase();
    aggregatedAgents[type] = agent;
  });

  return Object.values(aggregatedAgents);
}
