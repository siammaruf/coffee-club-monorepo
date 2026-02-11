import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number | string) => {
  const num = Number(price);
  if (isNaN(num)) return "-";
  return `৳${num.toFixed(2)}`;
};