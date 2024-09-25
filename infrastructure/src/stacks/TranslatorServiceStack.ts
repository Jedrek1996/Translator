import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeployment,
} from "../construct";

export class TranslatorServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Paths
    const projectRoot = "../";
    const lambdasDirPath = path.resolve(
      path.join(projectRoot, "packages/lambdas")
    );
    const lambdaLayersDirPath = path.join(
      projectRoot,
      "packages/lambda-layers"
    );

    const restApi = new RestApiService(this, "restApiService", {});

    new TranslationService(this, "translationService", {
      lambdaLayersDirPath,
      lambdasDirPath,
      restApi,
    });

    new StaticWebsiteDeployment(this, "staticWebsiteDeployment");
  }
}
