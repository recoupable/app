import RosterSocialsFlow from "@/components/Onboarding/RosterSocialsFlow";

/**
 * `/setup/socials` — welcome email step 2 ("Verify their socials"). Opens the
 * roster + socials flow directly at the socials step.
 */
const SetupSocialsPage = () => <RosterSocialsFlow initialStep="socials" />;

export default SetupSocialsPage;
