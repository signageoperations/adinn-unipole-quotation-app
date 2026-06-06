export type UnitType = 'sq.ft' | 'No' | 'per unit' | 'per day' | 'per month' | 'fixed';

export type PricingBasis = 'area' | 'fixed' | 'unit' | 'day' | 'month';

export interface QuoteSize {
  id: string;
  label: string;
  width: number;
  height: number;
  sides: number;
  groundClearance: string;
  displaySizeText: string;
}

export interface MaterialSpec {
  id: string;
  name: string;
  specification: string;
}

export interface ProductService {
  id: string;
  category: string;
  name: string;
  hsnSac: string;
  dueOn: string;
  unitType: UnitType;
  pricingBasis: PricingBasis;
  defaultRate: number;
  minimumPrice: number;
  defaultMaterialId?: string;
  defaultSizeId?: string;
  includeInQuickQuote?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  rate: number;
  unitType: UnitType;
  hsnSac: string;
  pricingBasis: PricingBasis;
  taxable: boolean;
}

export interface MasterData {
  products: ProductService[];
  sizes: QuoteSize[];
  materials: MaterialSpec[];
  addOns: AddOn[];
  taxPercent: number;
  discountPercent: number;
  additionalChargesLabel: string;
  defaultAdditionalCharges: number;
  notes: string;
  terms: string[];
  specificationBlocks: Record<string, string[]>;
}

export interface ClientDetails {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export interface PreparedByDetails {
  name: string;
  phone: string;
  email: string;
}

export interface CompanyDetails {
  name: string;
  logoText: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  website: string;
}

export interface QuotationLineItem {
  id: string;
  category: string;
  productId?: string;
  productName: string;
  description: string;
  hsnSac: string;
  dueOn: string;
  sizeId?: string;
  sizeLabel: string;
  width: number;
  height: number;
  sides: number;
  materialId?: string;
  materialName: string;
  specification: string;
  quantity: number;
  duration: number;
  rate: number;
  unitType: UnitType;
  pricingBasis: PricingBasis;
  minimumPrice: number;
  amount: number;
  taxable: boolean;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  quotationTitle: string;
  quotationDate: string;
  validUntil: string;
  modeOfPayment: string;
  buyerReference: string;
  otherReference: string;
  dispatchThrough: string;
  destination: string;
  projectName: string;
  location: string;
  client: ClientDetails;
  preparedBy: PreparedByDetails;
  company: CompanyDetails;
  items: QuotationLineItem[];
  discountPercent: number;
  additionalChargesLabel: string;
  additionalCharges: number;
  taxPercent: number;
  notes: string;
  terms: string[];
  selectedSpecificationSizeId: string;
}

export interface QuoteTotals {
  subtotal: number;
  discount: number;
  taxableSubtotal: number;
  tax: number;
  additionalCharges: number;
  grandTotal: number;
}

export interface SavedQuotationSummary {
  id: string;
  quotationNo: string;
  quotationTitle: string;
  quotationDate: string;
  validUntil: string;
  clientName: string;
  contactPerson: string;
  phone: string;
  email: string;
  projectName: string;
  location: string;
  preparedBy: string;
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
  quote: Quotation;
}
