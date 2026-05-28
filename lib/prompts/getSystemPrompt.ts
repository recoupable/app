import { SYSTEM_PROMPT } from "@/lib/consts";
import getUserInfo from "../supabase/getUserInfo";

export async function getSystemPrompt({
  roomId,
  artistId,
  accountId,
  organizationId,
  email,
  knowledgeBaseText,
  artistInstruction,
  conversationName = "New conversation",
}: {
  roomId?: string;
  artistId?: string;
  accountId: string;
  organizationId?: string;
  email?: string;
  knowledgeBaseText?: string;
  artistInstruction?: string;
  conversationName?: string;
}): Promise<string> {
  let systemPrompt = `${SYSTEM_PROMPT} 

  **IMPORTANT CONTEXT VALUES (use these exact values in tools):**
  - account_id: ${accountId || "Unknown"} (use this for ALL tools that require account_id parameter)
  - organization_id: ${organizationId || "None. Personal Account."}
  - artist_account_id: ${artistId}
  - active_account_email: ${email || "Unknown"}
  - active_conversation_id: ${roomId || "No ID"}
  - active_conversation_name: ${conversationName || "No Chat Name"}

  **IMAGE EDITING INSTRUCTIONS:**
  When the user asks to edit an image (e.g., "add glasses", "make it darker", "add a hat"):
  
  **WHICH IMAGE TO EDIT:**
  1. Check conversation history for the most recent edit_image tool result
  2. If found: Use the imageUrl from that result (e.g., "https://v3b.fal.media/files/...")
  3. If NOT found OR user says "original": Use the URL from "ATTACHED IMAGE URLS" section below
  4. This ensures edits build on each other (glasses → then hat keeps the glasses)
  
  **HOW TO CALL THE TOOL:**
  - IMMEDIATELY call edit_image (don't explain first)
  - imageUrl: The URL determined from steps above (NEVER use "attachment://")
  - prompt: Describe the edit clearly (e.g., "add sunglasses to the person")
  - account_id: Use the account_id value shown above
  - DO NOT ask the user for any information - you have everything you need

  **AUDIO TRANSCRIPTION INSTRUCTIONS:**
  When the user shares an audio file URL and asks to transcribe, get lyrics, or analyze audio:
  
  **IMMEDIATELY call transcribe_audio with:**
  - audio_url: The audio URL from the message
  - account_id: Use the account_id value shown above
  - artist_account_id: Use the artist_account_id value shown above
  - title: Extract from filename or use a descriptive title
  - include_timestamps: true (if user wants timestamps, otherwise false)
  
  **DO NOT:**
  - Use the browser tool to access audio files
  - Ask the user for more information - you have everything you need
  - Explain before calling the tool - just call it immediately`;

  // Add user information section
  const userInfo = await getUserInfo(accountId || "");

  if (userInfo) {
    let userSection = `

-----CURRENT USER CONTEXT-----
This is information about the person currently using this application (the human you're talking to):

Name: ${userInfo.name || "Not provided"}
Email: ${userInfo.email || email || "Not provided"}`;

    if (
      userInfo.job_title ||
      userInfo.role_type ||
      userInfo.company_name ||
      userInfo.organization
    ) {
      userSection += `

Professional Context:`;
      if (userInfo.job_title)
        userSection += `
- Job Title: ${userInfo.job_title}`;
      if (userInfo.role_type)
        userSection += `
- Role Type: ${userInfo.role_type}`;
      if (userInfo.company_name)
        userSection += `
- Company: ${userInfo.company_name}`;
      if (userInfo.organization)
        userSection += `
- Organization: ${userInfo.organization}`;
    }

    if (userInfo.instruction) {
      userSection += `

User's Custom Instructions & Preferences:
${userInfo.instruction}`;
    }

    userSection += `
-----END USER CONTEXT-----`;

    systemPrompt = `${systemPrompt}${userSection}`;
  }

  if (artistInstruction) {
    systemPrompt = `${systemPrompt}

-----SELECTED ARTIST/WORKSPACE CONTEXT-----
This is information about the artist/workspace the user is currently working with:

Custom Instructions for this Artist:
${artistInstruction}
-----END ARTIST/WORKSPACE CONTEXT-----`;
  }

  if (knowledgeBaseText) {
    systemPrompt = `${systemPrompt}

-----ARTIST/WORKSPACE KNOWLEDGE BASE-----
Additional context and knowledge for the selected artist/workspace:
${knowledgeBaseText}
-----END ARTIST/WORKSPACE KNOWLEDGE BASE-----`;
  }

  return systemPrompt;
}

export default getSystemPrompt;
