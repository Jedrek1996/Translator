import * as clientTranslate from "@aws-sdk/client-translate";
import * as lambda from "aws-lambda";
import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  ITranslateDbObject,
  ITranslateRequest,
  ITranslateResponse,
} from "@sff/shared-types";

//Provided
const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;

console.log(TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY);

if (!TRANSLATION_TABLE_NAME) {
  throw new Error("TRANSLATION_TABLE_NAME is empty! ");
}
if (!TRANSLATION_PARTITION_KEY) {
  throw new Error("TRANSLATION_PARTITION_KEY is empty! ");
}
const translateClient = new clientTranslate.TranslateClient({});
const dynamoDbClient = new dynamodb.DynamoDBClient({});

export const translate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new Error("Body is empty!");
    }
    console.log(event.body);
    const body = JSON.parse(event.body) as ITranslateRequest;
    const { sourceLang, targetLang, sourceText } = body;

    const now = new Date(Date.now()).toString();

    console.log(now);
    const translateCmd = new clientTranslate.TranslateTextCommand({
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
      Text: sourceText,
    });
    const result = await translateClient.send(translateCmd);
    console.log(result);

    if (!result.TranslatedText) {
      throw new Error("Translation is empty!");
    }

    const rtnData: ITranslateResponse = {
      timeStamp: now,
      targetText: result.TranslatedText,
    };

    //Save data into translation table in db
    const tableObj: ITranslateDbObject = {
      requestId: context.awsRequestId,
      ...body,
      ...rtnData,
    };

    const tableInsertCmd: dynamodb.PutItemCommandInput = {
      TableName: TRANSLATION_TABLE_NAME,
      Item: marshall(tableObj),
    };

    await dynamoDbClient.send(new dynamodb.PutItemCommand(tableInsertCmd));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(rtnData),
    };
  } catch (error: any) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(error.toString()),
    };
  }
};

export const getTranslation: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    const scanCmd: dynamodb.ScanCommandInput = {
      TableName: TRANSLATION_TABLE_NAME,
    };

    console.log("Scancmd", scanCmd);

    const { Items } = await dynamoDbClient.send(
      new dynamodb.ScanCommand(scanCmd)
    );

    if (!Items) {
      throw new Error("No items found");
    }

    console.log("Items", Items);
    const rtnData = Items.map((item) => unmarshall(item) as ITranslateDbObject);
    console.log(rtnData);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(rtnData),
    };
  } catch (error: any) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(error.toString()),
    };
  }
};
