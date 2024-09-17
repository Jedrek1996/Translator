import * as lambda from "aws-lambda";
import {
  ITranslateDbObject,
  ITranslateRequest,
  ITranslateResponse,
} from "@sff/shared-types";
import {
  gateway,
  getTranslation,
  exception,
  TranslationTable,
} from "/opt/nodejs/utils-lambda-layers";

//Provided
const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;

if (!TRANSLATION_TABLE_NAME) {
  throw new exception.MissingEnvironmentVariable(
    "TRANSLATION_TABLE_NAME is empty! "
  );
}
if (!TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvironmentVariable(
    "TRANSLATION_PARTITION_KEY is empty! "
  );
}

const translateTable = new TranslationTable({
  tableName: TRANSLATION_TABLE_NAME,
  partitionKey: TRANSLATION_PARTITION_KEY,
});

export const translate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new exception.MissingBodyData();
    }

    let body = JSON.parse(event.body) as ITranslateRequest;

    if (!body.sourceLang) {
      throw new exception.MissingParameters("sourceLang");
    }
    if (!body.targetLang) {
      throw new exception.MissingParameters("targetLang");
    }
    if (!body.sourceText) {
      throw new exception.MissingParameters("sourceText");
    }

    const now = new Date(Date.now()).toString();

    console.log(now);

    const result = await getTranslation(body);

    if (!result.TranslatedText) {
      throw new exception.MissingParameters("Translation is empty!");
    }

    const rtnData: ITranslateResponse = {
      timeStamp: now,
      targetText: result.TranslatedText,
    };
    const { sourceLang, targetLang, sourceText } = body;

    //Save data into translation table in db
    const tableObj: ITranslateDbObject = {
      requestId: context.awsRequestId,
      ...body,
      ...rtnData,
    };

    await translateTable.insert(tableObj);

    return gateway.createSuccessJsonResponse(rtnData);
  } catch (error: any) {
    console.error(error);
    return gateway.createErrorJsonResponse(error);
  }
};

export const getTranslations: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    const rtnData = await translateTable.getAll();
    console.log(rtnData);

    return gateway.createSuccessJsonResponse(rtnData);
  } catch (error: any) {
    console.error(error);
    return gateway.createErrorJsonResponse(error);
  }
};
