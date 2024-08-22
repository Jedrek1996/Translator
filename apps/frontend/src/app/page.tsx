"use client";
import { useState } from "react";

const URL = "https://341blbb0t5.execute-api.ap-southeast-1.amazonaws.com/prod/";

function translateText({
  inputLang,
  outputLang,
  inputText,
}: {
  inputLang: string;
  outputLang: string;
  inputText: string;
}) {
  return fetch(URL, {
    method: "POST",
    body: JSON.stringify({
      sourceLang: inputLang,
      targetLang: outputLang,
      text: inputText,
    }),
  })
    .then((result) => result.json())
    .catch((e) => e.toString());
}

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [inputLang, setInputLang] = useState<string>("");
  const [outputLang, setOutputLang] = useState<string>("");
  const [outputText, setOutputText] = useState<any>(null);

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
