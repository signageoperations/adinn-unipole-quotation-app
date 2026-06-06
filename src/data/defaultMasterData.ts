import type { MasterData, Quotation } from '../types/quotation';
import { calculateLineAmount } from '../utils/calculations';
import { addDays, todayISO } from '../utils/dates';

export const STORAGE_KEYS = {
  masterData: 'adinn-unipole-master-data-v1',
  quotations: 'adinn-unipole-quotations-v1',
  sequence: 'adinn-unipole-sequence-v1',
};

export const defaultMasterData: MasterData = {
  taxPercent: 18,
  discountPercent: 0,
  additionalChargesLabel: 'Additional charges',
  defaultAdditionalCharges: 0,
  notes: 'Quotation is prepared based on current site inputs and standard ADINN unipole signage scope. Final execution is subject to site feasibility, permissions, access, and approval of final artwork/specifications.',
  terms: [
    'Payment: 60% advance, 30% after delivery, and 10% after completion.',
    'Schedule: 4 weeks from the date of PO and advance received.',
    'GST: 18% extra unless stated otherwise.',
    'Validity: 15 days from quotation date.',
    'Any government permission, electricity connection, local body charges, or third-party approvals will be charged extra if applicable.',
    'Artwork, printing, mounting, fabrication, installation, transport, and crane scope can be customized before confirmation.'
  ],
  sizes: [
    {
      id: 'size-40x25-double',
      label: '40 x 25 Double Side',
      width: 40,
      height: 25,
      sides: 2,
      groundClearance: '25 ft ground clearance',
      displaySizeText: "40' W x 25' H, 25' ground clearance, double sided",
    },
    {
      id: 'size-50x30-double',
      label: '50 x 30 Double Side',
      width: 50,
      height: 30,
      sides: 2,
      groundClearance: '40 ft ground clearance',
      displaySizeText: "50' W x 30' H, 40' ground clearance, double sided",
    },
  ],
  materials: [
    {
      id: 'mat-structure-without-lights',
      name: 'MS structure fabrication without lights',
      specification: 'Unipole structure fabrication and erection without lights, zinc primer with enamel coating, foundation and installation support.',
    },
    {
      id: 'mat-structure-with-lights',
      name: 'MS structure fabrication with lights',
      specification: 'Unipole structure fabrication and erection with lighting scope, foundation, transport, crane support and installation support.',
    },
    {
      id: 'mat-star-flex-solvent',
      name: 'Star Flex with solvent print',
      specification: 'Star flex printing with solvent print finish suitable for outdoor display.',
    },
    {
      id: 'mat-mounting-standard',
      name: 'Standard flex mounting',
      specification: 'Flex mounting at site with necessary labour support and finishing.',
    },
  ],
  products: [
    {
      id: 'prod-structure-40x25-without-lights',
      category: 'Unipole Signage',
      name: 'Unipole structure fabrication & erection - without lights',
      hsnSac: '998361',
      dueOn: '30 Days',
      unitType: 'No',
      pricingBasis: 'fixed',
      defaultRate: 1250000,
      minimumPrice: 1250000,
      defaultMaterialId: 'mat-structure-without-lights',
      defaultSizeId: 'size-40x25-double',
      includeInQuickQuote: true,
    },
    {
      id: 'prod-structure-50x30-with-lights',
      category: 'Unipole Signage',
      name: 'Unipole structure fabrication & erection - with lights',
      hsnSac: '998361',
      dueOn: '30 Days',
      unitType: 'No',
      pricingBasis: 'fixed',
      defaultRate: 1600000,
      minimumPrice: 1600000,
      defaultMaterialId: 'mat-structure-with-lights',
      defaultSizeId: 'size-50x30-double',
      includeInQuickQuote: true,
    },
    {
      id: 'prod-flex-printing',
      category: 'Printing',
      name: 'Flex printing charges',
      hsnSac: '4911',
      dueOn: '30 Days',
      unitType: 'sq.ft',
      pricingBasis: 'area',
      defaultRate: 18,
      minimumPrice: 0,
      defaultMaterialId: 'mat-star-flex-solvent',
      defaultSizeId: 'size-40x25-double',
      includeInQuickQuote: true,
    },
    {
      id: 'prod-mounting-40x25',
      category: 'Installation',
      name: 'Mounting charges',
      hsnSac: '998361',
      dueOn: '30 Days',
      unitType: 'sq.ft',
      pricingBasis: 'area',
      defaultRate: 7,
      minimumPrice: 0,
      defaultMaterialId: 'mat-mounting-standard',
      defaultSizeId: 'size-40x25-double',
      includeInQuickQuote: true,
    },
    {
      id: 'prod-mounting-50x30',
      category: 'Installation',
      name: 'Mounting charges - large format',
      hsnSac: '998361',
      dueOn: '30 Days',
      unitType: 'sq.ft',
      pricingBasis: 'area',
      defaultRate: 8,
      minimumPrice: 0,
      defaultMaterialId: 'mat-mounting-standard',
      defaultSizeId: 'size-50x30-double',
      includeInQuickQuote: true,
    },
    {
      id: 'prod-transport-crane',
      category: 'Transport & others',
      name: 'Transport, crane and installation support',
      hsnSac: '998361',
      dueOn: 'As per schedule',
      unitType: 'fixed',
      pricingBasis: 'fixed',
      defaultRate: 0,
      minimumPrice: 0,
      includeInQuickQuote: false,
    },
  ],
  addOns: [
    {
      id: 'addon-lighting-40x25',
      name: 'Lighting package',
      description: '200 watts LED focus lights, light fixing gun, L&T timer controller unit with Sintex enclosure, cabling with PVC conduit pipe.',
      rate: 250000,
      unitType: 'fixed',
      hsnSac: '998361',
      pricingBasis: 'fixed',
      taxable: true,
    },
  ],
  specificationBlocks: {
    'size-40x25-double': [
      'Main pole: 800 dia, 8mm thick, 40 ft',
      'Horizontal pipe: 410 dia, 8mm thick, 40 ft',
      'Bottom base plate: 1200mm x 1200mm, 25mm thick',
      'Top plates: 900mm x 900mm, 20mm thick',
      'Connecting plates: 700mm x 520mm x 12mm thick',
      'Gusset plates: 500mm x 200mm x 12mm thick',
      'Stool plates: 600mm x 350mm x 16mm thick',
      '100 x 50 channel, 200 x 80 channel, 50 L angle and monkey ladder provision',
      'Foundation: 5ft x 5ft width, 10ft depth with M20 to M30 grade concrete depending on site condition',
      'Flex printing and mounting: Star flex with solvent print',
      'Transport and others: crane charges, installation charges, painting zinc primer with enamel coating, truck and minivan transport',
    ],
    'size-50x30-double': [
      'Main pole: 910 dia, 8mm thick, 45 ft',
      'Horizontal pipe: 410 dia, 8mm thick, 50 ft',
      'Bottom base plate: 1524mm dia, 25mm thick',
      'Top plates: 1250mm x 1250mm, 16mm thick',
      'Connecting plates: 700mm x 520mm x 12mm thick',
      'Gusset plates: 500mm x 200mm x 12mm thick',
      'Stool plates: 600mm x 350mm x 16mm thick',
      '100 x 50 channel, 200 x 80 channel, 50 L angle and monkey ladder provision',
      'Lighting: 200 watts LED focus, light fixing gun, L&T timer controller unit with Sintex enclosure, cabling with PVC conduit pipe',
      'Foundation: 5ft x 5ft width, 10ft depth with M20 grade concrete',
      'Transport and others: crane charges, installation charges, painting zinc primer with enamel coating, truck and minivan transport',
    ],
  },
};

export function createEmptyQuotation(sequence = 1, masterData: MasterData = defaultMasterData): Quotation {
  const date = todayISO();
  return {
    id: crypto.randomUUID(),
    quotationNo: `ADINN/UNI/${new Date().getFullYear()}-${String(sequence).padStart(3, '0')}`,
    quotationTitle: 'Quotation',
    quotationDate: date,
    validUntil: addDays(date, 15),
    modeOfPayment: '80% in advance',
    buyerReference: '',
    otherReference: '',
    dispatchThrough: '',
    destination: '',
    projectName: 'Unipole Signage Campaign',
    location: 'Chennai',
    client: {
      companyName: 'Client Company Name',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
    },
    preparedBy: {
      name: 'ADINN Team',
      phone: '',
      email: 'info@adinn.com',
    },
    company: {
      name: 'Adinn Advertising Services Limited',
      logoText: 'ADINN',
      address: 'Chennai, Tamil Nadu, India',
      phone: '',
      email: 'info@adinn.com',
      gstin: '',
      website: 'www.adinn.com',
    },
    items: buildFortyByTwentyFiveDefaultItems(masterData),
    discountPercent: masterData.discountPercent,
    additionalChargesLabel: masterData.additionalChargesLabel,
    additionalCharges: masterData.defaultAdditionalCharges,
    taxPercent: masterData.taxPercent,
    notes: masterData.notes,
    terms: [...masterData.terms],
    selectedSpecificationSizeId: 'size-40x25-double',
  };
}

export function buildFortyByTwentyFiveDefaultItems(masterData: MasterData) {
  const productIds = [
    'prod-structure-40x25-without-lights',
    'prod-flex-printing',
    'prod-mounting-40x25',
  ];

  return productIds.map((productId) => {
    const product = masterData.products.find((item) => item.id === productId)!;
    const size = masterData.sizes.find((item) => item.id === product.defaultSizeId) ?? masterData.sizes[0];
    const material = masterData.materials.find((item) => item.id === product.defaultMaterialId);
    const item = {
      id: crypto.randomUUID(),
      category: product.category,
      productId: product.id,
      productName: product.name,
      description:
        product.id === 'prod-structure-40x25-without-lights'
          ? 'UNIPOLE AT STRUCTURE FABRICATION & ERECTION WITHOUT LIGHTS 40 x 25 (Front & Back)'
          : product.name,
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
    return { ...item, amount: calculateLineAmount(item) };
  });
}
