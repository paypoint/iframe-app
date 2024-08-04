import { PaymentGatewayProps, PaymentPropsMessage } from "@/types";
import React, { useEffect, useState } from "react";

const App: React.FC<PaymentGatewayProps> = () => {
  const [messageFromParent, setMessageFromParent] = useState("");

  useEffect(() => {
    const handleMessage = (event: {
      data: { type: string; message: React.SetStateAction<string> };
    }) => {
      debugger;
      console.log("Child: Received message", event.data);
      if (event.data.type === "HELLO_MESSAGE") {
        setMessageFromParent(event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const sendMessageToParent = () => {
    console.log("Child: Sending message to parent");
    window.parent.postMessage(
      { type: "CHILD_MESSAGE", message: "Hello from child!" },
      "http://127.0.0.1:5500/index.html"
    );
  };

  return (
    <div>
      <h1>Child App</h1>
      <p>Message from parent: {messageFromParent}</p>
      <button onClick={sendMessageToParent}>Send Message to Parent</button>
    </div>
  );
};

export default App;
