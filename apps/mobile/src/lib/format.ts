/**
 * Format a number into Vietnamese currency format with dot thousands separator (e.g. 1.234.000 đ)
 */
export function formatCurrency(amount: number): string {
  if (amount === 0 || !Number.isFinite(amount)) return '0 đ';
  const isNegative = amount < 0;
  const absVal = Math.abs(Math.floor(amount));
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${isNegative ? '-' : ''}${formatted} đ`;
}

/**
 * Format ISO date string YYYY-MM-DD into Vietnamese standard DD/MM/YYYY
 */
export function formatDateVN(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
