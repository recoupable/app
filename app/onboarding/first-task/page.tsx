import FirstTaskStep from "@/components/Onboarding/FirstTaskStep";

/**
 * Standalone mount for the onboarding first-task step (chat#1867) so
 * the step is user-testable before the OnboardingSequence container
 * exists. The sequence PR will mount <FirstTaskStep /> directly.
 */
const FirstTaskOnboardingPage = () => <FirstTaskStep />;

export default FirstTaskOnboardingPage;
