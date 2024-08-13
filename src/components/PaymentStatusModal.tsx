import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "./ui/separator";
import Loader from "./loader";
import { TransactionStatus } from "@/types";
import { useCountdown } from "usehooks-ts";
import { useEffect } from "react";

type PaymentStatusModalProps = {
  isOpen: boolean;
  state: TransactionStatus;
  onCloseModal: () => void;
};

export function PaymentStatusModal({
  isOpen,
  state,
  onCloseModal,
}: PaymentStatusModalProps) {
  const [count, { startCountdown, resetCountdown }] = useCountdown({
    countStart: 5,
    intervalMs: 1000,
  });

  useEffect(() => {
    if (state === "success") {
      startCountdown();
    }
  }, [state]);
  return (
    <Sheet modal open={isOpen}>
      <SheetContent side={"bottom"}>
        <SheetHeader className="items-center">
          {state === "invalid" && (
            <>
              <SheetTitle>Invalid Input</SheetTitle>
              <SheetDescription>
                The UPI ID you entered is invalid. Please check and try again.
              </SheetDescription>
            </>
          )}
          {state === "verifying" && (
            <>
              <SheetTitle>Verifying</SheetTitle>
              <SheetDescription>
                We are verifying your UPI ID. Please wait.
              </SheetDescription>
              <Loader />
            </>
          )}
          {state === "processing" && (
            <>
              <SheetTitle>Payment Processing</SheetTitle>
              <SheetDescription>
                Please open your UPI app and accept the request from Merchant
                Name's UPI ID to complete the payment.
              </SheetDescription>
              <Loader />
            </>
          )}
          {state === "success" && (
            <>
              <SheetTitle>Payment Successful</SheetTitle>
              <SheetDescription>
                Your payment was successful. Thank you! <br />
                <p className="text-xs text-gray-500 mt-2">Closing in {count}</p>
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        {state !== "success" && (
          <>
            <Separator className="my-4" />
            <div className="text-xs flex justify-center items-center">
              {state !== "invalid" && "Wrong UPI ID? "}
              <Button variant={"link"} onClick={() => onCloseModal()}>
                Cancel Payment
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
