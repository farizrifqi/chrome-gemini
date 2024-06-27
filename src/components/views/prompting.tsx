"use client";

import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";
import matter from "gray-matter";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";

const promptingRules = [
  "Respond in a friendly tone",
  "Use the category ambiguous if it's unclear",
  "Do not provide any explanation.",
  "Result in markdown.",
];

export default function Prompting({
  aiSession,
  resetSession,
  sesOptions,
  setSesOptions,
}: {
  aiSession: any;
  resetSession: any;
  sesOptions: any;
  setSesOptions: any;
}) {
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
      const stream = await aiSession.promptStreaming(
        promptIn + ". For your answer please:" + promptingRules.join(",")
      );
      let result = "";

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
    };
    if (promptIn !== "") {
      if (processing) return;
      setProcessing(true);
      streamOutput()
        .then(() => {
          setProcessing(false);
          setPromptIn("");
        })
        .catch((err) => {
          setProcessing(false);
          setPromptIn("");
        });
    }
  }, [promptIn]);
  useEffect(() => {
    hljs.highlightAll();
  }, [processing, promptOut, prompt]);
  const changeOpt = (key: any, value: any) => {
    let temp = { ...sesOptions };
    temp[key] = value;
    setSesOptions(temp);
  };
  return (
    <div className="flex flex-col w-full h-full gap-5">
      <div className="flex flex-col gap-1 w-full sticky top-0 bg-white p-2 shadow-md my-2">
        <label className="text-base">Input</label>
        <div className="flex w-1/2 gap-5">
          <div className="flex flex-col w-24">
            <label>Temperature</label>
            <input
              className="border outline-none px-3 py-1 rounded-md"
              value={sesOptions.temperature}
              onChange={(e) => changeOpt("temperature", e.target.value)}
            />
          </div>
          <div className="flex flex-col w-24">
            <label>TopK</label>
            <input
              className="border outline-none px-3 py-1 rounded-md"
              value={sesOptions.topK}
              onChange={(e) => changeOpt("topK", e.target.value)}
            />
          </div>
        </div>
        <textarea
          className="text-base p-2.5 outline-none border rounded-lg w-full"
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        ></textarea>
        <div className="flex">
          <button
            className="px-3 py-1 border rounded-md hover:shadow-md shadow-sm disabled:bg-gray-300 disabled:hover:shadow-sm disabled:hover:cursor-not-allowed"
            onClick={() => setPromptIn(prompt)}
            disabled={processing}
          >
            Ask
          </button>
          <button
            className="px-3 py-1 border rounded-md hover:shadow-md shadow-sm disabled:bg-gray-300 disabled:hover:shadow-sm disabled:hover:cursor-not-allowed"
            onClick={() => resetSession()}
            disabled={processing}
          >
            Reset Session
          </button>
        </div>
        {processing && (
          <div className="text-sm animate-bounce">Processing...</div>
        )}
      </div>
      <div className="flex flex-col gap-1 w-full">
        <label className="text-base">Output</label>
        {promptOut && promptIn && <p>{promptIn}</p>}
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
