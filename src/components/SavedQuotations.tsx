import { useMemo, useState } from 'react';
import type { Quotation, SavedQuotationSummary } from '../types/quotation';
import { displayDate, displayDateTime } from '../utils/dates';
import { formatINR } from '../utils/currency';

type Props = {
  savedQuotations: SavedQuotationSummary[];
  onOpen: (quote: Quotation) => void;
  onDuplicate: (quote: Quotation) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
};

export function SavedQuotations({ savedQuotations, onOpen, onDuplicate, onDelete, onDeleteAll }: Props) {
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredQuotations = useMemo(() => {
    const value = searchText.trim().toLowerCase();
    if (!value) return savedQuotations;

    return savedQuotations.filter((item) => {
      const searchable = [
        item.quotationNo,
        item.clientName,
        item.contactPerson,
        item.phone,
        item.email,
        item.projectName,
        item.location,
        item.preparedBy,
        item.quotationDate,
        item.validUntil,
        String(item.grandTotal),
      ].join(' ').toLowerCase();

      return searchable.includes(value);
    });
  }, [savedQuotations, searchText]);

  return (
    <section className="panel saved-panel">
      <div className="panel__header compact saved-header">
        <div>
          <p className="eyebrow">Quotation records</p>
          <h2>All created quotations</h2>
          <p className="muted">Search, view, reopen, duplicate, edit, or delete any saved quotation record. Open a record to update it in the editor and save again.</p>
        </div>
        <div className="saved-header-actions">
          <span className="record-count">{filteredQuotations.length} / {savedQuotations.length} records</span>
          <button className="secondary-button danger-text" type="button" onClick={onDeleteAll} disabled={savedQuotations.length === 0}>Delete all</button>
        </div>
      </div>

      <div className="record-search-row">
        <input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search by quotation no, client, project, location, phone, amount..."
        />
      </div>

      {savedQuotations.length === 0 ? (
        <p className="muted">No quotation records yet. Click Save, Print A4, Download PDF, or New to store the current quotation with all details.</p>
      ) : filteredQuotations.length === 0 ? (
        <p className="muted">No quotation record matches your search.</p>
      ) : (
        <div className="records-table-wrap">
          <table className="records-table">
            <thead>
              <tr>
                <th>Quotation</th>
                <th>Client / project</th>
                <th>Date</th>
                <th>Location</th>
                <th>Total</th>
                <th>CRUD actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map((item) => {
                const isExpanded = expandedId === item.id;

                return (
                  <tr key={item.id} className={isExpanded ? 'is-expanded' : undefined}>
                    <td>
                      <strong>{item.quotationNo}</strong>
                      <small>{item.itemCount} line item{item.itemCount === 1 ? '' : 's'}</small>
                    </td>
                    <td>
                      <strong>{item.clientName}</strong>
                      <small>{item.projectName}</small>
                      <small>{item.contactPerson} · {item.phone}</small>
                    </td>
                    <td>
                      <strong>{displayDate(item.quotationDate)}</strong>
                      <small>Valid until {displayDate(item.validUntil)}</small>
                      <small>Saved {displayDateTime(item.updatedAt)}</small>
                    </td>
                    <td>
                      <strong>{item.location}</strong>
                      <small>Prepared by {item.preparedBy}</small>
                    </td>
                    <td className="amount-cell">
                      <strong>{formatINR(item.grandTotal)}</strong>
                      {item.tax > 0 && <small>GST {formatINR(item.tax)}</small>}
                    </td>
                    <td>
                      <div className="records-actions">
                        <button className="secondary-button" type="button" onClick={() => onOpen(item.quote)}>Open/Edit</button>
                        <button className="secondary-button" type="button" onClick={() => setExpandedId(isExpanded ? null : item.id)}>{isExpanded ? 'Hide' : 'View'}</button>
                        <button className="secondary-button" type="button" onClick={() => onDuplicate(item.quote)}>Duplicate</button>
                        <button className="icon-button danger" type="button" onClick={() => onDelete(item.id)} aria-label="Delete saved quotation">×</button>
                      </div>
                      {isExpanded && (
                        <div className="record-detail-card">
                          <div><span>Quotation title</span><strong>{item.quotationTitle}</strong></div>
                          <div><span>Email</span><strong>{item.email}</strong></div>
                          <div><span>Subtotal</span><strong>{formatINR(item.subtotal)}</strong></div>
                          <div><span>Discount</span><strong>{formatINR(item.discount)}</strong></div>
                          <div><span>GST</span><strong>{formatINR(item.tax)}</strong></div>
                          <div><span>Created</span><strong>{displayDateTime(item.createdAt)}</strong></div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
