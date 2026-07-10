type RawEnvironment = Record<string, string | undefined>;

const requiredVariables = [
  "APP_PORT",
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "FRONTEND_URL"
];

export function validateEnvironment(config: RawEnvironment) {
  const missing = requiredVariables.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  return {
    ...config,
    APP_PORT: Number(config.APP_PORT)
  };
}
