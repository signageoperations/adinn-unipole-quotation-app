import type { QuoteTotals, Quotation, QuotationLineItem } from '../types/quotation';

export function calculateLineAmount(item: Pick<QuotationLineItem, 'pricingBasis' | 'width' | 'height' | 'sides' | 'quantity' | 'duration' | 'rate' | 'minimumPrice'>): number {
  const quantity = Number(item.quantity) || 0;
  const duration = Number(item.duration) || 0;
  const rate = Number(item.rate) || 0;
  const width = Number(item.width) || 0;
  const height = Number(item.height) || 0;
  const sides = Number(item.sides) || 1;
  const minimumPrice = Number(item.minimumPrice) || 0;

  let amount = 0;

  if (item.pricingBasis === 'area') {
    amount = width * height * sides * quantity * rate;
  } else if (item.pricingBasis === 'day' || item.pricingBasis === 'month') {
    amount = quantity * duration * rate;
  } else {
    amount = quantity * rate;
  }

  return Math.max(amount, minimumPrice);
}

export function calculateTotals(quote: Quotation): QuoteTotals {
  const subtotal = quote.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const discount = subtotal * ((Number(quote.discountPercent) || 0) / 100);
  const afterDiscount = Math.max(subtotal - discount, 0);
  const additionalCharges = Number(quote.additionalCharges) || 0;
  const taxableSubtotal = quote.items
    .filter((item) => item.taxable)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxableAfterDiscount = Math.max(taxableSubtotal - discount, 0) + additionalCharges;
  const tax = taxableAfterDiscount * ((Number(quote.taxPercent) || 0) / 100);
  const grandTotal = afterDiscount + additionalCharges + tax;

  return {
    subtotal,
    discount,
    taxableSubtotal: taxableAfterDiscount,
    tax,
    additionalCharges,
    grandTotal,
  };
}

export function getArea(item: Pick<QuotationLineItem, 'width' | 'height' | 'sides' | 'quantity'>): number {
  return (Number(item.width) || 0) * (Number(item.height) || 0) * (Number(item.sides) || 1) * (Number(item.quantity) || 0);
}
