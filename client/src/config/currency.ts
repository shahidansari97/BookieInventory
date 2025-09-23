// Global currency configuration and helpers

// Default currency symbol
const DEFAULT_SYMBOL = "₹";

const STORAGE_KEY = "app_currency_symbol";

export function getCurrencySymbol(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || DEFAULT_SYMBOL;
  } catch {
    return DEFAULT_SYMBOL;
  }
}

export function setCurrencySymbol(symbol: string) {
  try {
    localStorage.setItem(STORAGE_KEY, symbol);
  } catch {
    // ignore storage errors
  }
}

// Basic formatter that uses the configured symbol and en-IN grouping by default
export function formatCurrency(amount: number | string | null | undefined): string {
  const symbol = getCurrencySymbol();
  const value = Number(amount || 0);
  const grouped = new Intl.NumberFormat("en-IN").format(isFinite(value) ? value : 0);
  return `${symbol}${grouped}`;
}

export const CURRENCY_SYMBOL = getCurrencySymbol();


