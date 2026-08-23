import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number as currency (PEN)
 */
export function formatCurrency(value: number, currency: string = 'PEN'): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
  }).format(value || 0)
}

/**
 * Format date as short date string
 */
export function formatDate(date: Date | undefined | null): string {
  if (!date) return '-'
  
  const d = date instanceof Date ? date : new Date(date as any)
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | undefined | null): string {
  if (!date) return '-'
  
  const d = date instanceof Date ? date : new Date(date as any)
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}
