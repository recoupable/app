const REQUIRED_ENV_VARS = ["ANTHROPIC_API_KEY"] as const;

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

/**
 *
 */
class EnvironmentError extends Error {
  /**
   *
   * @param missingVars
   */
  constructor(missingVars: RequiredEnvVar[]) {
    super(
      `Missing required environment variables: ${missingVars.join(
        ", ",
      )}. Please check your .env file.`,
    );
    this.name = "EnvironmentError";
  }
}

/**
 * Validates that all required environment variables are present
 *
 * @throws {EnvironmentError} If any required variables are missing
 */
const validateEnvironment = (): void => {
  const missingVars = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new EnvironmentError(missingVars);
  }
};

export default validateEnvironment;
