import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as path from "path";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import { RestApiService } from "./RestApiService";

export interface ITranslationServiceProps extends cdk.StackProps {
  lambdasDirPath: string;
  lambdaLayersDirPath: string;
  restApi: RestApiService;
}

export class TranslationService extends Construct {
  public restApi: apigateway.RestApi;
  constructor(
    scope: Construct,
    id: string,
    { lambdasDirPath, lambdaLayersDirPath, restApi }: ITranslationServiceProps
  ) {
    super(scope, id);

    const translateLambdaPath = path.join(lambdasDirPath, "translate/index.ts");

    const utilsLambdaLayerPath = path.resolve(
      path.join(lambdaLayersDirPath, "utils-lambda-layer")
    );

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


    //Lambda Layer
    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(utilsLambdaLayerPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    //Lambda Translate function
    const translateLambda = new lambdaNodeJs.NodejsFunction(
      this,
      "translateLambda",
      {
        entry: translateLambdaPath, // Path to Lambda handler
        handler: "translate", // Update this if handler function is different
        runtime: lambda.Runtime.NODEJS_20_X,
        initialPolicy: [translateServicePolicy, translateTablePolicy],
        layers: [utilsLambdaLayer],
        // bundling:{
        //   externalModules:["/opt/nodejs/utils-lambda-layers"]
        // },
        environment: {
          TRANSLATION_TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    restApi.addTranslateMethod({
      httpMethod: "POST",
      lambda: translateLambda,
    });

    //Get translation lambda
    const getTranslationLambda = new lambdaNodeJs.NodejsFunction(
      this,
      "getTranslationLambda",
      {
        entry: translateLambdaPath, // Path to Lambda handler
        handler: "getTranslations", // Update this if handler function is different
        runtime: lambda.Runtime.NODEJS_20_X,
        initialPolicy: [translateTablePolicy],
        layers: [utilsLambdaLayer],
        environment: {
          TRANSLATION_TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    restApi.addTranslateMethod({
      httpMethod: "GET",
      lambda: getTranslationLambda,
    });
  }
}
