import React, { useEffect, useState } from "react";
import { X, BadgeCheck } from "lucide-react";
import { type AxiosError } from "axios";
import { useCountdown } from "usehooks-ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/ui/PaymentModal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import bhim from "@/assets/bhim.svg";
import phonepe from "@/assets/phonepe.svg";
import googlepay from "@/assets/googlepay.svg";
import cred from "@/assets/cred_circle.png";
import paytm from "@/assets/paytm.svg";

import { formatCountdown, sendMessageToParent } from "@/lib/utils";
import { MOBILE_NUMBER_REGEX, UPI_ID_REGEX } from "@/lib/constants";

import { PaymentGatewayProps } from "@/types";
import api from "@/services/api";
import crypto from "@/lib/crypto";

const formSchema = z.object({
  upiIdOrMobile: z
    .string()
    .min(1, "UPI ID or Mobile Number is required")
    .refine((value) => {
      return UPI_ID_REGEX.test(value) || MOBILE_NUMBER_REGEX.test(value);
    }, "Invalid UPI ID or Mobile Number"),
});
const App: React.FC = () => {
  const [config, setConfig] = useState<PaymentGatewayProps>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  const [count, { startCountdown, resetCountdown }] = useCountdown({
    countStart: 120,
    intervalMs: 1000,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      upiIdOrMobile: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    setOpenPaymentModal(true);
    getOrderDetails();
  };

  useEffect(() => {
    const handleMessage = (event: {
      data: { type: string; message: string };
    }) => {
      if (event.data.type === "SET_CONFIG") {
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

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (config?.name.toLowerCase() === "viru") {
        // If the name is "viru", payment is always successful

        sendMessageToParent(
          {
            type: "TXN_SUCCESS",
            payment_id: config.name + "SUCCESS" + Math.random(),
          },
          config.url
        );
      } else if (config?.amount! < 10) {
        // amount is in paise, so 1000 paise = 10 INR
        // If amount is less than 10 INR, payment fails
        sendMessageToParent(
          {
            type: "AMOUNT_ERROR",
            payment_id: "Payment failed: Amount should be at least 10 INR",
          },
          config?.url
        );
      } else {
        // For all other cases, use the random success/failure
        if (Math.random() > 0.5) {
          sendMessageToParent(
            {
              type: "TXN_SUCCESS",
              payment_id: config?.name + "SUCCESS" + Math.random(),
            },
            config?.url
          );
        } else {
          sendMessageToParent(
            { type: "ERROR", payment_id: "Payment failed" },
            config?.url
          );
        }
      }
    }, 2000);
  };

  const getOrderDetails = async () => {
    const body = {
      receipt: "U2408050003160233037",
      amount: "10.00",
    };
    const encryptedBody = crypto.CryptoGraphEncrypt(JSON.stringify(body));
    const headers = {
      "x-api-key": "Basic TUExeEo1cHNhajp1eGZSTGUxbHd0S1k=",
      merchantid: config?.merchantid,
      orderid: config?.order_id,
    };

    await api.app
      .post<any>({
        url: "/api/v1/getorderdetails",
        requestBody: encryptedBody,
        headers: headers,
      })
      .then(async (res) => {
        const { data } = res;
        if (data.status === "Success") {
        } else {
        }
      })
      .catch((error: AxiosError) => {});
  };

  return (
    <div>
      {config && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="max-w-xl w-[25rem] mx-auto shadow-lg rounded-lg overflow-hidden">
              <div className="p-4 flex bg-primary items-center justify-between">
                <div className="flex items-center">
                  <Avatar>
                    <AvatarImage src={config?.image} alt="Merchant Logo" />
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
                  onClick={() =>
                    sendMessageToParent(
                      {
                        type: "USER_DISMISSED_HOME_PAGE",
                        message: "User dismissed payment modal",
                      },
                      config.url
                    )
                  }
                  size={"icon"}
                  className="hover:bg-accent/10 hover:text-accent-foreground"
                >
                  <X className="text-white h-6 w-6" />
                </Button>
              </div>

              <div className="flex flex-col bg-white">
                <div className="p-4 flex-1">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold mb-1">
                      Pay With UPI QR
                    </h3>
                    <div className="border p-4 rounded-md flex  bg-white">
                      {/* <div className="relative w-24 h-24 inline-block"> */}
                      <img
                        src="/placeholder.svg"
                        alt="QR Code"
                        className="w-36 h-36"
                        width="100"
                        height="100"
                        style={{
                          aspectRatio: "100/100",
                          objectFit: "cover",
                          filter: count <= 0 ? "blur(4px)" : "",
                        }}
                      />
                      {count <= 0 && (
                        <Button
                          size={"xs"}
                          onClick={() => {
                            resetCountdown();

                            startCountdown();
                          }}
                          className="absolute top-48  left-16 z-10  p-2"
                        >
                          Refresh QR
                        </Button>
                      )}

                      {/* </div> */}
                      <div className="ml-4">
                        <p className="text-gray-700">
                          Scan the QR using any UPI app on your phone.
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <img
                            width={16}
                            height={16}
                            src={bhim}
                            alt="bhim-logo"
                          />
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
                          <img
                            width={16}
                            height={16}
                            src={cred}
                            alt="cred-logo"
                          />
                          <img
                            width={16}
                            height={16}
                            src={paytm}
                            alt="paytm-logo"
                          />
                        </div>
                        {count <= 0 ? (
                          <p className="text-xs text-gray-500 mt-2">
                            The previous QR got expired{" "}
                          </p>
                        ) : (
                          <p className="text-xs text-red-500 mt-2">
                            QR Code is valid for{" "}
                            <span className="text-red-500">
                              {formatCountdown(count)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-base font-semibold mb-1">
                      Pay With UPI ID/ Mobile Number
                    </h3>
                    <div className="border p-4 rounded-md bg-white">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>
                            <div className="flex items-center">
                              <svg
                                className="h-5 w-5"
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
                                className="ml-2 flex-1 items-center text-gray-700"
                              >
                                UPI ID/ Mobile Number
                              </label>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="mt-2">
                            <FormField
                              control={form.control}
                              name="upiIdOrMobile"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      autoFocus
                                      maxLength={50}
                                      id="upi-id-or-mobile"
                                      placeholder="Enter UPI ID or Mobile Number"
                                      className="w-full"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold">
                      ₹ {config?.amount}
                    </div>
                    <Button
                      disabled={isProcessing || !form.formState.isValid}
                      type="submit"
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              </div>

              <PaymentModal
                isOpen={openPaymentModal}
                setIsOpen={setOpenPaymentModal}
              />
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default App;
