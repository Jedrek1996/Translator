export type ITranslateRequest = {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
};

export type ITranslateResponse = {
  timeStamp: string;
  targetText: string;
};

//Combines all the object above plus custom
export type ITranslateDbObject = ITranslateRequest &
  ITranslateResponse & {
    requestId: string;
  };
