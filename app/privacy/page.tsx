import { redirect } from "next/navigation";

const PrivacyPage = () => {
  redirect("https://recoupable.dev/privacy-policy");
  return null; // Fallback render (unreachable)
};

export default PrivacyPage;
