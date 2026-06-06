import type { Quotation } from '../types/quotation';

type Props = {
  quote: Quotation;
  onChange: (quote: Quotation) => void;
};

export function QuotationForm({ quote, onChange }: Props) {
  const update = <K extends keyof Quotation>(key: K, value: Quotation[K]) => {
    onChange({ ...quote, [key]: value });
  };

  const updateClient = (key: keyof Quotation['client'], value: string) => {
    onChange({ ...quote, client: { ...quote.client, [key]: value } });
  };

  const updatePreparedBy = (key: keyof Quotation['preparedBy'], value: string) => {
    onChange({ ...quote, preparedBy: { ...quote.preparedBy, [key]: value } });
  };

  const updateCompany = (key: keyof Quotation['company'], value: string) => {
    onChange({ ...quote, company: { ...quote.company, [key]: value } });
  };

  const updateTerm = (index: number, value: string) => {
    const terms = [...quote.terms];
    terms[index] = value;
    update('terms', terms);
  };

  return (
    <div className="panel-stack">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Quotation setup</p>
            <h2>Client & campaign details</h2>
          </div>
        </div>

        <div className="form-grid two">
          <label>
            <span>Quotation title</span>
            <input value={quote.quotationTitle} onChange={(e) => update('quotationTitle', e.target.value)} />
          </label>
          <label>
            <span>Quotation number</span>
            <input value={quote.quotationNo} onChange={(e) => update('quotationNo', e.target.value)} />
          </label>
          <label>
            <span>Quotation date</span>
            <input type="date" value={quote.quotationDate} onChange={(e) => update('quotationDate', e.target.value)} />
          </label>
          <label>
            <span>Valid until</span>
            <input type="date" value={quote.validUntil} onChange={(e) => update('validUntil', e.target.value)} />
          </label>
          <label>
            <span>Campaign / project name</span>
            <input value={quote.projectName} onChange={(e) => update('projectName', e.target.value)} />
          </label>
          <label>
            <span>Location</span>
            <input value={quote.location} onChange={(e) => update('location', e.target.value)} />
          </label>
          <label>
            <span>Mode / terms of payment</span>
            <input value={quote.modeOfPayment} onChange={(e) => update('modeOfPayment', e.target.value)} />
          </label>
          <label>
            <span>Destination</span>
            <input value={quote.destination} onChange={(e) => update('destination', e.target.value)} />
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header compact">
          <div>
            <p className="eyebrow">Buyer</p>
            <h2>Client details</h2>
          </div>
        </div>
        <div className="form-grid two">
          <label>
            <span>Client company name</span>
            <input value={quote.client.companyName} onChange={(e) => updateClient('companyName', e.target.value)} />
          </label>
          <label>
            <span>Contact person</span>
            <input value={quote.client.contactPerson} onChange={(e) => updateClient('contactPerson', e.target.value)} />
          </label>
          <label>
            <span>Phone number</span>
            <input value={quote.client.phone} onChange={(e) => updateClient('phone', e.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input value={quote.client.email} onChange={(e) => updateClient('email', e.target.value)} />
          </label>
          <label className="span-two">
            <span>Client address</span>
            <textarea value={quote.client.address} onChange={(e) => updateClient('address', e.target.value)} rows={3} />
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header compact">
          <div>
            <p className="eyebrow">ADINN</p>
            <h2>Prepared by & company address</h2>
          </div>
        </div>
        <div className="form-grid two">
          <label>
            <span>Prepared by name</span>
            <input value={quote.preparedBy.name} onChange={(e) => updatePreparedBy('name', e.target.value)} />
          </label>
          <label>
            <span>Prepared by phone</span>
            <input value={quote.preparedBy.phone} onChange={(e) => updatePreparedBy('phone', e.target.value)} />
          </label>
          <label>
            <span>Prepared by email</span>
            <input value={quote.preparedBy.email} onChange={(e) => updatePreparedBy('email', e.target.value)} />
          </label>
          <label>
            <span>Company logo text</span>
            <input value={quote.company.logoText} onChange={(e) => updateCompany('logoText', e.target.value)} />
          </label>
          <label className="span-two">
            <span>Company address</span>
            <textarea value={quote.company.address} onChange={(e) => updateCompany('address', e.target.value)} rows={3} />
          </label>
          <label>
            <span>Company phone</span>
            <input value={quote.company.phone} onChange={(e) => updateCompany('phone', e.target.value)} />
          </label>
          <label>
            <span>Company email</span>
            <input value={quote.company.email} onChange={(e) => updateCompany('email', e.target.value)} />
          </label>
          <label>
            <span>GSTIN</span>
            <input value={quote.company.gstin} onChange={(e) => updateCompany('gstin', e.target.value)} />
          </label>
          <label>
            <span>Website</span>
            <input value={quote.company.website} onChange={(e) => updateCompany('website', e.target.value)} />
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header compact">
          <div>
            <p className="eyebrow">Proposal notes</p>
            <h2>Notes & terms</h2>
          </div>
        </div>
        <label>
          <span>Notes</span>
          <textarea value={quote.notes} onChange={(e) => update('notes', e.target.value)} rows={4} />
        </label>
        <div className="terms-editor">
          {quote.terms.map((term, index) => (
            <div className="term-row" key={`${term}-${index}`}>
              <input value={term} onChange={(e) => updateTerm(index, e.target.value)} />
              <button
                className="icon-button danger"
                type="button"
                onClick={() => update('terms', quote.terms.filter((_, termIndex) => termIndex !== index))}
                aria-label="Delete term"
              >
                x
              </button>
            </div>
          ))}
          <button className="secondary-button" type="button" onClick={() => update('terms', [...quote.terms, 'New term or condition'])}>
            Add term
          </button>
        </div>
      </section>
    </div>
  );
}
