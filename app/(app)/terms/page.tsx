import { redirect } from "next/navigation";

const TermsPage = () => {
  redirect("https://www.recoupable.com/terms-of-service");
  return null; // Fallback render (unreachable)
};

export default TermsPage;
