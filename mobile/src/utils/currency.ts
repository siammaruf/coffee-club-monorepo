export const CURRENCY_SYMBOL = '\u09F3'; // ৳

export function formatPrice(
  value: number | string | null | undefined,
): string {
  const num = Number(value) || 0;
  return `${CURRENCY_SYMBOL}${num.toFixed(2)}`;
}

export function formatPriceRange(
  min: number | string,
  max: number | string,
): string {
  const minNum = Number(min) || 0;
  const maxNum = Number(max) || 0;
  if (minNum === maxNum) return formatPrice(minNum);
  return `${CURRENCY_SYMBOL}${minNum.toFixed(2)} ~ ${CURRENCY_SYMBOL}${maxNum.toFixed(2)}`;
}

export function formatAmount(
  value: number | string | null | undefined,
): string {
  const num = Number(value) || 0;
  return num.toFixed(2);
}

export function formatPriceCompact(
  value: number | string | null | undefined,
  fallback = '-',
): string {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  if (isNaN(num)) return fallback;
  return `${CURRENCY_SYMBOL}${num.toLocaleString('en-US')}`;
}
