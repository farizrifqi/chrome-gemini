"use client";

import { useEffect } from "react";

import hljs from "highlight.js";
import "highlight.js/styles/default.css";
export default function PrismLoader({ promptOut }: any) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      hljs.highlightAll();
    }
  }, [promptOut]);
  return (
    <div
      className=" "
      dangerouslySetInnerHTML={{
        __html: promptOut,
      }}
    ></div>
  );
}
