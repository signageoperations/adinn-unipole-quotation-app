import { createClient } from '@supabase/supabase-js';
import type { Quotation, SavedQuotationSummary } from '../types/quotation';

type SupabaseQuotationRow = {
  id: string;
  quotation_no: string;
  quotation_title: string | null;
  quotation_date: string | null;
  valid_until: string | null;
  client_name: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  project_name: string | null;
  location: string | null;
  prepared_by: string | null;
  item_count: number | null;
  subtotal: number | string | null;
  discount: number | string | null;
  tax: number | string | null;
  grand_total: number | string | null;
  quote: Quotation;
  created_at: string | null;
  updated_at: string | null;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  return 0;
}

export function savedSummaryToRow(item: SavedQuotationSummary): SupabaseQuotationRow {
  return {
    id: item.id,
    quotation_no: item.quotationNo,
    quotation_title: item.quotationTitle,
    quotation_date: item.quotationDate,
    valid_until: item.validUntil,
    client_name: item.clientName,
    contact_person: item.contactPerson,
    phone: item.phone,
    email: item.email,
    project_name: item.projectName,
    location: item.location,
    prepared_by: item.preparedBy,
    item_count: item.itemCount,
    subtotal: item.subtotal,
    discount: item.discount,
    tax: item.tax,
    grand_total: item.grandTotal,
    quote: item.quote,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

export function rowToSavedSummary(row: SupabaseQuotationRow): SavedQuotationSummary {
  const quote = row.quote;

  return {
    id: row.id,
    quotationNo: row.quotation_no,
    quotationTitle: row.quotation_title || quote.quotationTitle || 'Quotation',
    quotationDate: row.quotation_date || quote.quotationDate,
    validUntil: row.valid_until || quote.validUntil,
    clientName: row.client_name || quote.client.companyName || 'Client',
    contactPerson: row.contact_person || quote.client.contactPerson || '-',
    phone: row.phone || quote.client.phone || '-',
    email: row.email || quote.client.email || '-',
    projectName: row.project_name || quote.projectName || '-',
    location: row.location || quote.location || '-',
    preparedBy: row.prepared_by || quote.preparedBy.name || '-',
    itemCount: row.item_count || quote.items.length,
    subtotal: toNumber(row.subtotal),
    discount: toNumber(row.discount),
    tax: toNumber(row.tax),
    grandTotal: toNumber(row.grand_total),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    quote,
  };
}

export async function fetchRemoteQuotations(): Promise<SavedQuotationSummary[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((row) => rowToSavedSummary(row as SupabaseQuotationRow));
}

export async function upsertRemoteQuotation(item: SavedQuotationSummary): Promise<SavedQuotationSummary> {
  if (!supabase) return item;

  const { data, error } = await supabase
    .from('quotations')
    .upsert(savedSummaryToRow(item), { onConflict: 'id' })
    .select('*')
    .single();

  if (error) throw error;
  return rowToSavedSummary(data as SupabaseQuotationRow);
}

export async function deleteRemoteQuotation(id: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('quotations').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteAllRemoteQuotations(): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('quotations').delete().not('id', 'is', null);
  if (error) throw error;
}
