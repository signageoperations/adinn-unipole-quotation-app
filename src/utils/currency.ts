export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

const ones = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];

const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function twoDigitWords(num: number): string {
  if (num < 20) return ones[num];
  const ten = Math.floor(num / 10);
  const one = num % 10;
  return `${tens[ten]}${one ? ` ${ones[one]}` : ''}`;
}

function threeDigitWords(num: number): string {
  const hundred = Math.floor(num / 100);
  const rest = num % 100;
  const parts: string[] = [];
  if (hundred) parts.push(`${ones[hundred]} hundred`);
  if (rest) parts.push(twoDigitWords(rest));
  return parts.join(' ');
}

export function amountInWords(value: number): string {
  let num = Math.round(Number(value) || 0);
  if (num === 0) return 'Zero rupees only';

  const parts: string[] = [];
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  if (crore) parts.push(`${threeDigitWords(crore)} crore`);
  if (lakh) parts.push(`${threeDigitWords(lakh)} lakh`);
  if (thousand) parts.push(`${threeDigitWords(thousand)} thousand`);
  if (hundred) parts.push(threeDigitWords(hundred));

  const words = parts.join(' ').replace(/\s+/g, ' ').trim();
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} rupees only`;
}
