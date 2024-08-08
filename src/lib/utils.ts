import { Message } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCountdown(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }
  const minutes: number = Math.floor(seconds / 60);
  const remainingSeconds: number = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")} minutes${
    minutes !== 1 ? "s" : ""
  }`;
}

export function sendMessageToParent(message: Message, url?: string) {
  window.parent.postMessage(message, url || "*");
}

export function thousandSeperator(value: string | number) {
  return String(value)
    .split("")
    .reverse()
    .join("")
    .replace(/(\d{3}\B)/g, "$1,")
    .split("")
    .reverse()
    .join("");
}
