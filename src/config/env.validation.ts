type EnvironmentVariables = Record<string, string | undefined>;

const requiredVariables = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'REDIS_HOST',
  'REDIS_PORT',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'MAIL_FROM',
  'NOTIFICATION_EMAIL',
  'MAPBOX_ACCESS_TOKEN',
] as const;

export function validateEnvironment(config: EnvironmentVariables): EnvironmentVariables {
  for (const variable of requiredVariables) {
    if (!config[variable]) {
      throw new Error(`Missing required environment variable: ${variable}`);
    }
  }

  const dbPort = Number(config.DB_PORT);
  const redisPort = Number(config.REDIS_PORT);
  const smtpPort = Number(config.SMTP_PORT);

  if (Number.isNaN(dbPort) || dbPort <= 0) {
    throw new Error('DB_PORT must be a valid positive number');
  }

  if (Number.isNaN(redisPort) || redisPort <= 0) {
    throw new Error('REDIS_PORT must be a valid positive number');
  }

  if (Number.isNaN(smtpPort) || smtpPort <= 0) {
    throw new Error('SMTP_PORT must be a valid positive number');
  }

  if (!['true', 'false'].includes(String(config.SMTP_SECURE).toLowerCase())) {
    throw new Error('SMTP_SECURE must be either true or false');
  }

  return config;
}
