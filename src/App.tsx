import React, { ErrorInfo, Suspense, useEffect, useState } from "react";

import PaymentForm from "@/components/PaymentForm";
import PaymentFormSkeleton from "@/components/skeletons/PaymentFormSkeleton";

import api from "@/services/api";
import crypto from "@/lib/crypto";
import { sendMessageToParent } from "@/lib/utils";

import { GetOrderDetailsAPIResponseType, PaymentGatewayProps } from "@/types";
import ErrorBoundary from "./services/ErrorBoundary";

const App: React.FC = () => {
  const [config, setConfig] = useState<PaymentGatewayProps>();
  const [orderDetails, setOrderDetails] =
    useState<GetOrderDetailsAPIResponseType["data"]>();

  useEffect(() => {
    const handleMessage = async (event: {
      origin: string;
      data: { type: string; message: string };
    }) => {
      if (event.data.type === "SET_CONFIG") {
        const data = JSON.parse(event.data.message) as PaymentGatewayProps;
        if (data) {
          await getOrderDetails(data, event.origin);
          setConfig(data);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const getOrderDetails = async (data: PaymentGatewayProps, origin: string) => {
    const body = {
      receipt: data.receipt,
      amount: data.amount,
      domain: origin,
    };
    const encryptedBody = crypto.CryptoGraphEncrypt(JSON.stringify(body));
    const headers = {
      "x-api-key": "Basic TUExeEo1cHNhajp1eGZSTGUxbHd0S1k=",
      merchantid: data.merchantid,
      orderid: data.order_id,
      domain: origin,
    };
    try {
      const res = await api.app.post<string>({
        url: "/api/v1/getorderdetails",
        requestBody: encryptedBody,
        headers: headers,
      });
      const decryptedResponse: GetOrderDetailsAPIResponseType = JSON.parse(
        crypto.CryptoGraphDecrypt(res.data)
      );
      if (decryptedResponse.resultStatus === "TXN") {
        setOrderDetails(decryptedResponse.data);
      } else {
        sendMessageToParent(
          { type: "ERROR", message: decryptedResponse.resultMessage },
          config?.url
        );
      }
    } catch (error: any) {
      sendMessageToParent(
        { type: "ERROR", message: error.message },
        config?.url
      );
    }
  };

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    sendMessageToParent(
      { type: "IFRAME_APP_ERROR", message: error.message },
      config?.url
    );
  };

  return (
    <ErrorBoundary onError={handleError}>
      <Suspense fallback={<PaymentFormSkeleton />}>
        {config && orderDetails ? (
          <PaymentForm config={config} orderDetails={orderDetails} />
        ) : (
          <PaymentFormSkeleton />
        )}
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
