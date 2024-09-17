import * as clientTranslate from "@aws-sdk/client-translate";
import { ITranslateRequest } from "@sff/shared-types";

export async function getTranslation({
  sourceLang,
  targetLang,
  sourceText,
}: ITranslateRequest) {
  const translateClient = new clientTranslate.TranslateClient({});

  const translateCmd = new clientTranslate.TranslateTextCommand({
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang,
    Text: sourceText,
  });

  const result = await translateClient.send(translateCmd);
  console.log(result);

  return result;
}
