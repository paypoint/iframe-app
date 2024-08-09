export type PaymentGatewayProps = {
  url: string;
  key: string;
  amount: number;
  currency: string;
  name: string;
  image: string;
  order_id: string;
  merchantid: number;
  handler: (response: { payment_id: string }) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  modal: {
    ondismiss: () => void;
  };
  onClose: () => void;
  "payment.failed"?: (response: {
    error: { code: string; description: string };
  }) => void;
};

export type PaymentPropsMessage = {
  type: "PAYMENT_PROPS";
  payload: PaymentGatewayProps;
};

export type Message = {
  type: EventType;
  payment_id?: string;
  message?: string;
};

export type EventType =
  | "TXN_SUCCESS"
  | "TXN_ERROR"
  | "AMOUNT_ERROR"
  | "ERROR"
  | "USER_DISMISSED_HOME_PAGE";

export type APIEndPoints =
  | "/api/v1/getorderdetails"
  | "/upi/requestupivalidateaddress"
  | "/upi/RequestUpiCollect"
  | "/upi/generatedynamicqr"
  | "/upi/getAllTransactionStatus?refId=";

export type APIResponseType = {
  resultCode: "200" | "400" | "500";
  resultStatus: "TXN";
  resultMessage: "Success" | "Failure";
};

export type GetOrderDetailsAPIResponseType = {
  name: string;
  authToken: string;
  ExpiryIn: number;
} & APIResponseType;
