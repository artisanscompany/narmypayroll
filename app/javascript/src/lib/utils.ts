import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function maskSensitive(value: string): string {
  if (value.length <= 4) return '••••••'
  return '••••••' + value.slice(-4)
}
