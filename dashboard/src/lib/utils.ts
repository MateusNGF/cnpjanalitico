import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString('pt-BR');
}

export function formatQuantity(n: number) {
  return new Intl.NumberFormat('pt-BR').format(n);
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, '').padStart(14, '0');
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

export function formatCNAE(value: string) {
  const digits = value.replace(/\D/g, '').padStart(7, '0');
  return digits.replace(
    /^(\d{4})(\d{1})(\d{2})$/,
    '$1-$2/$3'
  );
}

export function formatNaturezaJuridica(value: string) {
  const digits = value.replace(/\D/g, '').padStart(4, '0');
  return digits.replace(
    /^(\d{3})(\d{1})$/,
    '$1-$2'
  );
}
