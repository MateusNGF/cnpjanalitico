import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number | undefined | null) {
  if (value === undefined || value === null || isNaN(value)) return "0"
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatCNAE(value: string) {
  if (!value) return ""
  // Format: 0000000 -> 0000-0/00
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length !== 7) return value
  return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 5)}/${cleaned.substring(5, 7)}`
}
