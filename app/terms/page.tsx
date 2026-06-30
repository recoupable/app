import { redirect } from "next/navigation";

const TermsPage = () => {
  redirect("https://recoupable.dev/terms-of-use");
  return null; // Fallback render (unreachable)
};

export default TermsPage;
