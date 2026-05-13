import { Logger } from '@nestjs/common';
import * as appInsights from 'applicationinsights';

const logger = new Logger('ApplicationInsights');

export function initializeApplicationInsights(): void {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    logger.log('Application Insights disabled: missing connection string');
    return;
  }

  try {
    appInsights
      .setup(connectionString)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .start();

    logger.log('Application Insights initialized');
  } catch (error) {
    logger.warn(
      `Application Insights initialization failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export function trackEvent(
  name: string,
  properties?: Record<string, string>,
): void {
  appInsights.defaultClient?.trackEvent({ name, properties });
}

export function trackException(error: unknown): void {
  if (error instanceof Error) {
    appInsights.defaultClient?.trackException({ exception: error });
  }
}
