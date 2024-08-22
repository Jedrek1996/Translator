import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";

export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Policy to attach to lambda to access translate resource
    const translateAccessPolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    const lambdaFunc = new lambdaNodeJs.NodejsFunction(this, "timeofDay", {
      entry: "./lambda/timeofDay.ts", // Path to Lambda handler
      handler: "index", // Update this if handler function is different
      runtime: lambda.Runtime.NODEJS_20_X,
      initialPolicy: [translateAccessPolicy],
    });

    const restApi = new apigateway.RestApi(this, "timeofDayRestAPI");
    restApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaFunc)
    );
  }
}
