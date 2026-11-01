import React, { useState, useEffect } from 'react';
import { X, Calculator, Scale, ArrowDownLeft, ArrowUpRight, Check, FileText } from 'lucide-react';
import { MandiSettings, TradeEntry, TradeType, PaymentStatus } from '../types/mandi';
import { DEFAULT_COMMODITIES } from '../data/seedData';
import {
  calculateMaund,
  rateManToQuintal,
  rateQuintalToMan,
  formatINR,
  numberToWordsHindi,
} from '../utils/mandiCalculations';

interface TradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: TradeEntry, shouldOpenSlip?: boolean) => void;
  settings: MandiSettings;
  initialEntry?: TradeEntry | null;
}

export const TradeEntryModal: React.FC<TradeEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  settings,
  initialEntry,
}) => {
  const [type, setType] = useState<TradeType>('aavak');
  const [partyName, setPartyName] = useState('');
  const [partyMobile, setPartyMobile] = useState('');
  const [villageOrCity, setVillageOrCity] = useState('');
  const [commodity, setCommodity] = useState(DEFAULT_COMMODITIES[0].nameHindi);
  const [customCommodity, setCustomCommodity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bags, setBags] = useState<number | ''>(25);
  const [grossWeightKg, setGrossWeightKg] = useState<number | ''>(1025);
  const [tareWeightKg, setTareWeightKg] = useState<number | ''>(25);
  const [kgPerMan, setKgPerMan] = useState<number>(settings.defaultKgPerMan || 20);

  // Rates
  const [ratePerMan, setRatePerMan] = useState<number | ''>(1600);
  const [ratePerQuintal, setRatePerQuintal] = useState<number | ''>(8000);

  // Deductions
  const [commissionPercent, setCommissionPercent] = useState<number | ''>(settings.defaultCommissionPercent);
  const [hamaliPerBag, setHamaliPerBag] = useState<number | ''>(settings.defaultHamaliPerBag);
  const [tulaye, setTulaye] = useState<number | ''>(settings.defaultTulaye);
  const [otherDeductions, setOtherDeductions] = useState<number | ''>(0);
  const [advancePaid, setAdvancePaid] = useState<number | ''>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [notes, setNotes] = useState('');

  // Populate when editing
  useEffect(() => {
    if (initialEntry) {
      setType(initialEntry.type);
      setPartyName(initialEntry.partyName);
      setPartyMobile(initialEntry.partyMobile || '');
      setVillageOrCity(initialEntry.villageOrCity || '');
      setCommodity(initialEntry.commodity);
      setDate(initialEntry.date);
      setBags(initialEntry.bags);
      setGrossWeightKg(initialEntry.grossWeightKg);
      setTareWeightKg(initialEntry.tareWeightKg);
      setKgPerMan(initialEntry.kgPerMan);
      setRatePerMan(initialEntry.ratePerMan);
      setRatePerQuintal(initialEntry.ratePerQuintal);
      setCommissionPercent(initialEntry.commissionPercent);
      setHamaliPerBag(initialEntry.hamaliPerBag);
      setTulaye(initialEntry.tulaye);
      setOtherDeductions(initialEntry.otherDeductions || 0);
      setAdvancePaid(initialEntry.advancePaid || 0);
      setPaymentStatus(initialEntry.paymentStatus);
      setNotes(initialEntry.notes || '');
    } else {
      setKgPerMan(settings.defaultKgPerMan || 20);
      setCommissionPercent(settings.defaultCommissionPercent);
      setHamaliPerBag(settings.defaultHamaliPerBag);
      setTulaye(settings.defaultTulaye);
    }
  }, [initialEntry, settings, isOpen]);

  if (!isOpen) return null;

  // Real-time calculations
  const numGross = Number(grossWeightKg) || 0;
  const numTare = Number(tareWeightKg) || 0;
  const netWeightKg = Math.max(0, numGross - numTare);
  const numBags = Number(bags) || 0;
  const maundBreakdown = calculateMaund(netWeightKg, kgPerMan);
  const totalMan = maundBreakdown.totalMan;

  const numRatePerMan = Number(ratePerMan) || 0;
  const grossAmount = Math.round(totalMan * numRatePerMan * 100) / 100;

  const numCommPercent = Number(commissionPercent) || 0;
  const commissionAmount = Math.round(((grossAmount * numCommPercent) / 100) * 100) / 100;

  const numHamaliRate = Number(hamaliPerBag) || 0;
  const hamaliTotal = Math.round(numBags * numHamaliRate * 100) / 100;

  const numTulaye = Number(tulaye) || 0;
  const numOther = Number(otherDeductions) || 0;
  const numAdvance = Number(advancePaid) || 0;

  const totalDeductions = commissionAmount + hamaliTotal + numTulaye + numOther;
  const netPayable = Math.max(0, Math.round((grossAmount - totalDeductions - numAdvance) * 100) / 100);

  // Sync Rate Man -> Rate Quintal
  const handleRateManChange = (val: string) => {
    const num = val === '' ? '' : Number(val);
    setRatePerMan(num);
    if (typeof num === 'number') {
      setRatePerQuintal(rateManToQuintal(num, kgPerMan));
    } else {
      setRatePerQuintal('');
    }
  };

  // Sync Rate Quintal -> Rate Man
  const handleRateQuintalChange = (val: string) => {
    const num = val === '' ? '' : Number(val);
    setRatePerQuintal(num);
    if (typeof num === 'number') {
      setRatePerMan(rateQuintalToMan(num, kgPerMan));
    } else {
      setRatePerMan('');
    }
  };

  const handleCommoditySelect = (val: string) => {
    setCommodity(val);
    const found = DEFAULT_COMMODITIES.find((c) => c.nameHindi === val);
    if (found && ratePerMan === '') {
      setRatePerMan(found.defaultRate);
      setRatePerQuintal(rateManToQuintal(found.defaultRate, kgPerMan));
    }
  };

  const handleSubmit = (shouldOpenSlip: boolean = false) => {
    if (!partyName.trim()) {
      alert('कृपया किसान या व्यापारी का नाम भरें!');
      return;
    }
    if (netWeightKg <= 0) {
      alert('कृपया सही वजन (Kg) भरें!');
      return;
    }
    if (numRatePerMan <= 0) {
      alert('कृपया भाव प्रति मण भरें!');
      return;
    }

    const selectedCommodity = commodity === 'अन्य (Custom)' && customCommodity.trim()
      ? customCommodity.trim()
      : commodity;

    const entry: TradeEntry = {
      id: initialEntry ? initialEntry.id : `tr-${Date.now()}`,
      serialNumber: initialEntry ? initialEntry.serialNumber : `PARCHI-${Math.floor(1000 + Math.random() * 9000)}`,
      date,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      type,
      partyName: partyName.trim(),
      partyMobile: partyMobile.trim() || undefined,
      villageOrCity: villageOrCity.trim() || undefined,
      commodity: selectedCommodity,
      bags: numBags,
      grossWeightKg: numGross,
      tareWeightKg: numTare,
      netWeightKg,
      kgPerMan,
      totalMan,
      ratePerMan: numRatePerMan,
      ratePerQuintal: Number(ratePerQuintal) || rateManToQuintal(numRatePerMan, kgPerMan),
      grossAmount,
      commissionPercent: numCommPercent,
      commissionAmount,
      hamaliPerBag: numHamaliRate,
      hamaliTotal,
      tulaye: numTulaye,
      otherDeductions: numOther,
      advancePaid: numAdvance,
      netPayable,
      paymentStatus,
      notes: notes.trim() || undefined,
    };

    onSave(entry, shouldOpenSlip);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-700" />
              <span>{initialEntry ? 'व्यापार रिकॉर्ड सुधारें' : 'नया मंडी व्यापार दर्ज करें'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              आवक-जावक, वजन-मण तौल पर्ची व संपूर्ण हिसाब
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Trade Type Switcher */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setType('aavak')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold transition-all ${
                type === 'aavak'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-700" />
              <span>आवक / खरीद (Inward / Farmer)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('javak')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold transition-all ${
                type === 'javak'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-blue-700" />
              <span>जावक / बिक्री (Outward / Mill)</span>
            </button>
          </div>

          {/* Row 1: Party Details & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {type === 'aavak' ? 'किसान का नाम *' : 'खरीदार / मिल / व्यापारी का नाम *'}
              </label>
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="उदा. रमेश भाई पटेल / बालाजी एग्रो"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                तारीख (Date)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              />
            </div>
          </div>

          {/* Row 2: Mobile & Village */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                मोबाइल नंबर (Mobile)
              </label>
              <input
                type="tel"
                value={partyMobile}
                onChange={(e) => setPartyMobile(e.target.value)}
                placeholder="उदा. 98290 12345"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                गाँव / पता (Village / Town)
              </label>
              <input
                type="text"
                value={villageOrCity}
                onChange={(e) => setVillageOrCity(e.target.value)}
                placeholder="उदा. रामपुरा, तहसील"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              />
            </div>
          </div>

          {/* Row 3: Commodity (फसल / जिंस) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              फसल / जिंस चुनें (Select Commodity)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEFAULT_COMMODITIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCommoditySelect(c.nameHindi)}
                  className={`p-2 text-left rounded-lg border transition-all text-xs font-medium ${
                    commodity === c.nameHindi
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate">{c.nameHindi}</div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCommodity('अन्य (Custom)')}
                className={`p-2 text-left rounded-lg border transition-all text-xs font-medium ${
                  commodity === 'अन्य (Custom)'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                + अन्य (Other)
              </button>
            </div>
            {commodity === 'अन्य (Custom)' && (
              <input
                type="text"
                value={customCommodity}
                onChange={(e) => setCustomCommodity(e.target.value)}
                placeholder="फसल का नाम लिखें (उदा. धनिया, जीरा, इसबगोल, मैथी)"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs mt-2"
              />
            )}
          </div>

          {/* Section: Weight, Maund & Bags Calculation */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs sm:text-sm">
                <Scale className="w-4 h-4 text-emerald-700" />
                <span>तौल एवं मण गणना (Weight & Man Hisab)</span>
              </span>
              {/* Maund Standard Switcher */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-600 hidden sm:inline">मानक:</span>
                <button
                  type="button"
                  onClick={() => setKgPerMan(20)}
                  className={`px-2 py-0.5 rounded font-semibold transition-all ${
                    kgPerMan === 20
                      ? 'bg-emerald-800 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  20 kg/मण
                </button>
                <button
                  type="button"
                  onClick={() => setKgPerMan(40)}
                  className={`px-2 py-0.5 rounded font-semibold transition-all ${
                    kgPerMan === 40
                      ? 'bg-emerald-800 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  40 kg/मण
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  बोरी / कट्टा (Bags)
                </label>
                <input
                  type="number"
                  min="0"
                  value={bags}
                  onChange={(e) => setBags(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="उदा. 25"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  कुल वजन (Gross Kg) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={grossWeightKg}
                  onChange={(e) =>
                    setGrossWeightKg(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="उदा. 1025"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  बारदाना / कांटा कटौती (Tare Kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tareWeightKg}
                  onChange={(e) =>
                    setTareWeightKg(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="उदा. 25 (बोरी वजन)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-sm"
                />
              </div>
            </div>

            {/* Live Maund Result Strip */}
            <div className="bg-white p-3 rounded-lg border border-emerald-300/80 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500">शुद्ध वजन (Net Kg): </span>
                <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">
                  {netWeightKg} kg
                </span>
                <span className="text-slate-400 ml-1">
                  ({(netWeightKg / 100).toFixed(2)} क्विंटल)
                </span>
              </div>
              <div className="bg-emerald-100/70 px-3 py-1 rounded-md border border-emerald-200">
                <span className="text-emerald-900 font-medium">कुल मण: </span>
                <span className="font-mono font-bold text-emerald-900 text-sm sm:text-base">
                  {totalMan.toFixed(2)} मण
                </span>
                <span className="text-xs text-emerald-800 ml-1.5 font-medium">
                  ({maundBreakdown.formattedText})
                </span>
              </div>
            </div>
          </div>

          {/* Section: Rates per Man & Quintal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>भाव प्रति मण (Rate per Man ₹) *</span>
                <span className="text-[11px] font-normal text-emerald-700">1 मण = {kgPerMan} kg</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-mono font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ratePerMan}
                  onChange={(e) => handleRateManChange(e.target.value)}
                  placeholder="उदा. 1620"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-sm font-bold text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>भाव प्रति क्विंटल (Rate per Quintal ₹)</span>
                <span className="text-[11px] font-normal text-slate-500">100 kg</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-mono font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ratePerQuintal}
                  onChange={(e) => handleRateQuintalChange(e.target.value)}
                  placeholder="उदा. 8100"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>प्रति किलो भाव: ₹{(numRatePerMan / kgPerMan).toFixed(2)}/kg</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                कुल माल मूल्य (Gross): {formatINR(grossAmount)}
              </span>
            </div>
          </div>

          {/* Section: Mandi Deductions & Charges */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              मंडी खर्चे व कटौतियां (Deductions & Expenses)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  आढ़त / दलाली (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={commissionPercent}
                  onChange={(e) =>
                    setCommissionPercent(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  = {formatINR(commissionAmount)}
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  हमाली दर (₹/बोरी)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={hamaliPerBag}
                  onChange={(e) =>
                    setHamaliPerBag(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  = {formatINR(hamaliTotal)}
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  तुलाई / कांटा (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={tulaye}
                  onChange={(e) =>
                    setTulaye(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  अन्य खर्च (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={otherDeductions}
                  onChange={(e) =>
                    setOtherDeductions(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>
            </div>

            {/* Advance payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  रोकड़ एडवांस दिया (Advance Paid ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={advancePaid}
                  onChange={(e) =>
                    setAdvancePaid(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="0"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  भुगतान स्थिति (Payment Status)
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                >
                  <option value="pending">बाकी (Pending / Not Paid)</option>
                  <option value="paid">नकद चुकता (Paid in Full)</option>
                  <option value="partial">आंशिक भुगतान (Partially Paid)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Final Net Calculation Box */}
          <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400">
                  {type === 'aavak' ? 'किसान को शुद्ध देय राशि (Net Payable)' : 'शुद्ध प्राप्य राशि (Net Receivable)'}
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                  {formatINR(netPayable)}
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-slate-300 space-y-0.5 font-mono tabular-nums">
                <div>कुल माल: {formatINR(grossAmount)}</div>
                <div className="text-amber-400">कुल कटौती: -{formatINR(totalDeductions)}</div>
                {numAdvance > 0 && <div className="text-blue-400">एडवांस: -{formatINR(numAdvance)}</div>}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 italic">
              शब्दों में: <span className="text-slate-200">{numberToWordsHindi(netPayable)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              टिप्पणी / रिमार्क्स (Notes / Truck No. / Quality)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="उदा. बढ़िया क्वालिटी, वाहन नं. RJ-14-GA-1234"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            रद्द करें (Cancel)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors active:scale-98"
            >
              रजिस्टर में सुरक्षित करें
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors active:scale-98"
            >
              <FileText className="w-4 h-4" />
              <span>दर्ज करें व पर्ची देखें</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
