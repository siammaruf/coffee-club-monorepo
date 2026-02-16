import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null | undefined): string {
  const safePrice = Number(price) || 0
  return `৳${safePrice.toFixed(2)}`
}

export function formatPriceRange(min: number, max: number | undefined): string {
  if (!max || min === max) return formatPrice(min)
  return `${formatPrice(min)} - ${formatPrice(max)}`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
