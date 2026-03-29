import { redirect } from "next/navigation";

const PrivacyPage = () => {
  redirect("https://www.recoupable.com/privacy-policy");
  return null; // Fallback render (unreachable)
};

export default PrivacyPage;
