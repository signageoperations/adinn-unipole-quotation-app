import { useEffect, useMemo, useRef, useState } from 'react';
import { LineItemsEditor } from './components/LineItemsEditor';
import { MasterDataPanel } from './components/MasterDataPanel';
import { QuotationForm } from './components/QuotationForm';
import { QuotationPreview } from './components/QuotationPreview';
import { SavedQuotations } from './components/SavedQuotations';
import { createEmptyQuotation } from './data/defaultMasterData';
import type { MasterData, Quotation, SavedQuotationSummary } from './types/quotation';
import { calculateTotals } from './utils/calculations';
import { formatINR } from './utils/currency';
import { addDays, todayISO } from './utils/dates';
import { downloadQuotationPdf } from './utils/pdf';
import { getNextSequence, getStorageModeLabel, isPermanentStorageEnabled, loadMasterData, loadSavedQuotations, loadSavedQuotationsFromPermanentStorage, persistQuotationRecord, persistSavedQuotations, removeAllQuotationRecords, removeQuotationRecord, resetMasterData, saveMasterData, toSavedSummary } from './utils/storage';
import './styles.css';

function makeQuotationNo(sequence: number): string {
  return `ADINN/UNI/${new Date().getFullYear()}-${String(sequence).padStart(3, '0')}`;
}

function cloneQuotation(source: Quotation): Quotation {
  const date = todayISO();
  return {
    ...source,
    id: crypto.randomUUID(),
    quotationNo: makeQuotationNo(getNextSequence()),
    quotationTitle: source.quotationTitle || 'Quotation',
    quotationDate: date,
    validUntil: addDays(date, 15),
    items: source.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
    terms: [...source.terms],
    client: { ...source.client },
    preparedBy: { ...source.preparedBy },
    company: { ...source.company },
  };
}

export default function App() {
  const [masterData, setMasterData] = useState<MasterData>(() => loadMasterData());
  const [quote, setQuote] = useState<Quotation>(() => createEmptyQuotation(getNextSequence(), loadMasterData()));
  const [savedQuotations, setSavedQuotations] = useState<SavedQuotationSummary[]>(() => loadSavedQuotations());
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [status, setStatus] = useState('Ready');
  const previewRef = useRef<HTMLDivElement | null>(null);
  const pdfSourceRef = useRef<HTMLDivElement | null>(null);
  const recordsRef = useRef<HTMLDivElement | null>(null);
  const [activeView, setActiveView] = useState<'setup' | 'preview' | 'records'>('setup');
  const storageLabel = getStorageModeLabel();
  const permanentStorageReady = isPermanentStorageEnabled();

  const totals = useMemo(() => calculateTotals(quote), [quote]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    saveMasterData(masterData);
  }, [masterData]);

  useEffect(() => {
    persistSavedQuotations(savedQuotations);
  }, [savedQuotations]);

  useEffect(() => {
    let isMounted = true;
    loadSavedQuotationsFromPermanentStorage()
      .then((items) => {
        if (!isMounted) return;
        setSavedQuotations(items);
        setStatus(permanentStorageReady ? `Connected to Supabase. Loaded ${items.length} permanent quotation records.` : 'Using browser local storage. Add Supabase environment variables for permanent database storage.');
      })
      .catch((error) => {
        console.error(error);
        if (isMounted) setStatus('Could not load Supabase records. Showing local cached quotations for now.');
      });
    return () => {
      isMounted = false;
    };
  }, [permanentStorageReady]);

  const upsertQuotationRecord = async (message?: string, sourceQuote: Quotation = quote) => {
    const existingRecord = savedQuotations.find((item) => item.id === sourceQuote.id);
    const summary = toSavedSummary(sourceQuote, existingRecord);
    const optimisticRecords = [summary, ...savedQuotations.filter((item) => item.id !== sourceQuote.id)];
    setSavedQuotations(optimisticRecords);
    persistSavedQuotations(optimisticRecords);

    try {
      const savedRecord = await persistQuotationRecord(summary);
      const nextRecords = [savedRecord, ...optimisticRecords.filter((item) => item.id !== savedRecord.id)];
      setSavedQuotations(nextRecords);
      persistSavedQuotations(nextRecords);
      setStatus(message || (permanentStorageReady ? `Saved ${sourceQuote.quotationNo} to Supabase database` : `Saved ${sourceQuote.quotationNo} to local browser storage`));
      return nextRecords;
    } catch (error) {
      console.error(error);
      setStatus('Could not save to Supabase. Local browser copy was kept. Check Supabase table and environment variables.');
      return optimisticRecords;
    }
  };

  const newQuotation = async () => {
    await upsertQuotationRecord(`Saved ${quote.quotationNo} before creating a new quotation`);
    setQuote(createEmptyQuotation(getNextSequence(), masterData));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStatus('New quotation created. Previous quotation is available in All Quotations.');
  };

  const saveCurrentQuotation = async () => {
    await upsertQuotationRecord();
  };

  const showView = (view: 'setup' | 'preview' | 'records') => {
    setActiveView(view);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  const viewAllQuotations = () => {
    setActiveView('records');
    window.setTimeout(() => {
      recordsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
    setStatus('Showing all saved quotation records');
  };

  const openSavedQuotation = (savedQuote: Quotation) => {
    setQuote(savedQuote);
    setActiveView('setup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStatus(`Opened ${savedQuote.quotationNo}. Edit and click Save to update this record.`);
  };

  const duplicateSavedQuotation = async (savedQuote: Quotation) => {
    const duplicatedQuote = cloneQuotation(savedQuote);
    const existingRecord = savedQuotations.find((item) => item.id === duplicatedQuote.id);
    const summary = toSavedSummary(duplicatedQuote, existingRecord);
    const optimisticRecords = [summary, ...savedQuotations];
    setSavedQuotations(optimisticRecords);
    persistSavedQuotations(optimisticRecords);
    try {
      const savedRecord = await persistQuotationRecord(summary);
      setSavedQuotations([savedRecord, ...savedQuotations]);
      setStatus(`Duplicated as ${duplicatedQuote.quotationNo} and saved.`);
    } catch (error) {
      console.error(error);
      setStatus(`Duplicated as ${duplicatedQuote.quotationNo}, but Supabase save failed.`);
    }
    setQuote(duplicatedQuote);
    setActiveView('setup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSavedQuotation = async (id: string) => {
    setSavedQuotations((current) => current.filter((item) => item.id !== id));
    try {
      await removeQuotationRecord(id);
      setStatus(permanentStorageReady ? 'Quotation deleted from Supabase database' : 'Saved quotation deleted from browser');
    } catch (error) {
      console.error(error);
      setStatus('Could not delete from Supabase. Refresh and try again.');
    }
  };

  const deleteAllSavedQuotations = async () => {
    if (savedQuotations.length === 0) return;
    if (!window.confirm(permanentStorageReady ? 'Delete all saved quotations from the Supabase database?' : 'Delete all saved quotations from this browser?')) return;
    setSavedQuotations([]);
    persistSavedQuotations([]);
    try {
      await removeAllQuotationRecords();
      setStatus(permanentStorageReady ? 'All saved quotations deleted from Supabase database' : 'All saved quotations deleted');
    } catch (error) {
      console.error(error);
      setStatus('Could not delete all records from Supabase. Refresh and try again.');
    }
  };

  const resetDefaults = () => {
    const defaults = resetMasterData();
    setMasterData(defaults);
    setStatus('Master data reset to ADINN unipole defaults');
  };

  const printQuotation = async () => {
    await upsertQuotationRecord(`Saved ${quote.quotationNo} before printing`);
    setActiveView('preview');
    window.setTimeout(() => {
      window.scrollTo(0, 0);
      window.print();
    }, 250);
  };

  const exportPdf = async () => {
    const exportTarget = pdfSourceRef.current ?? previewRef.current;
    if (!exportTarget) return;
    setIsPdfExporting(true);
    setStatus('Preparing PDF...');
    try {
      await upsertQuotationRecord(`Saved ${quote.quotationNo} before PDF export`);
      await downloadQuotationPdf(exportTarget, quote);
      setStatus('PDF downloaded and quotation record saved');
    } catch (error) {
      console.error(error);
      setStatus('PDF export failed. Please use Print A4 as fallback.');
    } finally {
      setIsPdfExporting(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar non-print">
        <div className="topbar-brand">
          <img className="topbar-logo" src="/adinn-logo.png" alt="ADINN Advertising Services Ltd." />
          <div>
            <p className="eyebrow">ADINN Unipole Signage</p>
            <h1>Quotation Generator</h1>
            <p className="topbar-subtitle">Premium proposal builder with live A4 preview, editable pricing master data and searchable quotation records.</p>
            <p className={permanentStorageReady ? 'storage-chip is-online' : 'storage-chip'}>{storageLabel}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="pill-total">
            <span>Grand total</span>
            <strong>{formatINR(totals.grandTotal)}</strong>
          </div>
          <button className="secondary-button" type="button" onClick={newQuotation}>New</button>
          <button className="secondary-button" type="button" onClick={saveCurrentQuotation}>Save</button>
          <button className="secondary-button" type="button" onClick={viewAllQuotations}>All Quotations ({savedQuotations.length})</button>
          <button className="primary-button" type="button" onClick={printQuotation}>Print A4</button>
          <button className="primary-button gold" type="button" onClick={exportPdf} disabled={isPdfExporting}>{isPdfExporting ? 'Exporting...' : 'Download PDF'}</button>
        </div>
      </header>

      <nav className="view-switcher non-print" aria-label="Quotation workspace sections">
        <button className={activeView === 'setup' ? 'active' : ''} type="button" onClick={() => showView('setup')}>Quotation Setup</button>
        <button className={activeView === 'preview' ? 'active' : ''} type="button" onClick={() => showView('preview')}>Live A4 Preview</button>
        <button className={activeView === 'records' ? 'active' : ''} type="button" onClick={viewAllQuotations}>All Quotations ({savedQuotations.length})</button>
      </nav>

      <main className="workspace stable-workspace">
        {activeView === 'setup' && (
          <section className="editor-column non-print">
            <div className="status-strip">{status}</div>
            <QuotationForm quote={quote} onChange={setQuote} />
            <LineItemsEditor quote={quote} masterData={masterData} onChange={setQuote} />
            <MasterDataPanel masterData={masterData} onChange={setMasterData} onReset={resetDefaults} />
          </section>
        )}

        {activeView === 'preview' && (
          <section className="preview-column">
            <div className="preview-toolbar non-print">
              <div>
                <p className="eyebrow">Live preview</p>
                <h2>A4 quotation proposal</h2>
              </div>
              <span>{quote.quotationNo}</span>
            </div>
            <div className="preview-scroll">
              <div ref={previewRef} className="print-area">
                <QuotationPreview quote={quote} masterData={masterData} />
              </div>
            </div>
          </section>
        )}

        {activeView === 'records' && (
          <section ref={recordsRef} className="records-column non-print">
            <div className="status-strip">{status}</div>
            <SavedQuotations
              savedQuotations={savedQuotations}
              onOpen={openSavedQuotation}
              onDuplicate={duplicateSavedQuotation}
              onDelete={deleteSavedQuotation}
              onDeleteAll={deleteAllSavedQuotations}
            />
          </section>
        )}
      </main>

      <div ref={pdfSourceRef} className="pdf-source" aria-hidden="true">
        <QuotationPreview quote={quote} masterData={masterData} />
      </div>
    </div>
  );
}
