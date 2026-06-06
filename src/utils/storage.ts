import type { MasterData, Quotation, SavedQuotationSummary } from '../types/quotation';
import { calculateTotals } from './calculations';
import { STORAGE_KEYS, defaultMasterData } from '../data/defaultMasterData';
import {
  deleteAllRemoteQuotations,
  deleteRemoteQuotation,
  fetchRemoteQuotations,
  isSupabaseConfigured,
  upsertRemoteQuotation,
} from './supabase';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeDate(): string {
  return new Date().toISOString();
}

export function getStorageModeLabel(): string {
  return isSupabaseConfigured ? 'Supabase permanent database' : 'Browser local storage only';
}

export function isPermanentStorageEnabled(): boolean {
  return isSupabaseConfigured;
}

export function loadMasterData(): MasterData {
  if (!isBrowser()) return defaultMasterData;
  const raw = localStorage.getItem(STORAGE_KEYS.masterData);
  if (!raw) return defaultMasterData;
  try {
    return { ...defaultMasterData, ...JSON.parse(raw) };
  } catch {
    return defaultMasterData;
  }
}

export function saveMasterData(masterData: MasterData): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.masterData, JSON.stringify(masterData));
}

export function resetMasterData(): MasterData {
  if (isBrowser()) localStorage.removeItem(STORAGE_KEYS.masterData);
  return defaultMasterData;
}

function normalizeSavedQuotation(item: Partial<SavedQuotationSummary> & { date?: string; total?: number; quote?: Quotation }): SavedQuotationSummary | null {
  if (!item.quote || !item.id || !item.quotationNo) return null;

  const totals = calculateTotals(item.quote);
  const now = safeDate();

  return {
    id: item.id,
    quotationNo: item.quotationNo,
    quotationTitle: item.quotationTitle || item.quote.quotationTitle || 'Quotation',
    quotationDate: item.quotationDate || item.date || item.quote.quotationDate,
    validUntil: item.validUntil || item.quote.validUntil,
    clientName: item.clientName || item.quote.client.companyName || 'Client',
    contactPerson: item.contactPerson || item.quote.client.contactPerson || '-',
    phone: item.phone || item.quote.client.phone || '-',
    email: item.email || item.quote.client.email || '-',
    projectName: item.projectName || item.quote.projectName || '-',
    location: item.location || item.quote.location || '-',
    preparedBy: item.preparedBy || item.quote.preparedBy.name || '-',
    itemCount: item.itemCount || item.quote.items.length,
    subtotal: typeof item.subtotal === 'number' ? item.subtotal : totals.subtotal,
    discount: typeof item.discount === 'number' ? item.discount : totals.discount,
    tax: typeof item.tax === 'number' ? item.tax : totals.tax,
    grandTotal: typeof item.grandTotal === 'number' ? item.grandTotal : (typeof item.total === 'number' ? item.total : totals.grandTotal),
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || now,
    quote: item.quote,
  };
}

export function loadSavedQuotations(): SavedQuotationSummary[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(STORAGE_KEYS.quotations);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeSavedQuotation(item))
      .filter((item): item is SavedQuotationSummary => Boolean(item))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

export function persistSavedQuotations(items: SavedQuotationSummary[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.quotations, JSON.stringify(items));
}

export async function loadSavedQuotationsFromPermanentStorage(): Promise<SavedQuotationSummary[]> {
  if (!isSupabaseConfigured) return loadSavedQuotations();
  const remoteItems = await fetchRemoteQuotations();
  persistSavedQuotations(remoteItems);
  return remoteItems;
}

export async function persistQuotationRecord(item: SavedQuotationSummary): Promise<SavedQuotationSummary> {
  persistSavedQuotations([item, ...loadSavedQuotations().filter((record) => record.id !== item.id)]);
  if (!isSupabaseConfigured) return item;
  const remoteItem = await upsertRemoteQuotation(item);
  return remoteItem;
}

export async function removeQuotationRecord(id: string): Promise<void> {
  const localItems = loadSavedQuotations().filter((item) => item.id !== id);
  persistSavedQuotations(localItems);
  if (isSupabaseConfigured) await deleteRemoteQuotation(id);
}

export async function removeAllQuotationRecords(): Promise<void> {
  persistSavedQuotations([]);
  if (isSupabaseConfigured) await deleteAllRemoteQuotations();
}

export function toSavedSummary(quote: Quotation, existingRecord?: SavedQuotationSummary): SavedQuotationSummary {
  const totals = calculateTotals(quote);
  const now = safeDate();

  return {
    id: quote.id,
    quotationNo: quote.quotationNo,
    quotationTitle: quote.quotationTitle,
    quotationDate: quote.quotationDate,
    validUntil: quote.validUntil,
    clientName: quote.client.companyName || 'Client',
    contactPerson: quote.client.contactPerson || '-',
    phone: quote.client.phone || '-',
    email: quote.client.email || '-',
    projectName: quote.projectName || '-',
    location: quote.location || '-',
    preparedBy: quote.preparedBy.name || '-',
    itemCount: quote.items.length,
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    grandTotal: totals.grandTotal,
    createdAt: existingRecord?.createdAt || now,
    updatedAt: now,
    quote,
  };
}

export function getNextSequence(): number {
  if (!isBrowser()) return 1;
  const current = Number(localStorage.getItem(STORAGE_KEYS.sequence) || '1');
  localStorage.setItem(STORAGE_KEYS.sequence, String(current + 1));
  return current;
}
