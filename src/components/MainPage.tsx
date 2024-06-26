"use client";

import { useEffect, useState } from "react";
import Prompting from "./views/prompting";
import { CustomWindow } from "./window";
// Cast window to the CustomWindow interface
const componentMapping: { [key: number]: (props?: any) => JSX.Element } = {
  0: (props?: any) => <Message {...props} />,
  1: (props?: any) => <Prompting {...props} />,
  2: (props?: any) => <Message {...props} />,
  3: (props?: any) => <Message {...props} />,
};

const message: { [key: number]: string } = {
  0: "Preparing...",
  1: "Ready",
  2: "Failed. Model not available",
  3: "Gemini Not supported",
};

export default function MainPage() {
  const [loaded, setLoaded] = useState(0 as number);
  const [attempt, setAttempt] = useState(0 as number);
  const [aiSession, setAISession] = useState({} as any);
  useEffect(() => {
    const customWindow = window as CustomWindow;
    if (typeof window !== "undefined") {
      if (typeof customWindow.ai !== "undefined") {
        customWindow.ai.canCreateTextSession().then((res: any) => {
          if (res != "readily") {
            if (attempt < 3) {
              setAttempt(attempt + 1);
            } else {
              setLoaded(2);
            }
            return;
          }
          customWindow.ai.createTextSession().then((ses: any) => {
            setAISession(ses);
            setLoaded(1);
          });
        });
      } else {
        if (attempt < 3) {
          setAttempt(attempt + 1);
        } else {
          setLoaded(3);
        }
      }
    }
  }, [attempt]);
  return (
    <div className="h-full flex flex-col items-center p-10 gap-5 w-full max-w-screen-xl">
      {componentMapping[loaded]({ message: message[loaded], aiSession })}
    </div>
  );
}

function Message({ message }: { message: string }) {
  return <div className="animate-bounce">{message}</div>;
}
