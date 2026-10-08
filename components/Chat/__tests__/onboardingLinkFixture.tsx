import type { AnchorHTMLAttributes } from "react";

export default function OnboardingLinkFixture({
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props}>{children}</a>;
}
