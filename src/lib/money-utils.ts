/**
 * Money utilities for handling currency in cents (integer) format
 * All monetary calculations use integer cents to avoid floating point errors
 */

/**
 * Format cents as currency display string
 * Supports different currencies (defaults to AUD)
 */
export function centsToDisplay(cents: number, currency: string = "AUD"): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Parse a display string or number to cents
 * Handles both "123.45" string input and 123.45 number input
 */
export function displayToCents(value: string | number): number {
  if (typeof value === "number") {
    return Math.round(value * 100);
  }
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
}

/**
 * Convert cents to dollars for display in input fields
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert dollars to cents for storage
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Format cents as a simple number string (no currency symbol)
 */
export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}
