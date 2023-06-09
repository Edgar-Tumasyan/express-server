/**
 * This interface represents the environment configuration of the service.
 * The values of these properties are loaded and set via the IoC Container found in `./ioc.container.ts`.
 * This interface can be expanded as necessary to accomodate new configuration. Be sure to set the values for any
 * new keys as necessary in the container. (TypeScript will let you know if you forget to set them.)
 */
export interface EnvironmentConfig {
  readonly region: string;
  readonly serviceName: string;
  readonly environmentName: string;
  readonly releaseVersion: string;
  readonly logLevel: string;
  readonly domain: string;
  readonly canaryBaseUrl: string;
  readonly secretName: string;
  readonly dbTableName: string;
  readonly wellnessTableName: string;
  readonly voiceJournalAudioBucketName: string;
  readonly canarySecretsName: string;
  readonly getScoresMaxRetries: number;
  readonly retryDelay: number;
  readonly voiceJournalStepFunctionArn: string;
  readonly transcribeRoleArn: string;
  readonly getTranscriptionMaxRetries: number;
  readonly getTranscriptionRetryDelay: number;
}
