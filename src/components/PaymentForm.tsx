import { FC, useRef, useState } from "react";
import { X, BadgeCheck } from "lucide-react";
import { useCountdown } from "usehooks-ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
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
import { PaymentStatusModal } from "@/components/PaymentStatusModal";
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
import digikhata from "@/assets/digikhata.png";
import placeHolderQrImage from "@/assets/placeholder-qr.svg";

import {
  cn,
  formatCountdown,
  sendMessageToParent,
  thousandSeperator,
} from "@/lib/utils";
import api from "@/services/api";
import crypto from "@/lib/crypto";
import { UPI_ID_REGEX } from "@/lib/constants";

import {
  GenerateQRCodeAPIResponseType,
  GetOrderDetailsAPIResponseType,
  GetTxnStatusAPI,
  PaymentGatewayProps,
  TransactionStatus,
  generatecollectrequestAPIResponseType,
  requestupivalidateaddressType,
} from "@/types";

interface PaymentFormProps {
  config: PaymentGatewayProps;
  orderDetails?: GetOrderDetailsAPIResponseType["data"];
}

const formSchema = z.object({
  upiId: z
    .string()
    .min(1, "UPI ID is required")
    .refine((value) => {
      return UPI_ID_REGEX.test(value);
    }, "Invalid UPI ID "),
});

const PaymentForm: FC<PaymentFormProps> = ({ config, orderDetails }) => {
  const MAX_QR_TIMEOUT = 7 * 60;

  const [isProcessing, setIsProcessing] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [qRImage, setQRImage] = useState<string>();
  const [transactionState, setTransactionState] =
    useState<TransactionStatus>("verifying");
  const [count, { startCountdown, resetCountdown }] = useCountdown({
    countStart: MAX_QR_TIMEOUT,
    intervalMs: 1000,
  });

  const isTransactionCancelledRef = useRef(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      upiId: "",
    },
  });

  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  const onLoadQR = async () => {
    resetCountdown();
    setIsProcessing(true);
    const body = {
      CollectExpiryAfter: 5,
      Amount: config.amount,
      Latitude: config.location.latitude,
      Longitude: config.location.longitude,
      Location: "NA",
    };
    const encryptedBody = crypto.CryptoGraphEncrypt(JSON.stringify(body));
    const headers = {
      Authorization: `bearer ${orderDetails?.authToken}`,
      "x-api-key": "Basic TUExeEo1cHNhajp1eGZSTGUxbHd0S1k=",
      merchantid: config.merchantid,
      orderid: config.order_id,
    };
    try {
      const res = await api.app.post<string>({
        url: "/api/v1/generatedynamicqrcode",
        requestBody: encryptedBody,
        headers: headers,
      });

      const decryptedResponse: GenerateQRCodeAPIResponseType = JSON.parse(
        crypto.CryptoGraphDecrypt(res.data)
      );
      console.log("decryptedResponse", decryptedResponse);
      if (decryptedResponse.resultCode === "000") {
        setQRImage(decryptedResponse.data.qrCodeImage);
        startCountdown();
        isTransactionCancelledRef.current = false;
        setTimeout(async () => {
          await getTxnStatus();
        }, 4000);
      } else {
        toast.error(decryptedResponse.resultMessage);
      }
      setIsProcessing(false);
    } catch (error: any) {
      setIsProcessing(false);
      toast.error(error.message);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setOpenPaymentModal(true);
    isTransactionCancelledRef.current = false;
    const body = {
      vpaAddress: values.upiId,
      vpaHolderName: "NA",
      Latitude: config.location.latitude,
      Longitude: config.location.longitude,
      Location: "NA",
    };
    const encryptedBody = crypto.CryptoGraphEncrypt(JSON.stringify(body));
    const headers = {
      Authorization: `bearer ${orderDetails?.authToken}`,
      "x-api-key": "Basic TUExeEo1cHNhajp1eGZSTGUxbHd0S1k=",
      merchantid: config.merchantid,
      orderid: config.order_id,
    };
    setIsProcessing(true);
    try {
      const res = await api.app.post<string>({
        url: "/api/v1/requestupivalidateaddress",
        requestBody: encryptedBody,
        headers: headers,
        cancelToken: source.token,
      });
      const decryptedResponse: requestupivalidateaddressType = JSON.parse(
        crypto.CryptoGraphDecrypt(res.data)
      );
      setIsProcessing(false);
      console.log("decryptedResponse", decryptedResponse.data);
      if (decryptedResponse.resultCode === "000") {
        setTransactionState("processing");
        await generateCollectRequest(decryptedResponse.data.vpaHolderName);
      } else {
        setTransactionState("invalid");
        toast.error(decryptedResponse.resultMessage);
      }
    } catch (error: any) {
      console.log(error);
      setIsProcessing(false);
      closeModal();
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else if (error.code === "ECONNABORTED") {
        console.log("Request timed out");
      } else {
        toast.error(error.message);
      }
    }
  };

  const generateCollectRequest = async (vpaHolderName: string) => {
    const body = {
      vpaAddress: form.getValues("upiId"),
      vpaHolderName: vpaHolderName,
      Amount: config.amount,
      Latitude: config.location.latitude,
      Longitude: config.location.longitude,
      Location: "NA",
    };
    const encryptedBody = crypto.CryptoGraphEncrypt(JSON.stringify(body));
    const headers = {
      Authorization: `bearer ${orderDetails?.authToken}`,
      "x-api-key": "Basic TUExeEo1cHNhajp1eGZSTGUxbHd0S1k=",
      merchantid: config.merchantid,
      orderid: config.order_id,
    };
    setIsProcessing(true);

    try {
      const res = await api.app.post<string>({
        url: "/api/v1/generatecollectrequest",
        requestBody: encryptedBody,
        headers: headers,
      });
      const decryptedResponse: generatecollectrequestAPIResponseType =
        JSON.parse(crypto.CryptoGraphDecrypt(res.data));
      const { data } = decryptedResponse;
      const parsed = JSON.parse(data);
      setIsProcessing(false);
      console.log("decryptedResponse", decryptedResponse);
      if (
        decryptedResponse.resultCode === "200" ||
        decryptedResponse.resultCode === "000"
      ) {
        setTransactionState("processing");
        setTimeout(async () => {
          await getTxnStatus(Date.now(), parsed.TransactionId);
        }, 2000);
      } else {
        toast.error(decryptedResponse.resultMessage);
        closeModal();
      }
    } catch (error: any) {
      setIsProcessing(false);
      toast.error(error.message);
      closeModal();
    }
  };

  const getTxnStatus = async (
    startTime: number = Date.now(),
    TransactionId?: string
  ) => {
    if (isTransactionCancelledRef.current) return;
    const headers = {
      Authorization: `bearer ${orderDetails?.authToken}`,
      "x-api-key": "Basic TUExeEo1cHNhajp1eGZSTGUxbHd0S1k=",
      merchantid: config.merchantid,
    };
    const url = `/api/v1/getAllTransactionStatus?refId=${config?.order_id}${
      TransactionId ? `&TransactionId=${TransactionId}` : ""
    }`;

    try {
      const res = await api.app.post<string>({
        url,
        headers,
        cancelToken: source.token,
      });

      const decryptedResponse: GetTxnStatusAPI = JSON.parse(
        crypto.CryptoGraphDecrypt(res.data)
      );
      setIsProcessing(false);

      const { data, resultCode } = decryptedResponse;
      const elapsedTime = Date.now() - startTime;
      const timeoutDuration = MAX_QR_TIMEOUT * 1000;

      if (!["200", "000"].includes(resultCode)) {
        throw new Error("Invalid response code");
      }

      if (typeof data === "string" || !data) {
        if (elapsedTime < timeoutDuration) {
          setTimeout(() => getTxnStatus(startTime, TransactionId), 5000);
          return;
        }
        throw new Error("Transaction timed out after 7 minutes");
      } else if (typeof data === "object" && data.TxnStatus !== undefined) {
        const txnStatus = Number(data.TxnStatus);
        if (elapsedTime < timeoutDuration) {
          if (txnStatus === 1) {
            setTimeout(() => getTxnStatus(startTime, TransactionId), 5000);
            return;
          } else if (txnStatus === 3) {
            if (!TransactionId) {
              setOpenPaymentModal(true);
            }
            toast.success("Payment Successful");
            setTransactionState("success");
            setTimeout(() => {
              sendMessageToParent(
                {
                  type: "TXN_SUCCESS",
                  message: "Payment Successful",
                  payment_id: config.order_id,
                  TransactionId: data.TransactionId,
                  CustomerRefNo: data.CustomerRefNo,
                },
                config.url
              );
            }, 5000);
            return;
          } else {
            toast.error("Payment Failed");
            closeModal();
            return;
          }
        }
        throw new Error("Transaction timed out after 7 minutes");
      }

      throw new Error(
        "Transaction is still processing. Please try again later."
      );
    } catch (error: any) {
      console.error(error);
      setIsProcessing(false);
      closeModal();
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else if (error.code === "ECONNABORTED") {
        console.log("Request timed out");
      } else {
        toast.error(error.message);
      }
    }
  };

  const closeModal = () => {
    setOpenPaymentModal(false);
    setTimeout(() => {
      setTransactionState("verifying");
    }, 500);
    source.cancel("Operation canceled by the user.");
    isTransactionCancelledRef.current = true;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="max-w-xl w-[25rem] mx-auto shadow-lg rounded-lg overflow-hidden">
          <div className="p-4 flex bg-primary items-center justify-between">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src={config?.image} alt="Merchant Logo" />
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <h2 className="text-white text-lg font-semibold">
                  {orderDetails?.name}
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
              disabled={isProcessing}
              onClick={(e) => {
                e.preventDefault();
                sendMessageToParent(
                  {
                    type: "USER_DISMISSED_HOME_PAGE",
                    message: "User dismissed payment modal",
                  },
                  config.url
                );
              }}
              size={"icon"}
              className={cn(
                "hover:bg-accent/10 hover:text-accent-foreground",
                isProcessing && "animate-pulse"
              )}
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
                  <div className="relative">
                    <img
                      src={
                        count === MAX_QR_TIMEOUT || count <= 0
                          ? placeHolderQrImage
                          : qRImage
                      }
                      alt="QR Code"
                      className="w-72 h-36"
                      width="100"
                      height="100"
                      style={{
                        aspectRatio: "100/100",
                        objectFit: "cover",
                        filter:
                          count === MAX_QR_TIMEOUT || count <= 0
                            ? "blur(2px)"
                            : "",
                      }}
                    />
                    {(count === MAX_QR_TIMEOUT || count <= 0) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          disabled={isProcessing}
                          size={"xs"}
                          onClick={(e) => {
                            e.preventDefault();
                            onLoadQR();
                          }}
                          className={cn(
                            "px-4",
                            isProcessing && "animate-pulse"
                          )}
                        >
                          Load QR
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-700">
                      Scan the QR using any UPI app on your phone.
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <img width={16} height={16} src={bhim} alt="bhim-logo" />
                      <img
                        width={16}
                        height={16}
                        src={digikhata}
                        alt="digikhata-logo"
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
                      <img width={16} height={16} src={cred} alt="cred-logo" />
                      <img
                        width={16}
                        height={16}
                        src={paytm}
                        alt="paytm-logo"
                      />
                    </div>
                    {count === MAX_QR_TIMEOUT || count <= 0 ? (
                      <p className="text-xs text-gray-500 mt-2">
                        Press button to show QR
                      </p>
                    ) : (
                      <p className="text-xs text-red-500 mt-2">
                        QR Code is valid for {formatCountdown(count)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-base font-semibold mb-1">
                  Pay With UPI ID
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
                            UPI ID
                          </label>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="mt-2">
                        <FormField
                          control={form.control}
                          name="upiId"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  autoFocus
                                  maxLength={50}
                                  id="upi-id-or-mobile"
                                  placeholder="Enter UPI ID"
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
                  ₹ {thousandSeperator(config?.amount)}
                </div>
                <Button
                  disabled={isProcessing || !form.formState.isValid}
                  type="submit"
                  className={cn(isProcessing && "animate-pulse")}
                >
                  Pay Now
                </Button>
              </div>
            </div>
          </div>

          <PaymentStatusModal
            state={transactionState}
            isOpen={openPaymentModal}
            onCloseModal={closeModal}
          />
        </div>
      </form>
    </Form>
  );
};

export default PaymentForm;
