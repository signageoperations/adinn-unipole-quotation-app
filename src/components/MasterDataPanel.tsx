import type { AddOn, MasterData, MaterialSpec, PricingBasis, ProductService, QuoteSize, UnitType } from '../types/quotation';

const unitOptions: UnitType[] = ['sq.ft', 'No', 'per unit', 'per day', 'per month', 'fixed'];
const pricingOptions: PricingBasis[] = ['area', 'fixed', 'unit', 'day', 'month'];

type Props = {
  masterData: MasterData;
  onChange: (masterData: MasterData) => void;
  onReset: () => void;
};

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function MasterDataPanel({ masterData, onChange, onReset }: Props) {
  const updateProduct = (id: string, patch: Partial<ProductService>) => {
    onChange({
      ...masterData,
      products: masterData.products.map((product) => product.id === id ? { ...product, ...patch } : product),
    });
  };

  const createProduct = () => {
    onChange({
      ...masterData,
      products: [...masterData.products, {
        id: uid('prod'),
        category: 'Custom',
        name: 'New product / service',
        hsnSac: '',
        dueOn: '30 Days',
        unitType: 'fixed',
        pricingBasis: 'fixed',
        defaultRate: 0,
        minimumPrice: 0,
        defaultSizeId: masterData.sizes[0]?.id,
        defaultMaterialId: masterData.materials[0]?.id,
        includeInQuickQuote: false,
      }],
    });
  };

  const duplicateProduct = (product: ProductService) => {
    onChange({
      ...masterData,
      products: [...masterData.products, { ...product, id: uid('prod'), name: `${product.name} copy`, includeInQuickQuote: false }],
    });
  };

  const deleteProduct = (id: string) => {
    onChange({ ...masterData, products: masterData.products.filter((product) => product.id !== id) });
  };

  const updateSize = (id: string, patch: Partial<QuoteSize>) => {
    onChange({
      ...masterData,
      sizes: masterData.sizes.map((size) => size.id === id ? { ...size, ...patch } : size),
    });
  };

  const createSize = () => {
    const id = uid('size');
    onChange({
      ...masterData,
      sizes: [...masterData.sizes, {
        id,
        label: 'New custom size',
        width: 0,
        height: 0,
        sides: 1,
        groundClearance: '',
        displaySizeText: 'Custom display size',
      }],
      specificationBlocks: {
        ...masterData.specificationBlocks,
        [id]: ['Add specification line'],
      },
    });
  };

  const duplicateSize = (size: QuoteSize) => {
    const id = uid('size');
    onChange({
      ...masterData,
      sizes: [...masterData.sizes, { ...size, id, label: `${size.label} copy` }],
      specificationBlocks: {
        ...masterData.specificationBlocks,
        [id]: [...(masterData.specificationBlocks[size.id] || [])],
      },
    });
  };

  const deleteSize = (id: string) => {
    const nextBlocks = { ...masterData.specificationBlocks };
    delete nextBlocks[id];
    onChange({
      ...masterData,
      sizes: masterData.sizes.filter((size) => size.id !== id),
      products: masterData.products.map((product) => product.defaultSizeId === id ? { ...product, defaultSizeId: undefined } : product),
      specificationBlocks: nextBlocks,
    });
  };

  const updateMaterial = (id: string, patch: Partial<MaterialSpec>) => {
    onChange({
      ...masterData,
      materials: masterData.materials.map((material) => material.id === id ? { ...material, ...patch } : material),
    });
  };

  const createMaterial = () => {
    onChange({
      ...masterData,
      materials: [...masterData.materials, {
        id: uid('mat'),
        name: 'New material',
        specification: 'Add specification',
      }],
    });
  };

  const duplicateMaterial = (material: MaterialSpec) => {
    onChange({
      ...masterData,
      materials: [...masterData.materials, { ...material, id: uid('mat'), name: `${material.name} copy` }],
    });
  };

  const deleteMaterial = (id: string) => {
    onChange({
      ...masterData,
      materials: masterData.materials.filter((material) => material.id !== id),
      products: masterData.products.map((product) => product.defaultMaterialId === id ? { ...product, defaultMaterialId: undefined } : product),
    });
  };

  const updateAddOn = (id: string, patch: Partial<AddOn>) => {
    onChange({
      ...masterData,
      addOns: masterData.addOns.map((addOn) => addOn.id === id ? { ...addOn, ...patch } : addOn),
    });
  };

  const createAddOn = () => {
    onChange({
      ...masterData,
      addOns: [...masterData.addOns, {
        id: uid('addon'),
        name: 'New add-on',
        description: 'Add-on description',
        rate: 0,
        unitType: 'fixed',
        hsnSac: '998361',
        pricingBasis: 'fixed',
        taxable: true,
      }],
    });
  };

  const duplicateAddOn = (addOn: AddOn) => {
    onChange({
      ...masterData,
      addOns: [...masterData.addOns, { ...addOn, id: uid('addon'), name: `${addOn.name} copy` }],
    });
  };

  const deleteAddOn = (id: string) => {
    onChange({ ...masterData, addOns: masterData.addOns.filter((addOn) => addOn.id !== id) });
  };

  const updateDefaultTerm = (index: number, value: string) => {
    const terms = [...masterData.terms];
    terms[index] = value;
    onChange({ ...masterData, terms });
  };

  const updateSpec = (sizeId: string, index: number, value: string) => {
    const current = [...(masterData.specificationBlocks[sizeId] || [])];
    current[index] = value;
    onChange({ ...masterData, specificationBlocks: { ...masterData.specificationBlocks, [sizeId]: current } });
  };

  const addSpec = (sizeId: string) => {
    const current = masterData.specificationBlocks[sizeId] || [];
    onChange({ ...masterData, specificationBlocks: { ...masterData.specificationBlocks, [sizeId]: [...current, 'New specification line'] } });
  };

  const deleteSpec = (sizeId: string, index: number) => {
    const current = masterData.specificationBlocks[sizeId] || [];
    onChange({ ...masterData, specificationBlocks: { ...masterData.specificationBlocks, [sizeId]: current.filter((_, specIndex) => specIndex !== index) } });
  };

  return (
    <section className="panel master-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Admin-style settings</p>
          <h2>Editable pricing master data</h2>
          <p className="muted">Full CRUD for products, sizes, materials, add-ons, specification lines, GST, discounts, notes and terms. These defaults are saved in your browser.</p>
        </div>
        <button className="secondary-button danger-text" type="button" onClick={onReset}>Reset defaults</button>
      </div>

      <details open>
        <summary>Product / service names and pricing</summary>
        <div className="admin-table-wrap">
          <table className="admin-table wide-admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Product / Service</th>
                <th>Rate</th>
                <th>Min price</th>
                <th>Unit</th>
                <th>Pricing</th>
                <th>HSN/SAC</th>
                <th>Due on</th>
                <th>Default size</th>
                <th>Default material</th>
                <th>Quick</th>
                <th>CRUD</th>
              </tr>
            </thead>
            <tbody>
              {masterData.products.map((product) => (
                <tr key={product.id}>
                  <td><input value={product.category} onChange={(e) => updateProduct(product.id, { category: e.target.value })} /></td>
                  <td><input value={product.name} onChange={(e) => updateProduct(product.id, { name: e.target.value })} /></td>
                  <td><input type="number" value={product.defaultRate} onChange={(e) => updateProduct(product.id, { defaultRate: Number(e.target.value) })} /></td>
                  <td><input type="number" value={product.minimumPrice} onChange={(e) => updateProduct(product.id, { minimumPrice: Number(e.target.value) })} /></td>
                  <td>
                    <select value={product.unitType} onChange={(e) => updateProduct(product.id, { unitType: e.target.value as UnitType })}>
                      {unitOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={product.pricingBasis} onChange={(e) => updateProduct(product.id, { pricingBasis: e.target.value as PricingBasis })}>
                      {pricingOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </td>
                  <td><input value={product.hsnSac} onChange={(e) => updateProduct(product.id, { hsnSac: e.target.value })} /></td>
                  <td><input value={product.dueOn} onChange={(e) => updateProduct(product.id, { dueOn: e.target.value })} /></td>
                  <td>
                    <select value={product.defaultSizeId || ''} onChange={(e) => updateProduct(product.id, { defaultSizeId: e.target.value || undefined })}>
                      <option value="">None</option>
                      {masterData.sizes.map((size) => <option key={size.id} value={size.id}>{size.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={product.defaultMaterialId || ''} onChange={(e) => updateProduct(product.id, { defaultMaterialId: e.target.value || undefined })}>
                      <option value="">None</option>
                      {masterData.materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={product.includeInQuickQuote ? 'yes' : 'no'} onChange={(e) => updateProduct(product.id, { includeInQuickQuote: e.target.value === 'yes' })}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </td>
                  <td>
                    <div className="mini-actions">
                      <button className="icon-button" type="button" onClick={() => duplicateProduct(product)}>Copy</button>
                      <button className="icon-button danger" type="button" onClick={() => deleteProduct(product.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="secondary-button" type="button" onClick={createProduct}>Add product / service</button>
      </details>

      <details>
        <summary>Available sizes</summary>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Width</th>
                <th>Height</th>
                <th>Sides</th>
                <th>Ground clearance</th>
                <th>Preview text</th>
                <th>CRUD</th>
              </tr>
            </thead>
            <tbody>
              {masterData.sizes.map((size) => (
                <tr key={size.id}>
                  <td><input value={size.label} onChange={(e) => updateSize(size.id, { label: e.target.value })} /></td>
                  <td><input type="number" value={size.width} onChange={(e) => updateSize(size.id, { width: Number(e.target.value) })} /></td>
                  <td><input type="number" value={size.height} onChange={(e) => updateSize(size.id, { height: Number(e.target.value) })} /></td>
                  <td><input type="number" value={size.sides} onChange={(e) => updateSize(size.id, { sides: Number(e.target.value) })} /></td>
                  <td><input value={size.groundClearance} onChange={(e) => updateSize(size.id, { groundClearance: e.target.value })} /></td>
                  <td><input value={size.displaySizeText} onChange={(e) => updateSize(size.id, { displaySizeText: e.target.value })} /></td>
                  <td>
                    <div className="mini-actions">
                      <button className="icon-button" type="button" onClick={() => duplicateSize(size)}>Copy</button>
                      <button className="icon-button danger" type="button" onClick={() => deleteSize(size.id)} disabled={masterData.sizes.length <= 1}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="secondary-button" type="button" onClick={createSize}>Add size</button>
      </details>

      <details>
        <summary>Material types and specifications</summary>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specification</th>
                <th>CRUD</th>
              </tr>
            </thead>
            <tbody>
              {masterData.materials.map((material) => (
                <tr key={material.id}>
                  <td><input value={material.name} onChange={(e) => updateMaterial(material.id, { name: e.target.value })} /></td>
                  <td><input value={material.specification} onChange={(e) => updateMaterial(material.id, { specification: e.target.value })} /></td>
                  <td>
                    <div className="mini-actions">
                      <button className="icon-button" type="button" onClick={() => duplicateMaterial(material)}>Copy</button>
                      <button className="icon-button danger" type="button" onClick={() => deleteMaterial(material.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="secondary-button" type="button" onClick={createMaterial}>Add material</button>
      </details>

      <details>
        <summary>Preview specification blocks</summary>
        <p className="muted">These lines appear in the technical specification area of the A4 quotation preview.</p>
        <div className="spec-admin-list">
          {masterData.sizes.map((size) => (
            <div className="spec-admin-card" key={size.id}>
              <div className="panel__header compact">
                <div>
                  <p className="small-title">{size.label}</p>
                  <strong>{size.displaySizeText}</strong>
                </div>
                <button className="secondary-button" type="button" onClick={() => addSpec(size.id)}>Add spec line</button>
              </div>
              <div className="terms-editor">
                {(masterData.specificationBlocks[size.id] || []).map((spec, index) => (
                  <div className="term-row" key={`${size.id}-${index}`}>
                    <input value={spec} onChange={(e) => updateSpec(size.id, index, e.target.value)} />
                    <button className="icon-button danger" type="button" onClick={() => deleteSpec(size.id, index)}>x</button>
                  </div>
                ))}
                {(masterData.specificationBlocks[size.id] || []).length === 0 && <p className="muted">No specification lines yet.</p>}
              </div>
            </div>
          ))}
        </div>
      </details>

      <details>
        <summary>Add-ons, GST, discount and default terms</summary>
        <div className="form-grid four compact-grid">
          <label>
            <span>Default GST %</span>
            <input type="number" value={masterData.taxPercent} onChange={(e) => onChange({ ...masterData, taxPercent: Number(e.target.value) })} />
          </label>
          <label>
            <span>Default discount %</span>
            <input type="number" value={masterData.discountPercent} onChange={(e) => onChange({ ...masterData, discountPercent: Number(e.target.value) })} />
          </label>
          <label>
            <span>Charges label</span>
            <input value={masterData.additionalChargesLabel} onChange={(e) => onChange({ ...masterData, additionalChargesLabel: e.target.value })} />
          </label>
          <label>
            <span>Default charges</span>
            <input type="number" value={masterData.defaultAdditionalCharges} onChange={(e) => onChange({ ...masterData, defaultAdditionalCharges: Number(e.target.value) })} />
          </label>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Add-on</th>
                <th>Description</th>
                <th>Rate</th>
                <th>Unit</th>
                <th>Pricing</th>
                <th>HSN/SAC</th>
                <th>Taxable</th>
                <th>CRUD</th>
              </tr>
            </thead>
            <tbody>
              {masterData.addOns.map((addOn) => (
                <tr key={addOn.id}>
                  <td><input value={addOn.name} onChange={(e) => updateAddOn(addOn.id, { name: e.target.value })} /></td>
                  <td><input value={addOn.description} onChange={(e) => updateAddOn(addOn.id, { description: e.target.value })} /></td>
                  <td><input type="number" value={addOn.rate} onChange={(e) => updateAddOn(addOn.id, { rate: Number(e.target.value) })} /></td>
                  <td>
                    <select value={addOn.unitType} onChange={(e) => updateAddOn(addOn.id, { unitType: e.target.value as UnitType })}>
                      {unitOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={addOn.pricingBasis} onChange={(e) => updateAddOn(addOn.id, { pricingBasis: e.target.value as PricingBasis })}>
                      {pricingOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </td>
                  <td><input value={addOn.hsnSac} onChange={(e) => updateAddOn(addOn.id, { hsnSac: e.target.value })} /></td>
                  <td>
                    <select value={addOn.taxable ? 'yes' : 'no'} onChange={(e) => updateAddOn(addOn.id, { taxable: e.target.value === 'yes' })}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </td>
                  <td>
                    <div className="mini-actions">
                      <button className="icon-button" type="button" onClick={() => duplicateAddOn(addOn)}>Copy</button>
                      <button className="icon-button danger" type="button" onClick={() => deleteAddOn(addOn.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="secondary-button" type="button" onClick={createAddOn}>Add add-on</button>

        <label className="full-label admin-full-label">
          <span>Default notes</span>
          <textarea rows={3} value={masterData.notes} onChange={(e) => onChange({ ...masterData, notes: e.target.value })} />
        </label>
        <div className="terms-editor">
          {masterData.terms.map((term, index) => (
            <div className="term-row" key={`default-term-${index}`}>
              <input value={term} onChange={(e) => updateDefaultTerm(index, e.target.value)} />
              <button className="icon-button danger" type="button" onClick={() => onChange({ ...masterData, terms: masterData.terms.filter((_, termIndex) => termIndex !== index) })}>x</button>
            </div>
          ))}
          <button className="secondary-button" type="button" onClick={() => onChange({ ...masterData, terms: [...masterData.terms, 'New default term'] })}>Add default term</button>
        </div>
      </details>
    </section>
  );
}
