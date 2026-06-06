import type { MasterData, Quotation } from '../types/quotation';
import { calculateTotals, getArea } from '../utils/calculations';
import { amountInWords, formatINR, formatNumber } from '../utils/currency';
import { displayDate } from '../utils/dates';

type Props = {
  quote: Quotation;
  masterData: MasterData;
};

export function QuotationPreview({ quote, masterData }: Props) {
  const totals = calculateTotals(quote);
  const selectedSize = masterData.sizes.find((size) => size.id === quote.selectedSpecificationSizeId) ?? masterData.sizes[0];
  const specification = masterData.specificationBlocks[quote.selectedSpecificationSizeId] ?? [];

  return (
    <article className="a4-page">
      <header className="quote-header">
        <div className="brand-lockup">
          <img className="quote-logo" src="/adinn-logo.png" alt="ADINN Advertising Services Ltd." />
          <div className="company-copy">
            <h1>{quote.company.name}</h1>
            <p>{quote.company.address}</p>
            <p>{[quote.company.phone, quote.company.email, quote.company.website].filter(Boolean).join(' | ')}</p>
            {quote.company.gstin && <p>GSTIN: {quote.company.gstin}</p>}
          </div>
        </div>
        <div className="quote-meta-card">
          <h2>{quote.quotationTitle}</h2>
          <p><strong>No:</strong> {quote.quotationNo}</p>
          <p><strong>Date:</strong> {displayDate(quote.quotationDate)}</p>
          <p><strong>Valid Until:</strong> {displayDate(quote.validUntil)}</p>
        </div>
      </header>

      <section className="quote-info-grid">
        <div>
          <p className="small-title">To</p>
          <h3>{quote.client.companyName}</h3>
          {quote.client.contactPerson && <p>Kind Attn: {quote.client.contactPerson}</p>}
          {quote.client.address && <p>{quote.client.address}</p>}
          <p>{[quote.client.phone, quote.client.email].filter(Boolean).join(' | ')}</p>
        </div>
        <div>
          <p className="small-title">Project / Campaign</p>
          <h3>{quote.projectName}</h3>
          <p><strong>Location:</strong> {quote.location}</p>
          {quote.destination && <p><strong>Destination:</strong> {quote.destination}</p>}
          {quote.modeOfPayment && <p><strong>Mode / Terms of Payment:</strong> {quote.modeOfPayment}</p>}
        </div>
      </section>

      <section className="pricing-section">
        <table className="quote-table">
          <colgroup>
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>Description of Services</th>
              <th>HSN/SAC</th>
              <th>Due on</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Per</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>
                  <strong>{item.description}</strong>
                  <span>{item.materialName}</span>
                  {item.pricingBasis === 'area' && <span>{formatNumber(getArea(item))} sq.ft ({item.width} x {item.height} x {item.sides} side{item.sides > 1 ? 's' : ''})</span>}
                </td>
                <td>{item.hsnSac}</td>
                <td>{item.dueOn}</td>
                <td>{item.pricingBasis === 'area' ? `${formatNumber(getArea(item))} Sq.ft` : `${item.quantity}`}</td>
                <td>{formatINR(item.rate)}</td>
                <td>{item.unitType}</td>
                <td>{formatINR(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="quote-bottom-grid">
        <div className="amount-words">
          <p className="small-title">Amount chargeable in words</p>
          <strong>{amountInWords(totals.grandTotal)}</strong>
          <p className="eo">E. & O.E</p>
        </div>
        <div className="totals-card">
          <div><span>Subtotal</span><strong>{formatINR(totals.subtotal)}</strong></div>
          {quote.discountPercent > 0 && <div><span>Discount ({quote.discountPercent}%)</span><strong>- {formatINR(totals.discount)}</strong></div>}
          {quote.additionalCharges > 0 && <div><span>{quote.additionalChargesLabel}</span><strong>{formatINR(totals.additionalCharges)}</strong></div>}
          <div><span>GST ({quote.taxPercent}%)</span><strong>{formatINR(totals.tax)}</strong></div>
          <div className="grand-total"><span>Grand Total</span><strong>{formatINR(totals.grandTotal)}</strong></div>
        </div>
      </section>

      <section className="scope-section">
        <div className="section-title-row">
          <h3>{selectedSize?.label?.toUpperCase()} SPECIFICATION</h3>
          <span>{selectedSize?.displaySizeText}</span>
        </div>
        <div className="spec-grid">
          {specification.map((entry, index) => (
            <div key={`${entry}-${index}`} className="spec-item">
              <span>{index + 1}</span>
              <p>{entry}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="notes-terms-grid">
        <div>
          <h3>Notes</h3>
          <p>{quote.notes}</p>
        </div>
        <div>
          <h3>Terms and Conditions</h3>
          <ol>
            {quote.terms.filter(Boolean).map((term, index) => <li key={`${term}-${index}`}>{term}</li>)}
          </ol>
        </div>
      </section>

      <footer className="quote-footer">
        <div>
          <p className="small-title">Prepared by</p>
          <strong>{quote.preparedBy.name}</strong>
          <p>{[quote.preparedBy.phone, quote.preparedBy.email].filter(Boolean).join(' | ')}</p>
        </div>
        <div className="signatory-box">
          <p>For {quote.company.name}</p>
          <div className="signature-line" />
          <strong>Authorised Signatory</strong>
        </div>
      </footer>

      <p className="generated-note">This is a computer generated quotation.</p>
    </article>
  );
}
