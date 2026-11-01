export type TradeType = 'aavak' | 'javak'; // aavak = inward/purchase (आवक/खरीद), javak = outward/sale (जावक/बिक्री)
export type PaymentStatus = 'paid' | 'pending' | 'partial';

export interface TradeEntry {
  id: string;
  serialNumber: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: TradeType;
  partyName: string;
  partyMobile?: string;
  villageOrCity?: string;
  commodity: string; // Fasal / Jinsi (e.g., Gehun, Kapas, Soyabean)
  bags: number; // Katta / Bori count
  grossWeightKg: number; // Gross weight in kg
  tareWeightKg: number; // Bardana / Kata deduction in kg
  netWeightKg: number; // Net weight in kg
  kgPerMan: number; // 20 or 40 (or custom)
  totalMan: number; // netWeightKg / kgPerMan
  ratePerMan: number; // Bhav in ₹ per Man
  ratePerQuintal: number; // Bhav in ₹ per Quintal (100 kg)
  grossAmount: number; // totalMan * ratePerMan
  commissionPercent: number; // Aadath / Dalali %
  commissionAmount: number;
  hamaliPerBag: number; // Hamali / Palledari per bag in ₹
  hamaliTotal: number;
  tulaye: number; // Weighbridge charges in ₹
  otherDeductions: number; // Extra deduction
  advancePaid: number; // Cash advance given
  netPayable: number; // Final payable / receivable
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface MandiSettings {
  firmName: string;
  tagline: string;
  mandiName: string;
  proprietor: string;
  mobile: string;
  gstOrLicenseNo?: string;
  address: string;
  defaultKgPerMan: 20 | 40 | number;
  defaultCommissionPercent: number;
  defaultHamaliPerBag: number;
  defaultTulaye: number;
}

export interface PartyAccount {
  name: string;
  mobile?: string;
  villageOrCity?: string;
  totalEntries: number;
  totalWeightKg: number;
  totalMan: number;
  totalTradeAmount: number;
  totalPaid: number;
  balanceDue: number; // Positive = Pending to pay, Negative = Advance
  lastTradeDate: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  partyName: string;
  amount: number;
  mode: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
  type: 'paid' | 'received';
  notes?: string;
}
