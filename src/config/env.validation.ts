type EnvironmentVariables = Record<string, string | undefined>;

const requiredVariables = [
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

  if (!config.DATABASE_URL) {
    for (const variable of [
      'DB_HOST',
      'DB_PORT',
      'DB_USERNAME',
      'DB_PASSWORD',
      'DB_NAME',
    ]) {
      if (!config[variable]) {
        throw new Error(
          `Missing required environment variable: ${variable} or DATABASE_URL`,
        );
      }
    }
  }

  if (!config.REDIS_URL) {
    for (const variable of ['REDIS_HOST', 'REDIS_PORT']) {
      if (!config[variable]) {
        throw new Error(
          `Missing required environment variable: ${variable} or REDIS_URL`,
        );
      }
    }
  }

  const dbPort = config.DB_PORT ? Number(config.DB_PORT) : 5432;
  const redisPort = config.REDIS_PORT ? Number(config.REDIS_PORT) : 6379;
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

  if (
    config.DB_SSL &&
    !['true', 'false'].includes(String(config.DB_SSL).toLowerCase())
  ) {
    throw new Error('DB_SSL must be either true or false');
  }

  if (
    config.REDIS_TLS &&
    !['true', 'false'].includes(String(config.REDIS_TLS).toLowerCase())
  ) {
    throw new Error('REDIS_TLS must be either true or false');
  }

  return config;
}
