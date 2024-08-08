import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "./separator";
import Loader from "../loader";

type PaymentModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export function PaymentModal({ isOpen, setIsOpen }: PaymentModalProps) {
  return (
    <Sheet modal open={isOpen}>
      <SheetContent side={"bottom"}>
        <SheetHeader className=" items-center">
          <SheetTitle>Payment Processing</SheetTitle>
          <SheetDescription>
            Please open UPI app and accept the request from Merchant Name's UPI
            ID to complete payment
          </SheetDescription>
          <Loader />
        </SheetHeader>

        <Separator className="my-4" />
        <div className="text-xs flex justify-center items-center">
          Wrong UPI ID/ Mobile Number?{" "}
          <Button variant={"link"} onClick={() => setIsOpen(false)}>
            Cancel Payment
          </Button>
        </div>
        {/* <SheetFooter>
          
          <Separator className="my-3" />
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
