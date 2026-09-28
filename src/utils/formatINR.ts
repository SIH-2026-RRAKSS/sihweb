/**
 * Shared Indian Currency Grouping Utility (formatINR)
 * Formats numeric currency values according to standard Indian numbering (e.g. ₹4,02,817.53).
 * Compact form (lakh/crore) is reserved exclusively for high-level KPI cards.
 */

export function formatINR(
  amount: number | null | undefined,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '—';
  }
  const minDigits = options?.minimumFractionDigits ?? (amount % 1 !== 0 ? 2 : 0);
  const maxDigits = options?.maximumFractionDigits ?? 2;
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits
  })}`;
}

export function formatCompactINR(amount: number | null | undefined): string {
  if (amount === undefined || amount === null || isNaN(amount) || amount === 0) {
    return '—';
  }
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return formatINR(amount);
}
