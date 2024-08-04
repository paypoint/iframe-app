import { PaymentGatewayProps } from "@/types";
import React, { useEffect, useState } from "react";

const App: React.FC = () => {
  const [messageFromParent, setMessageFromParent] =
    useState<PaymentGatewayProps>();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleMessage = (event: {
      data: { type: string; message: string };
    }) => {
      console.log("Child: Received message", event.data);
      if (event.data.type === "HELLO_MESSAGE") {
        setMessageFromParent(JSON.parse(event.data.message));
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
      { type: "CHILD_MESSAGE", message: "Modal dimiss" },
      "http://127.0.0.1:5500/index.html"
    );
  };

  const apiCall = async () => {
    const response = await fetch("/api")
      .then((response) => response.json())
      .then((json) => console.log(json));

    console.log("response", response);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (messageFromParent?.name.toLowerCase() === "viru") {
        // If the name is "viru", payment is always successful
        window.parent.postMessage(
          {
            type: "TXN_SUCCESS",
            payment_id: messageFromParent?.name + "SUCCESS" + Math.random(),
          },
          "http://127.0.0.1:5500/index.html"
        );
      } else if (messageFromParent?.amount! < 1000) {
        // amount is in paise, so 1000 paise = 10 INR
        // If amount is less than 10 INR, payment fails
        window.parent.postMessage(
          {
            type: "AMOUNT_ERROR",
            payment_id: "Payment failed: Amount should be at least 10 INR",
          },
          "http://127.0.0.1:5500/index.html"
        );
      } else {
        // For all other cases, use the random success/failure
        if (Math.random() > 0.5) {
          window.parent.postMessage(
            {
              type: "TXN_SUCCESS",
              payment_id: messageFromParent?.name + "SUCCESS" + Math.random(),
            },
            "http://127.0.0.1:5500/index.html"
          );
        } else {
          window.parent.postMessage(
            { type: "ERROR", payment_id: "Payment failed" },
            "http://127.0.0.1:5500/index.html"
          );
        }
      }
    }, 2000);
  };
  return (
    <div>
      {messageFromParent && (
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
            maxWidth: "400px",
            width: "100%",
          }}
          className="payment-gateway-modal"
        >
          <h2 style={{ marginTop: 0 }}>{messageFromParent.name}</h2>
          <img
            style={{ maxWidth: "100%", height: "auto" }}
            src={messageFromParent.image}
            alt={messageFromParent.name}
          />
          <p>
            Amount: {messageFromParent.amount} {messageFromParent.currency}
          </p>
          <p>Customer: {messageFromParent.prefill.name}</p>
          <button
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => handlePayment()}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </button>
          <button
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={sendMessageToParent}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
