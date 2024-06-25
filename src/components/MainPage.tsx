"use client";

import { useEffect, useState } from "react";
import Prompting from "./views/prompting";
import { CustomWindow } from "./window";
// Cast window to the CustomWindow interface
const componentMapping: { [key: number]: (props?: any) => JSX.Element } = {
  0: (props?: any) => <Message {...props} />,
  1: (props?: any) => <Prompting />,
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
  useEffect(() => {
    const customWindow = window as CustomWindow;

    if (typeof window !== "undefined") {
      if (typeof customWindow.ai !== "undefined") {
        customWindow.ai.canCreateTextSession().then((res: any) => {
          if (res != "readily") {
            setLoaded(2);
            return;
          }
          setLoaded(1);
        });
      } else {
        setLoaded(3);
      }
    }
  }, []);
  return (
    <div className="h-full flex flex-col items-center p-10 gap-5 w-full max-w-screen-xl">
      {componentMapping[loaded]({ message: message[loaded] })}
    </div>
  );
}

function Message({ message }: { message: string }) {
  return <div className="animate-bounce">{message}</div>;
}
