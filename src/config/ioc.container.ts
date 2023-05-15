// Required to be first import
import axios from "axios";
import dayJS from "dayjs";
import { Container } from "inversify";
import { SecretsManager, StepFunctions } from "aws-sdk";
import { TranscribeClient, TranscribeClientConfig } from "@aws-sdk/client-transcribe";

import { LoggerService } from "../services/common/logger.service";
import { Environment } from "../constants/environment.constants";
import { EnvironmentConfig } from "./env.config";
import { ContainerKeys } from "./ioc.keys";

import { OrganizationsController } from "../controllers/organizations.controller";
import { ScoresController } from "../controllers/scores.controller";
import { GroupsController } from "../controllers/groups.controller";
import { UsersController } from "../controllers/users.controller";

// Create the IOC Container
const container = new Container();

try {
  // Support for secrets manager when running locally
  let secretsManagerOptions = null;

  // S3 options
  let s3Options: Object = {
    signatureVersion: "v4"
  };

  let stepFunctionOptions = null;

  let domain = process.env.domain;

  // Support for transcribe when running locally
  let transcribeConfig: TranscribeClientConfig = {
    region: process.env.AWS_REGION
  };

  if (process.env.environmentName === Environment.LOCAL) {
    // eslint-disable-next-line no-console
    console.log("Local environment detected.");
    domain = process.env.localDomain;
    console.log(`Local domain: "${domain}"`);

    // S3 local setup
    s3Options = {
      ...s3Options,
      endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`,

      // only able to get LocalStack to make calls to presigned S3 URLs in the path style
      // on all other environments the default virtual-hosted style will be used otherwise
      s3ForcePathStyle: true
    };

    secretsManagerOptions = {
      endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`
    };

    stepFunctionOptions = {
      endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`
    };

    transcribeConfig = {
      endpoint: `http://${process.env.LOCALSTACK_HOSTNAME}:4566`
    };
  }

  // Setup the envConfig with values from process.env
  // These must each be set as Lambda Environment Variables in the microservice.sam.yml file
  const envConfig: EnvironmentConfig = Object.freeze({
    region: process.env.AWS_REGION,
    serviceName: process.env.serviceName,
    environmentName: process.env.environmentName,
    releaseVersion: process.env.releaseVersion,
    logLevel: process.env.logLevel,
    domain: domain,
    canaryBaseUrl: process.env.canaryBaseUrl,
    secretName: process.env.secretName,
    dbTableName: process.env.dbTableName,
    wellnessTableName: process.env.wellnessTableName,
    voiceJournalAudioBucketName: process.env.voiceJournalAudioBucketName,
    canarySecretsName: process.env.canarySecretsName,
    getScoresMaxRetries: parseInt(process.env.getScoresMaxRetries, 10),
    retryDelay: parseInt(process.env.retryDelay, 10),
    voiceJournalStepFunctionArn: process.env.voiceJournalStepFunctionArn,
    transcribeRoleArn: process.env.transcribeRoleArn,
    getTranscriptionMaxRetries: parseInt(process.env.getTranscriptionMaxRetries, 10),
    getTranscriptionRetryDelay: parseInt(process.env.getTranscriptionRetryDelay, 10)
  });

  container.bind(ContainerKeys.dayJS).toConstantValue(dayJS);
  container.bind(ContainerKeys.envConfig).toConstantValue(envConfig);
  container.bind(ContainerKeys.requestService).toConstantValue(axios);
  container.bind(StepFunctions).toConstantValue(new StepFunctions(stepFunctionOptions));
  container.bind(TranscribeClient).toConstantValue(new TranscribeClient(transcribeConfig));
  container.bind(SecretsManager).toConstantValue(new SecretsManager(secretsManagerOptions));

  // Common Services
  container.bind<LoggerService>(LoggerService).to(LoggerService);

  // Groups
  container.bind<GroupsController>(GroupsController).to(GroupsController);

  // Scores
  container.bind<ScoresController>(ScoresController).to(ScoresController);

  // Users
  container.bind<UsersController>(UsersController).to(UsersController);

  // Organizations
  container.bind<OrganizationsController>(OrganizationsController).to(OrganizationsController);
} catch (error) {
  // Can't rely on the LoggerService class here, since it might have failed during init
  const logOutput = {
    level: "error",
    message: "Error occurred during IOC initialization",
    data: error?.message ?? error,
    timestamp: new Date().toISOString(),
    location: "ioc.container"
  };

  // eslint-disable-next-line no-console
  console.log(logOutput);
}

export { container };
