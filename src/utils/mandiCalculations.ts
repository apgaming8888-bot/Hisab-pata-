/**
 * Utility functions for Mandi trade calculations and Maund (मण) conversions.
 */

export interface MaundBreakdown {
  totalMan: number; // e.g. 26.5
  fullMan: number; // e.g. 26
  remainderKg: number; // e.g. 10 kg
  formattedText: string; // "26 मण 10 किग्रा"
}

/**
 * Calculates Maund from net weight in kilograms.
 * 1 Man = kgPerMan (typically 20kg in Western India, 40kg in North India).
 */
export function calculateMaund(netKg: number, kgPerMan: number = 20): MaundBreakdown {
  if (!netKg || netKg <= 0 || !kgPerMan || kgPerMan <= 0) {
    return {
      totalMan: 0,
      fullMan: 0,
      remainderKg: 0,
      formattedText: '0 मण 0 किग्रा',
    };
  }

  const totalMan = Number((netKg / kgPerMan).toFixed(4));
  const fullMan = Math.floor(netKg / kgPerMan);
  const remainderKg = Number((netKg % kgPerMan).toFixed(2));

  return {
    totalMan,
    fullMan,
    remainderKg,
    formattedText: `${fullMan} मण ${remainderKg > 0 ? `${remainderKg} किग्रा` : '0 किग्रा'}`,
  };
}

/**
 * Converts Rate per Man to Rate per Quintal (1 Quintal = 100 kg)
 */
export function rateManToQuintal(ratePerMan: number, kgPerMan: number = 20): number {
  if (!ratePerMan || !kgPerMan) return 0;
  // rate per kg = ratePerMan / kgPerMan
  // rate per quintal = ratePerKg * 100
  const ratePerKg = ratePerMan / kgPerMan;
  return Number((ratePerKg * 100).toFixed(2));
}

/**
 * Converts Rate per Quintal (100 kg) to Rate per Man
 */
export function rateQuintalToMan(ratePerQuintal: number, kgPerMan: number = 20): number {
  if (!ratePerQuintal || !kgPerMan) return 0;
  // rate per kg = ratePerQuintal / 100
  // rate per man = ratePerKg * kgPerMan
  const ratePerKg = ratePerQuintal / 100;
  return Number((ratePerKg * kgPerMan).toFixed(2));
}

/**
 * Comprehensive calculation of trade totals, deductions, and net payable.
 */
export function calculateTradeTotals(params: {
  grossWeightKg: number;
  tareWeightKg: number;
  kgPerMan: number;
  ratePerMan: number;
  bags: number;
  commissionPercent?: number;
  hamaliPerBag?: number;
  tulaye?: number;
  otherDeductions?: number;
  advancePaid?: number;
}) {
  const gross = Math.max(0, params.grossWeightKg || 0);
  const tare = Math.max(0, params.tareWeightKg || 0);
  const netKg = Math.max(0, gross - tare);
  const kgPerMan = params.kgPerMan || 20;
  const ratePerMan = Math.max(0, params.ratePerMan || 0);
  const bags = Math.max(0, params.bags || 0);

  const maundInfo = calculateMaund(netKg, kgPerMan);
  const totalMan = maundInfo.totalMan;

  // Gross Amount = totalMan * ratePerMan
  const grossAmount = Math.round(totalMan * ratePerMan * 100) / 100;

  // Deductions
  const commPercent = Math.max(0, params.commissionPercent || 0);
  const commissionAmount = Math.round(((grossAmount * commPercent) / 100) * 100) / 100;

  const hamaliRate = Math.max(0, params.hamaliPerBag || 0);
  const hamaliTotal = Math.round(bags * hamaliRate * 100) / 100;

  const tulaye = Math.max(0, params.tulaye || 0);
  const other = Math.max(0, params.otherDeductions || 0);
  const advance = Math.max(0, params.advancePaid || 0);

  const totalDeductions = commissionAmount + hamaliTotal + tulaye + other;
  const netPayable = Math.max(0, Math.round((grossAmount - totalDeductions - advance) * 100) / 100);

  return {
    netKg,
    maundInfo,
    totalMan,
    ratePerQuintal: rateManToQuintal(ratePerMan, kgPerMan),
    grossAmount,
    commissionAmount,
    hamaliTotal,
    totalDeductions,
    netPayable,
  };
}

/**
 * Format currency in Indian numbering format (e.g. ₹ 1,25,400)
 */
export function formatINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '₹ 0';
  return '₹ ' + Math.round(val).toLocaleString('en-IN');
}

/**
 * Format weight in kilograms with comma separators
 */
export function formatKg(val: number): string {
  if (!val) return '0 kg';
  return `${val.toLocaleString('en-IN')} kg`;
}

/**
 * Convert number to Hindi/English words for payment slip
 */
export function numberToWordsHindi(num: number): string {
  if (!num || num <= 0) return 'शून्य रुपये मात्र';

  const units = ['', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
    'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];
  const tens = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];

  const n = Math.floor(num);
  if (n === 0) return 'शून्य रुपये';

  function convertTwoDigits(n: number): string {
    if (n < 20) return units[n];
    const t = Math.floor(n / 10);
    const u = n % 10;
    return tens[t] + (u > 0 ? ' ' + units[u] : '');
  }

  let words = '';

  const crore = Math.floor(n / 10000000);
  const remCrore = n % 10000000;
  const lakh = Math.floor(remCrore / 100000);
  const remLakh = remCrore % 100000;
  const thousand = Math.floor(remLakh / 1000);
  const remThousand = remLakh % 1000;
  const hundred = Math.floor(remThousand / 100);
  const remainder = remThousand % 100;

  if (crore > 0) words += convertTwoDigits(crore) + ' करोड़ ';
  if (lakh > 0) words += convertTwoDigits(lakh) + ' लाख ';
  if (thousand > 0) words += convertTwoDigits(thousand) + ' हज़ार ';
  if (hundred > 0) words += units[hundred] + ' सौ ';
  if (remainder > 0) words += convertTwoDigits(remainder) + ' ';

  return words.trim() + ' रुपये मात्र';
}
