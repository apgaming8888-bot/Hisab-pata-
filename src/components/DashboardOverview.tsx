import React from 'react';
import {
  TrendingUp,
  Scale,
  Package,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Calculator,
  FileText,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { MandiSettings, TradeEntry } from '../types/mandi';
import { formatINR, formatKg } from '../utils/mandiCalculations';

interface DashboardOverviewProps {
  entries: TradeEntry[];
  settings: MandiSettings;
  onOpenNewEntry: () => void;
  onSelectEntryForSlip: (entry: TradeEntry) => void;
  onNavigateTab: (tab: 'dashboard' | 'ledger' | 'calculator' | 'parties') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  entries,
  settings,
  onOpenNewEntry,
  onSelectEntryForSlip,
  onNavigateTab,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter today's entries
  const todayEntries = entries.filter((e) => e.date === todayStr);
  const activeEntries = todayEntries.length > 0 ? todayEntries : entries;
  const isShowingToday = todayEntries.length > 0;

  // Aggregate stats
  const totalVyaparAmount = activeEntries.reduce((sum, e) => sum + e.grossAmount, 0);
  const totalNetKg = activeEntries.reduce((sum, e) => sum + e.netWeightKg, 0);
  const totalMan = activeEntries.reduce((sum, e) => sum + e.totalMan, 0);
  const totalBags = activeEntries.reduce((sum, e) => sum + e.bags, 0);
  const totalCommission = activeEntries.reduce((sum, e) => sum + e.commissionAmount, 0);

  // Pending payments
  const totalPendingPayable = entries
    .filter((e) => e.paymentStatus === 'pending' || e.paymentStatus === 'partial')
    .reduce((sum, e) => sum + e.netPayable, 0);

  // Commodity breakdown
  const commodityMap: Record<string, { weightKg: number; man: number; amount: number; bags: number; count: number }> = {};
  entries.forEach((e) => {
    if (!commodityMap[e.commodity]) {
      commodityMap[e.commodity] = { weightKg: 0, man: 0, amount: 0, bags: 0, count: 0 };
    }
    commodityMap[e.commodity].weightKg += e.netWeightKg;
    commodityMap[e.commodity].man += e.totalMan;
    commodityMap[e.commodity].amount += e.grossAmount;
    commodityMap[e.commodity].bags += e.bags;
    commodityMap[e.commodity].count += 1;
  });

  const commodityList = Object.entries(commodityMap).sort((a, b) => b[1].amount - a[1].amount);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Mandi Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
              <span>{settings.mandiName}</span>
              <span aria-hidden="true">·</span>
              <span>लाइसेंस: {settings.gstOrLicenseNo || 'MND-REG'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {settings.firmName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {settings.tagline} · संचालक: {settings.proprietor}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => onNavigateTab('calculator')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              <span>मण भाव कैल्क</span>
            </button>
            <button
              onClick={onOpenNewEntry}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs transition-colors"
            >
              <span>+ आवक दर्ज करें</span>
            </button>
          </div>
        </div>

        {/* Status ticker bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              {isShowingToday ? "आज का व्यापार (Today's Trade)" : "समस्त व्यापार सारांश"}
            </span>
            <span aria-hidden="true">·</span>
            <span>तारीख: {new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>मण मानक:</span>
            <span className="font-semibold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              1 मण = {settings.defaultKgPerMan} किलो ({settings.defaultKgPerMan === 20 ? 'गुजरात/मालवा' : 'उत्तर भारत'})
            </span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Vyapar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">कुल व्यापार राशि (Total Turnover)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatINR(totalVyaparAmount)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="font-medium text-emerald-700">{activeEntries.length} सौदे</span>
            <span>·</span>
            <span>{isShowingToday ? 'आज का कुल लेन-देन' : 'सभी रिकॉर्ड'}</span>
          </div>
        </div>

        {/* Card 2: Total Weight & Maund */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">कुल वजन व मण (Weight & Man)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalMan.toFixed(2)} <span className="text-sm font-semibold text-slate-600">मण</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-mono tabular-nums">
            <span>शुद्ध: {formatKg(totalNetKg)}</span>
            <span>·</span>
            <span>{(totalNetKg / 100).toFixed(1)} क्विंटल</span>
          </div>
        </div>

        {/* Card 3: Total Bags / Boriyan */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">कुल बोरियां (Bags / Katta)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalBags.toLocaleString('en-IN')} <span className="text-sm font-semibold text-slate-600">बोरी</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>हमाली दर: ₹{settings.defaultHamaliPerBag}/बोरी</span>
            <span>·</span>
            <span>आवक लॉट</span>
          </div>
        </div>

        {/* Card 4: Commission / Mandi Income */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">आढ़त व कमीशन (Commission)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatINR(totalCommission)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>बकाया भुगतान:</span>
            <span className="font-mono font-medium text-amber-700">{formatINR(totalPendingPayable)}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Recent Mandi Entries & Commodity Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent Mandi Lots */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                हालिया मंडी आवक-जावक (Recent Trade Lots)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                नवीनतम तौल पर्ची व किसान हिसाब
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('ledger')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>पूरी बही देखें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {entries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                onClick={() => onSelectEntryForSlip(entry)}
                className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      entry.type === 'aavak'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {entry.type === 'aavak' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{entry.partyName}</span>
                      {entry.villageOrCity && (
                        <span className="text-xs text-slate-500 font-normal">
                          ({entry.villageOrCity})
                        </span>
                      )}
                      <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {entry.commodity}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                      <span>{entry.bags} बोरी</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums font-medium text-slate-700">
                        {entry.netWeightKg} kg = {entry.totalMan.toFixed(2)} मण
                      </span>
                      <span>·</span>
                      <span className="font-mono font-medium text-slate-700">
                        भाव: ₹{entry.ratePerMan}/मण
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                    {formatINR(entry.grossAmount)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        entry.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : entry.paymentStatus === 'partial'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {entry.paymentStatus === 'paid'
                        ? 'चुक्ता (Paid)'
                        : entry.paymentStatus === 'partial'
                        ? 'आंशिक (Partial)'
                        : 'बाकी (Pending)'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEntryForSlip(entry);
                      }}
                      className="text-xs text-slate-500 hover:text-emerald-700 p-1"
                      title="बिक्री पर्ची देखें"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigateTab('ledger')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              सभी {entries.length} सौदे व तौल पर्चियां देखें →
            </button>
          </div>
        </div>

        {/* Right 1 col: Commodity (Fasal) Share & Quick Tools */}
        <div className="space-y-6">
          {/* Fasal wise share */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              फसलवार व्यापार (Commodity Breakdown)
            </h2>
            <div className="space-y-3">
              {commodityList.map(([name, data]) => {
                const percent = totalVyaparAmount > 0 ? (data.amount / totalVyaparAmount) * 100 : 0;
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{name}</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900">
                        {formatINR(data.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                      <span>{data.bags} बोरी ({formatKg(data.weightKg)})</span>
                      <span>{data.man.toFixed(1)} मण ({percent.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Mandi Formula Card */}
          <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-4 text-xs space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>मंडी हिसाब फॉर्मूला (Mandi Calculation)</span>
            </div>
            <div className="space-y-1 text-emerald-800">
              <p>• <strong>मण (Man):</strong> शुद्ध वजन (Kg) ÷ {settings.defaultKgPerMan} = कुल मण</p>
              <p>• <strong>कुल भाव:</strong> कुल मण × भाव प्रति मण</p>
              <p>• <strong>क्विंटल भाव:</strong> 1 क्विंटल (100 kg) = {100 / settings.defaultKgPerMan} मण</p>
              <p>• <strong>शुद्ध देय:</strong> कुल राशि - (आढ़त + हमाली + तुलाई + रोकड़)</p>
            </div>
            <button
              onClick={() => onNavigateTab('calculator')}
              className="mt-2 w-full py-1.5 bg-white border border-emerald-300 rounded-lg text-emerald-800 font-semibold text-center hover:bg-emerald-50 transition-colors shadow-2xs"
            >
              लाइव कैलकुलेटर खोलें →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
