import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";

export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const projectRoot = "../";
    const lambdasDirPath = path.resolve(
      path.join(projectRoot, "packages/lambdas")
    );

    //DynamoDb
    const table = new dynamoDb.Table(this, "translation", {
      tableName: "translation",
      partitionKey: {
        name: "requestId",
        type: dynamoDb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    //Translate access policy
    const translateServicePolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    //Policy to attach to lambda to access translate resource
    const translateTablePolicy = new iam.PolicyStatement({
      actions: [
        "dynamodb:PutItem",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
      ],
      resources: ["*"],
    });

    const translateLambdaPath = path.join(lambdasDirPath, "translate/index.ts");

    const restApi = new apigateway.RestApi(this, "timeofDayRestAPI");
    //Lambda Translate function
    const translateLambda = new lambdaNodeJs.NodejsFunction(this, "translateLambda", {
      entry: translateLambdaPath, // Path to Lambda handler
      handler: "translate", // Update this if handler function is different
      runtime: lambda.Runtime.NODEJS_20_X,
      initialPolicy: [translateServicePolicy, translateTablePolicy],
      environment: {
        TRANSLATION_TABLE_NAME: table.tableName,
        TRANSLATION_PARTITION_KEY: "requestId",
      },
    });

    restApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(translateLambda)
    );

    //Get translation lambda 
    const getTranslationLambda = new lambdaNodeJs.NodejsFunction(this, "getTranslationLambda", {
      entry: translateLambdaPath, // Path to Lambda handler
      handler: "getTranslation", // Update this if handler function is different
      runtime: lambda.Runtime.NODEJS_20_X,
      initialPolicy: [ translateTablePolicy],
      environment: {
        TRANSLATION_TABLE_NAME: table.tableName,
        TRANSLATION_PARTITION_KEY: "requestId",
      },
    });



    restApi.root.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getTranslationLambda)
    );
  }
}
