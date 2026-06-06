import type { MasterData, Quotation, QuotationLineItem, PricingBasis, UnitType } from '../types/quotation';
import { calculateLineAmount, getArea } from '../utils/calculations';
import { formatINR, formatNumber } from '../utils/currency';
import { applySizeToItem, createItemFromAddOn, createItemFromProduct } from '../utils/itemFactory';
import { buildFortyByTwentyFiveDefaultItems } from '../data/defaultMasterData';

type Props = {
  quote: Quotation;
  masterData: MasterData;
  onChange: (quote: Quotation) => void;
};

const pricingBasisOptions: PricingBasis[] = ['area', 'fixed', 'unit', 'day', 'month'];
const unitOptions: UnitType[] = ['sq.ft', 'No', 'per unit', 'per day', 'per month', 'fixed'];

function createCustomLineItem(masterData: MasterData, preferredSizeId?: string): QuotationLineItem {
  const size = masterData.sizes.find((entry) => entry.id === preferredSizeId) ?? masterData.sizes[0];
  const item: QuotationLineItem = {
    id: crypto.randomUUID(),
    category: 'Custom',
    productName: 'Custom product / service',
    description: 'Describe the service here',
    hsnSac: '998361',
    dueOn: '30 Days',
    sizeId: size?.id,
    sizeLabel: size?.label ?? 'Custom size',
    width: size?.width ?? 0,
    height: size?.height ?? 0,
    sides: size?.sides ?? 1,
    materialName: 'Custom',
    specification: '',
    quantity: 1,
    duration: 1,
    rate: 0,
    unitType: 'fixed',
    pricingBasis: 'fixed',
    minimumPrice: 0,
    amount: 0,
    taxable: true,
  };

  return { ...item, amount: calculateLineAmount(item) };
}

export function LineItemsEditor({ quote, masterData, onChange }: Props) {
  const updateQuoteItems = (items: QuotationLineItem[]) => onChange({ ...quote, items });

  const updateItem = (id: string, patch: Partial<QuotationLineItem>) => {
    const items = quote.items.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, ...patch };
      return { ...updated, amount: calculateLineAmount(updated) };
    });
    updateQuoteItems(items);
  };

  const addProduct = (productId: string) => {
    const product = masterData.products.find((entry) => entry.id === productId);
    if (!product) return;
    updateQuoteItems([...quote.items, createItemFromProduct(product, masterData, quote.selectedSpecificationSizeId)]);
  };

  const addOn = (addOnId: string) => {
    const selected = masterData.addOns.find((entry) => entry.id === addOnId);
    if (!selected) return;
    updateQuoteItems([...quote.items, createItemFromAddOn(selected, masterData, quote.selectedSpecificationSizeId)]);
  };

  const addCustomItem = () => {
    updateQuoteItems([...quote.items, createCustomLineItem(masterData, quote.selectedSpecificationSizeId)]);
  };

  const duplicateItem = (item: QuotationLineItem) => {
    updateQuoteItems([...quote.items, { ...item, id: crypto.randomUUID(), productName: `${item.productName} copy`, amount: calculateLineAmount(item) }]);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= quote.items.length) return;
    const items = [...quote.items];
    const [removed] = items.splice(index, 1);
    items.splice(nextIndex, 0, removed);
    updateQuoteItems(items);
  };

  const deleteItem = (id: string) => {
    updateQuoteItems(quote.items.filter((entry) => entry.id !== id));
  };

  const clearItems = () => {
    updateQuoteItems([]);
  };

  const loadFortyByTwentyFive = () => {
    onChange({
      ...quote,
      items: buildFortyByTwentyFiveDefaultItems(masterData),
      location: quote.location || 'Trichy',
      selectedSpecificationSizeId: 'size-40x25-double',
    });
  };

  const loadFiftyByThirty = () => {
    const products = ['prod-structure-50x30-with-lights', 'prod-flex-printing', 'prod-mounting-50x30'];
    const items = products
      .map((productId) => masterData.products.find((entry) => entry.id === productId))
      .filter(Boolean)
      .map((product) => createItemFromProduct(product!, masterData, 'size-50x30-double'));
    onChange({
      ...quote,
      items,
      location: quote.location || 'Chennai',
      selectedSpecificationSizeId: 'size-50x30-double',
    });
  };

  const subtotal = quote.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Pricing builder</p>
          <h2>Product / service selection</h2>
          <p className="muted">Create, read, update, duplicate, reorder, clear, or delete any unipole signage line item.</p>
        </div>
        <div className="button-group">
          <button className="secondary-button" type="button" onClick={loadFortyByTwentyFive}>Load 40 x 25 sample</button>
          <button className="secondary-button" type="button" onClick={loadFiftyByThirty}>Load 50 x 30 sample</button>
          <button className="secondary-button" type="button" onClick={addCustomItem}>Add custom item</button>
          <button className="secondary-button danger-text" type="button" onClick={clearItems} disabled={quote.items.length === 0}>Clear items</button>
        </div>
      </div>

      <div className="add-row three">
        <label>
          <span>Preview specification size</span>
          <select
            value={quote.selectedSpecificationSizeId}
            onChange={(e) => onChange({ ...quote, selectedSpecificationSizeId: e.target.value })}
          >
            {masterData.sizes.map((size) => <option key={size.id} value={size.id}>{size.label}</option>)}
          </select>
        </label>
        <label>
          <span>Add product / service</span>
          <select defaultValue="" onChange={(e) => { addProduct(e.target.value); e.currentTarget.value = ''; }}>
            <option value="" disabled>Select item</option>
            {masterData.products.map((product) => (
              <option key={product.id} value={product.id}>{product.category} - {product.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Add-on</span>
          <select defaultValue="" onChange={(e) => { addOn(e.target.value); e.currentTarget.value = ''; }}>
            <option value="" disabled>Select add-on</option>
            {masterData.addOns.map((addOnItem) => (
              <option key={addOnItem.id} value={addOnItem.id}>{addOnItem.name} - {formatINR(addOnItem.rate)}</option>
            ))}
          </select>
        </label>
      </div>

      {quote.items.length === 0 ? (
        <div className="empty-state">No line items yet. Add a product/service, add-on, or custom item to build the quotation.</div>
      ) : (
        <div className="line-items">
          {quote.items.map((item, index) => (
            <article className="line-card" key={item.id}>
              <div className="line-card__top">
                <div className="line-index">{index + 1}</div>
                <div>
                  <strong>{item.productName}</strong>
                  <p>{item.description}</p>
                </div>
                <div className="line-actions">
                  <button className="icon-button" type="button" onClick={() => moveItem(index, -1)} disabled={index === 0}>↑</button>
                  <button className="icon-button" type="button" onClick={() => moveItem(index, 1)} disabled={index === quote.items.length - 1}>↓</button>
                  <button className="icon-button" type="button" onClick={() => duplicateItem(item)}>Copy</button>
                  <button className="icon-button danger" type="button" onClick={() => deleteItem(item.id)}>Delete</button>
                </div>
              </div>

              <div className="form-grid item-grid">
                <label>
                  <span>Category</span>
                  <input value={item.category} onChange={(e) => updateItem(item.id, { category: e.target.value })} />
                </label>
                <label>
                  <span>Product / service type</span>
                  <input value={item.productName} onChange={(e) => updateItem(item.id, { productName: e.target.value })} />
                </label>
                <label className="span-two">
                  <span>Description</span>
                  <textarea value={item.description} rows={2} onChange={(e) => updateItem(item.id, { description: e.target.value })} />
                </label>
                <label>
                  <span>Size</span>
                  <select
                    value={item.sizeId ?? ''}
                    onChange={(e) => {
                      const selectedSize = masterData.sizes.find((size) => size.id === e.target.value);
                      if (selectedSize) {
                        const updatedItem = applySizeToItem(item, selectedSize);
                        updateQuoteItems(quote.items.map((entry) => entry.id === item.id ? updatedItem : entry));
                      }
                    }}
                  >
                    {masterData.sizes.map((size) => <option key={size.id} value={size.id}>{size.label}</option>)}
                  </select>
                </label>
                <label>
                  <span>Material / specification</span>
                  <select
                    value={item.materialId ?? ''}
                    onChange={(e) => {
                      const material = masterData.materials.find((entry) => entry.id === e.target.value);
                      updateItem(item.id, {
                        materialId: material?.id,
                        materialName: material?.name ?? '',
                        specification: material?.specification ?? '',
                      });
                    }}
                  >
                    <option value="">Custom / not applicable</option>
                    {masterData.materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>Custom specification</span>
                  <input value={item.specification} onChange={(e) => updateItem(item.id, { specification: e.target.value })} />
                </label>
                <label>
                  <span>Width</span>
                  <input type="number" value={item.width} onChange={(e) => updateItem(item.id, { width: Number(e.target.value) })} />
                </label>
                <label>
                  <span>Height</span>
                  <input type="number" value={item.height} onChange={(e) => updateItem(item.id, { height: Number(e.target.value) })} />
                </label>
                <label>
                  <span>Sides</span>
                  <input type="number" value={item.sides} onChange={(e) => updateItem(item.id, { sides: Number(e.target.value) })} />
                </label>
                <label>
                  <span>Quantity</span>
                  <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })} />
                </label>
                <label>
                  <span>Duration</span>
                  <input type="number" value={item.duration} onChange={(e) => updateItem(item.id, { duration: Number(e.target.value) })} />
                </label>
                <label>
                  <span>Rate</span>
                  <input type="number" value={item.rate} onChange={(e) => updateItem(item.id, { rate: Number(e.target.value) })} />
                </label>
                <label>
                  <span>Unit type</span>
                  <select value={item.unitType} onChange={(e) => updateItem(item.id, { unitType: e.target.value as UnitType })}>
                    {unitOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  <span>Pricing basis</span>
                  <select value={item.pricingBasis} onChange={(e) => updateItem(item.id, { pricingBasis: e.target.value as PricingBasis })}>
                    {pricingBasisOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  <span>Minimum price</span>
                  <input type="number" value={item.minimumPrice} onChange={(e) => updateItem(item.id, { minimumPrice: Number(e.target.value) })} />
                </label>
                <label>
                  <span>HSN / SAC</span>
                  <input value={item.hsnSac} onChange={(e) => updateItem(item.id, { hsnSac: e.target.value })} />
                </label>
                <label>
                  <span>Due on</span>
                  <input value={item.dueOn} onChange={(e) => updateItem(item.id, { dueOn: e.target.value })} />
                </label>
                <label>
                  <span>Taxable</span>
                  <select value={item.taxable ? 'yes' : 'no'} onChange={(e) => updateItem(item.id, { taxable: e.target.value === 'yes' })}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
              </div>

              <div className="line-card__summary">
                <span>Area: <strong>{formatNumber(getArea(item))} sq.ft</strong></span>
                <span>Amount: <strong>{formatINR(item.amount)}</strong></span>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="totals-edit-row">
        <label>
          <span>Discount %</span>
          <input type="number" value={quote.discountPercent} onChange={(e) => onChange({ ...quote, discountPercent: Number(e.target.value) })} />
        </label>
        <label>
          <span>GST %</span>
          <input type="number" value={quote.taxPercent} onChange={(e) => onChange({ ...quote, taxPercent: Number(e.target.value) })} />
        </label>
        <label>
          <span>Additional charges label</span>
          <input value={quote.additionalChargesLabel} onChange={(e) => onChange({ ...quote, additionalChargesLabel: e.target.value })} />
        </label>
        <label>
          <span>Additional charges</span>
          <input type="number" value={quote.additionalCharges} onChange={(e) => onChange({ ...quote, additionalCharges: Number(e.target.value) })} />
        </label>
      </div>

      <div className="inline-total">
        <span>Current subtotal</span>
        <strong>{formatINR(subtotal)}</strong>
      </div>
    </section>
  );
}
