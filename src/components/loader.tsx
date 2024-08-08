import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const Loader = ({ className }: { className?: string }) => {
  return (
    <Loader2
      className={cn("my-28 h-5 w-5 text-primary/90 animate-spin", className)}
    />
  );
};

export default Loader;
