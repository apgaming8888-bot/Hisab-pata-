import React, { useState } from 'react';
import { Calculator, Scale, ArrowRight, ArrowDownUp, PlusCircle, Check } from 'lucide-react';
import { MandiSettings } from '../types/mandi';
import {
  calculateMaund,
  rateManToQuintal,
  rateQuintalToMan,
  formatINR,
  numberToWordsHindi,
} from '../utils/mandiCalculations';

interface QuickMandiCalculatorProps {
  settings: MandiSettings;
  onApplyToNewEntry: (data: {
    bags: number;
    grossKg: number;
    netKg: number;
    ratePerMan: number;
    kgPerMan: number;
  }) => void;
}

export const QuickMandiCalculator: React.FC<QuickMandiCalculatorProps> = ({
  settings,
  onApplyToNewEntry,
}) => {
  const [kgPerMan, setKgPerMan] = useState<number>(settings.defaultKgPerMan || 20);
  const [calculationMode, setCalculationMode] = useState<'weight' | 'bags'>('weight');

  // Inputs
  const [weightKg, setWeightKg] = useState<number | ''>(1250);
  const [bagsCount, setBagsCount] = useState<number | ''>(25);
  const [avgBagWeightKg, setAvgBagWeightKg] = useState<number | ''>(50);
  const [tareKg, setTareKg] = useState<number | ''>(25);

  const [ratePerMan, setRatePerMan] = useState<number | ''>(1650);
  const [ratePerQuintal, setRatePerQuintal] = useState<number | ''>(8250);

  // Commission & Hamali toggles
  const [includeCommission, setIncludeCommission] = useState(true);
  const [commissionPercent, setCommissionPercent] = useState<number>(settings.defaultCommissionPercent || 1.5);
  const [includeHamali, setIncludeHamali] = useState(true);
  const [hamaliPerBag, setHamaliPerBag] = useState<number>(settings.defaultHamaliPerBag || 6);

  // Compute effective weight
  const grossKg =
    calculationMode === 'bags'
      ? (Number(bagsCount) || 0) * (Number(avgBagWeightKg) || 0)
      : Number(weightKg) || 0;

  const numTare = Number(tareKg) || 0;
  const netKg = Math.max(0, grossKg - numTare);
  const maundBreakdown = calculateMaund(netKg, kgPerMan);
  const totalMan = maundBreakdown.totalMan;

  const numRateMan = Number(ratePerMan) || 0;
  const grossAmount = totalMan * numRateMan;

  const commAmount = includeCommission ? (grossAmount * commissionPercent) / 100 : 0;
  const effectiveBags = calculationMode === 'bags' ? Number(bagsCount) || 0 : Math.round(netKg / 50);
  const hamaliTotal = includeHamali ? effectiveBags * hamaliPerBag : 0;

  const netPayable = Math.max(0, grossAmount - commAmount - hamaliTotal);

  const handleRateManChange = (val: string) => {
    const num = val === '' ? '' : Number(val);
    setRatePerMan(num);
    if (typeof num === 'number') {
      setRatePerQuintal(rateManToQuintal(num, kgPerMan));
    } else {
      setRatePerQuintal('');
    }
  };

  const handleRateQuintalChange = (val: string) => {
    const num = val === '' ? '' : Number(val);
    setRatePerQuintal(num);
    if (typeof num === 'number') {
      setRatePerMan(rateQuintalToMan(num, kgPerMan));
    } else {
      setRatePerMan('');
    }
  };

  const handleTransferToTrade = () => {
    onApplyToNewEntry({
      bags: effectiveBags,
      grossKg,
      netKg,
      ratePerMan: numRateMan,
      kgPerMan,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>तुरंत मंडी मण व भाव कैलकुलेटर (Instant Maund & Rate Calculator)</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              मंडी तौल, मण और भाव हिसाब
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              किलो को तुरंत मण में बदलें, भाव प्रति मण से कुल रकम व क्विंटल भाव निकालें
            </p>
          </div>

          {/* Standard selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-xs font-medium text-slate-600 px-2">मानक:</span>
            <button
              onClick={() => {
                setKgPerMan(20);
                if (typeof ratePerMan === 'number') setRatePerQuintal(rateManToQuintal(ratePerMan, 20));
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                kgPerMan === 20 ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              20 kg/मण
            </button>
            <button
              onClick={() => {
                setKgPerMan(40);
                if (typeof ratePerMan === 'number') setRatePerQuintal(rateManToQuintal(ratePerMan, 40));
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                kgPerMan === 40 ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              40 kg/मण
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Inputs */}
        <div className="lg:col-span-7 space-y-5">
          {/* Mode Switcher */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                1. वजन इनपुट का तरीका चुनें
              </span>
              <div className="flex gap-1 text-xs bg-slate-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setCalculationMode('weight')}
                  className={`px-2.5 py-1 rounded-md font-semibold ${
                    calculationMode === 'weight'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  सीधा किलो में (Direct Kg)
                </button>
                <button
                  onClick={() => setCalculationMode('bags')}
                  className={`px-2.5 py-1 rounded-md font-semibold ${
                    calculationMode === 'bags'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  बोरी के हिसाब से (Bags × Avg)
                </button>
              </div>
            </div>

            {calculationMode === 'weight' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    कुल वजन (Gross Weight in Kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={weightKg}
                    onChange={(e) =>
                      setWeightKg(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="उदा. 1250"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    बारदाना कटौती (Tare Kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tareKg}
                    onChange={(e) =>
                      setTareKg(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="उदा. 25"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-base text-slate-700"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    बोरी संख्या (Bags)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bagsCount}
                    onChange={(e) =>
                      setBagsCount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="उदा. 25"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    प्रति बोरी वजन (Avg Kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={avgBagWeightKg}
                    onChange={(e) =>
                      setAvgBagWeightKg(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="उदा. 50"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    बारदाना कटौती (Kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={tareKg}
                    onChange={(e) =>
                      setTareKg(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="उदा. 25"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rate inputs */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
            <span className="text-xs font-bold text-slate-800 block">
              2. भाव (Rate) दर्ज करें
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>भाव प्रति मण (Rate/Man ₹)</span>
                  <span className="text-emerald-700 font-normal">1 मण = {kgPerMan} kg</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-mono font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ratePerMan}
                    onChange={(e) => handleRateManChange(e.target.value)}
                    placeholder="उदा. 1650"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>भाव प्रति क्विंटल (Rate/Quintal ₹)</span>
                  <span className="text-slate-400 font-normal">100 kg</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-mono font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ratePerQuintal}
                    onChange={(e) => handleRateQuintalChange(e.target.value)}
                    placeholder="उदा. 8250"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 font-mono text-base text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>प्रति किलो भाव (Per Kg): <strong>₹{(numRateMan / kgPerMan).toFixed(2)}/kg</strong></span>
              <span>1 क्विंटल = <strong>{(100 / kgPerMan).toFixed(1)} मण</strong></span>
            </div>
          </div>

          {/* Quick deductions */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
            <span className="text-xs font-bold text-slate-800 block">
              3. मंडी खर्चे (वैकल्पिक)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={includeCommission}
                  onChange={(e) => setIncludeCommission(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="flex-1 font-medium text-slate-700">आढ़त/कमीशन ({commissionPercent}%)</span>
                <span className="font-mono text-slate-500">-{formatINR(commAmount)}</span>
              </label>

              <label className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={includeHamali}
                  onChange={(e) => setIncludeHamali(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="flex-1 font-medium text-slate-700">
                  हमाली ({effectiveBags} बोरी @ ₹{hamaliPerBag})
                </span>
                <span className="font-mono text-slate-500">-{formatINR(hamaliTotal)}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Live Calculated Output */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-5 sticky top-20">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
                परिणाम (Live Calculation)
              </span>
              <span className="text-xs text-slate-400 font-mono">1 मण = {kgPerMan} kg</span>
            </div>

            {/* Maund result */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400">कुल शुद्ध वजन व मण:</span>
              <div className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">
                {totalMan.toFixed(2)} मण
              </div>
              <div className="text-xs font-mono text-slate-300">
                शुद्ध वजन: <strong>{netKg} kg</strong> ({maundBreakdown.formattedText})
              </div>
            </div>

            {/* Rate & Gross */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>कुल मण:</span>
                <span>{totalMan.toFixed(2)} मण</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>भाव प्रति मण:</span>
                <span>₹{numRateMan}/मण</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>कुल माल मूल्य (Gross):</span>
                <span className="font-bold text-white">{formatINR(grossAmount)}</span>
              </div>
              {(commAmount > 0 || hamaliTotal > 0) && (
                <div className="flex justify-between text-amber-400">
                  <span>कुल मंडी कटौती:</span>
                  <span>-{formatINR(commAmount + hamaliTotal)}</span>
                </div>
              )}
            </div>

            {/* Net Amount */}
            <div className="pt-3 border-t-2 border-slate-700">
              <span className="text-xs text-slate-400 block mb-1">
                शुद्ध देय राशि (Net Amount):
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
                {formatINR(netPayable)}
              </div>
              <p className="text-[11px] text-slate-300 mt-1 italic">
                {numberToWordsHindi(netPayable)}
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={handleTransferToTrade}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>इसे नए व्यापार में जोड़ें (+ Save Trade)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
