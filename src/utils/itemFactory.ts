import type { AddOn, MasterData, ProductService, QuotationLineItem, QuoteSize } from '../types/quotation';
import { calculateLineAmount } from './calculations';

export function createItemFromProduct(product: ProductService, masterData: MasterData, preferredSizeId?: string): QuotationLineItem {
  const size = masterData.sizes.find((entry) => entry.id === (preferredSizeId || product.defaultSizeId)) ?? masterData.sizes[0];
  const material = masterData.materials.find((entry) => entry.id === product.defaultMaterialId);
  const item: QuotationLineItem = {
    id: crypto.randomUUID(),
    category: product.category,
    productId: product.id,
    productName: product.name,
    description: product.name,
    hsnSac: product.hsnSac,
    dueOn: product.dueOn,
    sizeId: size.id,
    sizeLabel: size.label,
    width: size.width,
    height: size.height,
    sides: size.sides,
    materialId: material?.id,
    materialName: material?.name ?? '',
    specification: material?.specification ?? '',
    quantity: 1,
    duration: 1,
    rate: product.defaultRate,
    unitType: product.unitType,
    pricingBasis: product.pricingBasis,
    minimumPrice: product.minimumPrice,
    amount: 0,
    taxable: true,
  };

  if (product.name.toLowerCase().includes('structure')) {
    item.description = `UNIPOLE AT STRUCTURE FABRICATION & ERECTION ${product.name.toLowerCase().includes('without') ? 'WITHOUT LIGHTS' : 'WITH LIGHTS'} ${size.width} x ${size.height} (Front & Back)`;
  }

  return { ...item, amount: calculateLineAmount(item) };
}

export function createItemFromAddOn(addOn: AddOn, masterData: MasterData, preferredSizeId?: string): QuotationLineItem {
  const size = masterData.sizes.find((entry) => entry.id === preferredSizeId) ?? masterData.sizes[0];
  const item: QuotationLineItem = {
    id: crypto.randomUUID(),
    category: 'Add-ons',
    productName: addOn.name,
    description: addOn.description,
    hsnSac: addOn.hsnSac,
    dueOn: 'As per schedule',
    sizeId: size.id,
    sizeLabel: size.label,
    width: size.width,
    height: size.height,
    sides: size.sides,
    materialName: 'Add-on',
    specification: addOn.description,
    quantity: 1,
    duration: 1,
    rate: addOn.rate,
    unitType: addOn.unitType,
    pricingBasis: addOn.pricingBasis,
    minimumPrice: 0,
    amount: 0,
    taxable: addOn.taxable,
  };
  return { ...item, amount: calculateLineAmount(item) };
}

export function applySizeToItem(item: QuotationLineItem, size: QuoteSize): QuotationLineItem {
  const updated = {
    ...item,
    sizeId: size.id,
    sizeLabel: size.label,
    width: size.width,
    height: size.height,
    sides: size.sides,
  };
  return { ...updated, amount: calculateLineAmount(updated) };
}
