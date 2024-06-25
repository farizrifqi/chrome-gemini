"use client";

import { useEffect, useState } from "react";
import { CustomWindow } from "../window";
import { remark } from "remark";
import html from "remark-html";
import matter from "gray-matter";
import PrismLoader from "../prism-loader";

export default function Prompting() {
  const [prompt, setPrompt] = useState("");
  const [promptIn, setPromptIn] = useState("");
  const [promptOut, setPromptOut] = useState("");
  const [processing, setProcessing] = useState(false);

  const formatResult = async (text: any) => {
    const matterResult = matter(text);
    const result = await remark()
      .use(html, { sanitize: false })
      .process(matterResult.content);
    return result;
  };

  useEffect(() => {
    const customWindow = window as CustomWindow;

    if (promptIn !== "") {
      customWindow.ai.canCreateTextSession().then(() => {
        setProcessing(true);
        customWindow.ai.createTextSession().then(async (session: any) => {
          // session
          //   .prompt(promptIn)
          //   .then((res: any) => {
          //     formatResult(res).then((finalRes: any) => {
          //       console.log({ finalRes });
          //       setPromptOut(finalRes);
          //     });
          //     setProcessing(false);
          //   })
          //   .catch((err: any) => {
          //     console.log({ err });
          //     setProcessing(false);
          //   });
          // await session.prompt(`
          //   You are a friendly, helpful assistant specialized in programming, bussiness intelligence, and data analysis. Answer in markdown result.
          // `);

          const stream = session.promptStreaming(
            promptIn + ", answer in markdown result"
          );
          for await (const chunk of stream) {
            formatResult(chunk).then((finalRes: any) => {
              setPromptOut(finalRes);
            });
          }
          setProcessing(false);
        });
      });
    }
  }, [promptIn]);

  return (
    <div className="flex w-full h-full gap-5">
      <div className="flex flex-col gap-1 w-1/2">
        <label className="text-base">Input</label>
        <textarea
          className="text-base p-2.5 outline-none border rounded-lg w-full"
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        ></textarea>
        <button
          className="px-3 py-1 border rounded-md hover:shadow-md shadow-sm disabled:bg-gray-300 disabled:hover:shadow-sm disabled:hover:cursor-not-allowed"
          onClick={() => setPromptIn(prompt)}
          disabled={processing}
        >
          Ask
        </button>
        {processing && (
          <div className="text-sm animate-bounce">Processing...</div>
        )}
      </div>
      <div className="flex flex-col gap-1 w-full">
        <label className="text-base">Output</label>

        <PrismLoader promptOut={promptOut.toString()} />
      </div>
    </div>
  );
}
