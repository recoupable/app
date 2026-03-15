import { SEGMENT_FAN_SOCIAL_ID_PROMPT } from "../consts";
import { GenerateSegmentsParams } from "./generateSegments";

const getAnalysisPrompt = ({ fans, prompt }: GenerateSegmentsParams) => {
  const fanCount = fans.length;
  const fanData = fans.map(fan => {
    const obj = {
      fan_social_id: fan.fan_social_id,
      username: fan.fan_social.username,
      bio: fan.fan_social.bio,
      followerCount: fan.fan_social.followerCount,
      followingCount: fan.fan_social.followingCount,
      comment: fan.latest_engagement_comment?.comment || null,
    };
    // Remove keys with null values
    return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== null));
  });

  const maxFans = 111;
  const slicedFanData = fanData.slice(0, maxFans);

  const fanDataString = JSON.stringify(slicedFanData, null, 2);
  const analysisPrompt = `Analyze the following fan data and generate segment names based on the provided prompt.
  
  Fan Data Summary:
  - Total fans: ${fanCount}
  - Fan data: ${fanDataString}
  
  Artist's specific prompt: ${prompt}
  
  Generate segment names that align with the artist's requirements and the fan data characteristics.
  ${SEGMENT_FAN_SOCIAL_ID_PROMPT}`;
  return analysisPrompt;
};

export default getAnalysisPrompt;
