"use client";
import { useState } from "react";
import { ITranslateRequest, ITranslateResponse } from "@sff/shared-types";

const URL = "https://341blbb0t5.execute-api.ap-southeast-1.amazonaws.com/prod/";

export const translateText = async ({
  inputLang,
  outputLang,
  inputText,
}: {
  inputLang: string;
  outputLang: string;
  inputText: string;
}) => {
  try {
    const request: ITranslateRequest = {
      sourceLang: inputLang,
      targetLang: outputLang,
      sourceText: inputText,
    };
    const result = await fetch(URL, {
      method: "POST",
      body: JSON.stringify(request),
    });

    const rtnValue = (await result.json()) as ITranslateResponse;
    return rtnValue;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export default function Home() {
  const [inputLang, setInputLang] = useState<string>("");
  const [outputLang, setOutputLang] = useState<string>("");
  const [inputText, setInputText] = useState<string>(""); 
  const [outputText, setOutputText] = useState<ITranslateResponse | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          // console.log({ inputText, inputLang, outputLang });
          const result = await translateText({
            inputText,
            inputLang,
            outputLang,
          });
          setOutputText(result);
        }}
      >
        <div>
          <label htmlFor="inputText">Input Text</label>
          <textarea
            name="inputText"
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="inputLang">Input Lang</label>
          <textarea
            name="inputLang"
            id="inputLang"
            value={inputLang}
            onChange={(e) => setInputLang(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="outputLang">Output Lang</label>
          <textarea
            name="outputLang"
            id="outputLang"
            value={outputLang}
            onChange={(e) => setOutputLang(e.target.value)}
          />
        </div>

        <button className="btn bg-blue-500 p-2 mt-2 rounded-xl" type="submit">
          Translate
        </button>
      </form>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(outputText, null, 2)}
      </pre>
    </main>
  );
}
