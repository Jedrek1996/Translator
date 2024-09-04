export type ITranslateRequest = {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
};

export type ITranslateResponse = {
  timeStamp: string;
  targetText: string;
};
