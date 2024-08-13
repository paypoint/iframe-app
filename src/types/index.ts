export type PaymentGatewayProps = {
  url: string;
  key: string;
  amount: number;
  currency: string;
  name: string;
  image: string;
  receipt: string;
  order_id: string;
  merchantid: number;
  location: GeolocationPosition;
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

export type TransactionStatus =
  | "invalid"
  | "verifying"
  | "processing"
  | "success"
  | "failure";

export type Message = {
  type: EventType;
  payment_id?: string;
  message?: string;
};

export type EventType =
  | "TXN_SUCCESS"
  | "TXN_ERROR"
  | "AMOUNT_ERROR"
  | "IFRAME_APP_ERROR"
  | "API_ERROR"
  | "ERROR"
  | "USER_DISMISSED_HOME_PAGE";

export type CustomErrorT = {
  image: boolean;
  Heading: string;
  Description: string;
};
export type GeolocationData = {
  latitude: number;
  longitude: number;
};

export type APIEndPoints =
  | "/api/v1/getorderdetails"
  | "/api/v1/requestupivalidateaddress"
  | "/api/v1/generatecollectrequest"
  | "/api/v1/generatedynamicqrcode"
  | `/api/v1/getAllTransactionStatus?refId=${string}`;

export type APIResponseType = {
  resultCode: "200" | "400" | "500" | "000";
  resultStatus: "TXN";
  resultMessage: "Success" | "Failure";
};

export type GetOrderDetailsAPIResponseType = {
  data: { name: string; authToken: string; ExpiryIn: number };
} & APIResponseType;

export type requestupivalidateaddressType = {
  data: { vpaHolderName: string; EntityType: string; MCC: number };
} & APIResponseType;

export type GenerateQRCodeAPIResponseType = {
  data: { qrCodeImage: string };
} & APIResponseType;

export type GetTxnStatusAPI = {
  data: {
    TransactionId: string;
    MessageId: string;
    ReferenceId: string;
    CustomerRefNo: string;
    TransactionDate: string;
    TxnTypeName: string;
    TxnStatus: 1 | 2 | 3;
    PayerAddress: string;
    PayerName: string;
    PayeeAddress: string;
    PayeeName: string;
    Amount: number;
    TxnRemarks: string;
    ResponseMessage: string;
    CollectTxnStatus: number;
    ApproveOrDecline: number;
    PayerAccountNumber?: any;
    PayeeAccountNumber?: any;
  };
} & APIResponseType;
