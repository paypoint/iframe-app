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

type PaymentStatusModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  state: TransactionStatus;
};

export function PaymentStatusModal({
  isOpen,
  setIsOpen,
  state,
}: PaymentStatusModalProps) {
  return (
    <Sheet modal open={isOpen}>
      <SheetContent side={"bottom"}>
        <SheetHeader className="items-center">
          {state === "invalid" && (
            <>
              <SheetTitle>Invalid Input</SheetTitle>
              <SheetDescription>
                The UPI ID/ Mobile Number you entered is invalid. Please check
                and try again.
              </SheetDescription>
            </>
          )}
          {state === "verifying" && (
            <>
              <SheetTitle>Verifying</SheetTitle>
              <SheetDescription>
                We are verifying your mobile number/UPI ID. Please wait.
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
                Your payment was successful. Thank you!
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        {state !== "success" && (
          <>
            <Separator className="my-4" />
            <div className="text-xs flex justify-center items-center">
              {state !== "invalid" && "Wrong UPI ID/ Mobile Number? "}
              <Button variant={"link"} onClick={() => setIsOpen(false)}>
                Cancel Payment
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
