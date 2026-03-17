import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatCurrency(amount: number, currency: string = "USD") {
  const formatters: Record<string, Intl.NumberFormat> = {
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    EUR: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }),
    GBP: new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }),
    INR: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }),
  };

  const formatter = formatters[currency] || formatters["USD"];
  return formatter.format(amount);
}
