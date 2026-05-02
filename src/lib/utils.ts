import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function generateOrderCode(prefix = "GT") {
  const random = Math.floor(Math.random() * 900000 + 100000);
  return `${prefix}-${random}`;
}
