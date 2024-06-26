"use client";

import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";
import matter from "gray-matter";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";

export default function Prompting({ aiSession }: { aiSession: any }) {
  const [prompt, setPrompt] = useState("");
  const [promptIn, setPromptIn] = useState("");
  const [promptOut, setPromptOut] = useState("");
  const [processing, setProcessing] = useState(false);

  const formatResult = async (text: any) => {
    const matterResult = matter(text);
    const result = await remark()
      .use(html, { sanitize: true })
      .process(matterResult.content);
    return result;
  };

  useEffect(() => {
    const streamOutput = async () => {
      setProcessing(true);
      const stream = await aiSession.promptStreaming(
        promptIn +
          ", answer in markdown result. highlight if there's any important subject/object"
      );
      let result = "";
      // const result = await aiSession.prompt(
      //   promptIn + ", answer in markdown result"
      // );
      // console.log({ result });

      let previousLength = 0;
      for await (const chunk of stream) {
        if (chunk) {
          const newContent = chunk.slice(previousLength);
          previousLength = chunk.length;
          result += newContent;
          const tempFinal = await formatResult(result);

          setPromptOut(tempFinal.toString());
        }
      }
      setProcessing(false);
    };
    if (promptIn !== "") {
      if (processing) return;

      streamOutput();
    }
  }, [promptIn]);
  useEffect(() => {
    hljs.highlightAll();
  }, [processing, promptOut, prompt]);
  return (
    <div className="flex flex-col w-full h-full gap-5">
      <div className="flex flex-col gap-1 w-full sticky top-0 bg-white p-2 shadow-md my-2">
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

        <div className="output mb-5">
          <div
            dangerouslySetInnerHTML={{
              __html: promptOut,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
