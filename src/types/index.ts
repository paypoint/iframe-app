export type PaymentGatewayProps = {
  url: string;
  key: string;
  amount: number;
  currency: string;
  name: string;
  image: string;
  order_id: string;
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
