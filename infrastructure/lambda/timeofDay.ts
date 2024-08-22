import * as clientTranslate from "@aws-sdk/client-translate";
import * as lambda from "aws-lambda";
import { timeStamp } from "console";
const translateClient = new clientTranslate.TranslateClient({});

export const index: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent
) {
  try {
    if (!event.body) {
      throw new Error("Body is empty!");
    }
    const body = JSON.parse(event.body);
    const { sourceLang, targetLang, text } = body;

    const now = new Date(Date.now()).toString();

    console.log(now);
    const translateCmd = new clientTranslate.TranslateTextCommand({
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
      Text: text,
    });
    const result = await translateClient.send(translateCmd);
    console.log(result);

    const rtnDate = {
      timeStamp: now,
      text: result.TranslatedText,
    };

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(rtnDate),
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
