import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { BadgeCheck } from "lucide-react";
import { useCountdown } from "usehooks-ts";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import bhim from "@/assets/bhim.svg";
import phonepe from "@/assets/phonepe.svg";
import googlepay from "@/assets/googlepay.svg";
import cred from "@/assets/cred_circle.png";
import paytm from "@/assets/paytm.svg";

import { PaymentGatewayProps } from "@/types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./components/ui/accordion";

const App: React.FC = () => {
  const [config, setConfig] = useState<PaymentGatewayProps>();
  const [isProcessing, setIsProcessing] = useState(false);

  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: 60,
      intervalMs: 1000,
    });

  useEffect(() => {
    const handleMessage = (event: {
      data: { type: string; message: string };
    }) => {
      console.log("Child: Received message", event.data);
      if (event.data.type === "HELLO_MESSAGE") {
        const data = JSON.parse(event.data.message) as PaymentGatewayProps;
        setConfig(data);
      }
      startCountdown();
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
      config?.url!
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
      if (config?.name.toLowerCase() === "viru") {
        // If the name is "viru", payment is always successful
        window.parent.postMessage(
          {
            type: "TXN_SUCCESS",
            payment_id: config?.name + "SUCCESS" + Math.random(),
          },
          config?.url!
        );
      } else if (config?.amount! < 1000) {
        // amount is in paise, so 1000 paise = 10 INR
        // If amount is less than 10 INR, payment fails
        window.parent.postMessage(
          {
            type: "AMOUNT_ERROR",
            payment_id: "Payment failed: Amount should be at least 10 INR",
          },
          config?.url!
        );
      } else {
        // For all other cases, use the random success/failure
        if (Math.random() > 0.5) {
          window.parent.postMessage(
            {
              type: "TXN_SUCCESS",
              payment_id: config?.name + "SUCCESS" + Math.random(),
            },
            config?.url!
          );
        } else {
          window.parent.postMessage(
            { type: "ERROR", payment_id: "Payment failed" },
            config?.url!
          );
        }
      }
    }, 2000);
  };
  return (
    <div>
      {config && (
        <div className="max-w-xl w-96  mx-auto shadow-lg rounded-lg overflow-hidden">
          <div className="p-4 flex bg-[#1E90FF] items-center justify-between">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage
                  src={config?.image}
                  alt="Merchant Logo"
                  className="ring-4 border ring-white"
                />
                <AvatarFallback>P</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <h2 className="text-white text-lg font-semibold">
                  {config?.name}
                </h2>
                <div className="flex items-center space-x-1">
                  <BadgeCheck className="text-green-500 h-4 w-4" />
                  <span className="text-xs text-white">
                    DigiKhata Trusted Business
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant={"ghost"}
              onClick={() => sendMessageToParent()}
              size={"icon"}
            >
              <X className="text-white h-6 w-6" />
            </Button>
          </div>

          <div className="p-4 ">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">
                Pay With UPI QR
              </h3>
              <div className="border p-4 rounded-md flex items-center bg-white">
                <img
                  src="/placeholder.svg"
                  alt="QR Code"
                  className="w-24 h-24"
                  width="100"
                  height="100"
                  style={{ aspectRatio: "100/100", objectFit: "cover" }}
                />
                <div className="ml-4">
                  <p className="text-gray-700">
                    Scan the QR using any UPI app on your phone.
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <img width={16} height={16} src={bhim} alt="bhim-logo" />
                    <img
                      width={16}
                      height={16}
                      src={phonepe}
                      alt="phonepe-logo"
                    />
                    <img
                      width={16}
                      height={16}
                      src={googlepay}
                      alt="googlepay-logo"
                    />
                    <img width={16} height={16} src={cred} alt="cred-logo" />
                    <img width={16} height={16} src={paytm} alt="paytm-logo" />
                  </div>
                  <p className="text-sm text-red-500 mt-2">
                    QR Code is valid for{" "}
                    <span className="text-red-500">{count}</span> minutes
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">
                Pay With UPI ID/ Mobile Number
              </h3>
              <div className="border p-4 rounded-md bg-white">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <div className="flex items-center mb-2">
                        <svg
                          className="h-6 w-6"
                          viewBox="0 0 21 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.516 20.254l9.15-8.388-6.1-8.388-1.185 6.516 1.629 2.042-2.359 1.974-1.135 6.244zM12.809.412l8 11a1 1 0 0 1-.133 1.325l-12 11c-.707.648-1.831.027-1.66-.916l1.42-7.805 3.547-3.01-1.986-5.579 1.02-5.606c.157-.865 1.274-1.12 1.792-.41z"
                            fill="rgba(0, 146, 387, 1)"
                          ></path>
                          <path
                            d="M5.566 3.479l-3.05 16.775 9.147-8.388-6.097-8.387zM5.809.412l7.997 11a1 1 0 0 1-.133 1.325l-11.997 11c-.706.648-1.831.027-1.66-.916l4-22C4.174-.044 5.292-.299 5.81.412z"
                            fill="rgba(0, 73, 194, 1)"
                          ></path>
                        </svg>

                        <label
                          htmlFor="upi-id"
                          className="ml-2 flex-1 text-gray-700"
                        >
                          UPI ID/ Mobile Number
                        </label>
                        {/* <Check className="h-6 w-6 text-[#1E90FF]" /> */}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Input
                        maxLength={50}
                        id="upi-id"
                        placeholder="Enter UPI ID/ Mobile Number"
                        className="w-full"
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold text-white">
                ₹ {config?.amount}
              </div>
              <Button
                disabled={isProcessing}
                onClick={() => handlePayment()}
                // className="bg-[#1E90FF] text-white"
              >
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
