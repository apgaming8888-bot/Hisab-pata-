import React, { useState, useMemo } from 'react';
import { Search, UserCheck, Plus, ArrowUpRight, ArrowDownLeft, FileText, Share2, Wallet } from 'lucide-react';
import { MandiSettings, TradeEntry, PaymentRecord } from '../types/mandi';
import { formatINR, formatKg } from '../utils/mandiCalculations';

interface PartyLedgerProps {
  entries: TradeEntry[];
  settings: MandiSettings;
  onSelectEntryForSlip: (entry: TradeEntry) => void;
  payments: PaymentRecord[];
  onAddPayment: (payment: PaymentRecord) => void;
}

export const PartyLedger: React.FC<PartyLedgerProps> = ({
  entries,
  settings,
  onSelectEntryForSlip,
  payments,
  onAddPayment,
}) => {
  const [search, setSearch] = useState('');
  const [selectedPartyName, setSelectedPartyName] = useState<string | null>(null);

  // Payment record modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMode, setPayMode] = useState<'cash' | 'upi' | 'bank_transfer' | 'cheque'>('cash');
  const [payType, setPayType] = useState<'paid' | 'received'>('paid');
  const [payNotes, setPayNotes] = useState('');

  // Group entries by party
  const partyAccounts = useMemo(() => {
    const map = new Map<string, {
      name: string;
      mobile?: string;
      villageOrCity?: string;
      totalEntries: number;
      totalBags: number;
      totalNetKg: number;
      totalMan: number;
      totalTradeAmount: number;
      netPayableTotal: number;
      paidAmount: number;
      balanceDue: number;
      lastDate: string;
      entries: TradeEntry[];
    }>();

    entries.forEach((e) => {
      const key = e.partyName.trim();
      let record = map.get(key);
      if (!record) {
        record = {
          name: key,
          mobile: e.partyMobile,
          villageOrCity: e.villageOrCity,
          totalEntries: 0,
          totalBags: 0,
          totalNetKg: 0,
          totalMan: 0,
          totalTradeAmount: 0,
          netPayableTotal: 0,
          paidAmount: 0,
          balanceDue: 0,
          lastDate: e.date,
          entries: [],
        };
        map.set(key, record);
      }

      record.totalEntries += 1;
      record.totalBags += e.bags;
      record.totalNetKg += e.netWeightKg;
      record.totalMan += e.totalMan;
      record.totalTradeAmount += e.grossAmount;
      record.netPayableTotal += e.netPayable;
      if (e.paymentStatus === 'paid') {
        record.paidAmount += e.netPayable;
      } else if (e.paymentStatus === 'partial') {
        record.paidAmount += e.advancePaid || 0;
      }
      if (e.date > record.lastDate) {
        record.lastDate = e.date;
      }
      record.entries.push(e);
    });

    // Add extra recorded payments
    payments.forEach((p) => {
      const record = map.get(p.partyName.trim());
      if (record) {
        if (p.type === 'paid') {
          record.paidAmount += p.amount;
        } else {
          record.paidAmount -= p.amount;
        }
      }
    });

    // Compute balance
    map.forEach((rec) => {
      rec.balanceDue = Math.max(0, rec.netPayableTotal - rec.paidAmount);
    });

    return Array.from(map.values()).sort((a, b) => b.balanceDue - a.balanceDue);
  }, [entries, payments]);

  const filteredParties = partyAccounts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.mobile || '').includes(q) ||
      (p.villageOrCity || '').toLowerCase().includes(q)
    );
  });

  const selectedParty = selectedPartyName
    ? partyAccounts.find((p) => p.name === selectedPartyName) || null
    : null;

  const handleOpenPaymentModal = (partyName: string) => {
    setSelectedPartyName(partyName);
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = () => {
    if (!selectedPartyName || !payAmount || Number(payAmount) <= 0) {
      alert('कृपया सही राशि भरें!');
      return;
    }

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      partyName: selectedPartyName,
      amount: Number(payAmount),
      mode: payMode,
      type: payType,
      notes: payNotes.trim() || undefined,
    };

    onAddPayment(newPayment);
    setIsPaymentModalOpen(false);
    setPayAmount('');
    setPayNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              किसान व व्यापारी खाताबही (Party Accounts Ledger)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्येक किसान और व्यापारी का कुल माल, मण, चुकाया गया भुगतान और शेष बाकी
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="किसान का नाम खोजें..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parties List (Left 5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <span className="text-xs font-bold text-slate-700">
                कुल खाते ({filteredParties.length})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                बाकीदार पहले
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredParties.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  कोई खाता नहीं मिला
                </div>
              ) : (
                filteredParties.map((p) => {
                  const isSelected = selectedPartyName === p.name;
                  return (
                    <div
                      key={p.name}
                      onClick={() => setSelectedPartyName(p.name)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-700' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {p.villageOrCity ? `${p.villageOrCity} · ` : ''}
                            {p.mobile || 'फोन नहीं'}
                          </div>
                        </div>

                        <div className="text-right font-mono tabular-nums">
                          <div
                            className={`text-xs sm:text-sm font-bold ${
                              p.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                          >
                            {p.balanceDue > 0 ? `बाकी: ${formatINR(p.balanceDue)}` : 'पूर्ण चुकता'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            कुल: {formatINR(p.totalTradeAmount)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1.5 border-t border-slate-100">
                        <span>{p.totalEntries} सौदे · {p.totalBags} बोरी</span>
                        <span>{p.totalMan.toFixed(1)} मण ({formatKg(p.totalNetKg)})</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Party Details View (Right 7 cols) */}
        <div className="lg:col-span-7">
          {selectedParty ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-5">
              {/* Party Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedParty.name}</h2>
                    {selectedParty.villageOrCity && (
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {selectedParty.villageOrCity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    मोबाइल: {selectedParty.mobile || '—'} · अंतिम सौदा: {selectedParty.lastDate}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenPaymentModal(selectedParty.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors self-start sm:self-center"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>भुगतान दर्ज करें (+ Pay)</span>
                </button>
              </div>

              {/* Account Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">कुल व्यापार</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {formatINR(selectedParty.totalTradeAmount)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">कुल मण व वजन</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedParty.totalMan.toFixed(1)} मण
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">चुकाया गया</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {formatINR(selectedParty.paidAmount)}
                  </span>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-amber-800 block text-[11px] font-semibold">शेष बाकी राशि</span>
                  <span className="font-mono font-bold text-amber-900 text-sm">
                    {formatINR(selectedParty.balanceDue)}
                  </span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  व्यापार सौदे व तौल पर्चियां
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                  {selectedParty.entries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => onSelectEntryForSlip(entry)}
                      className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            {entry.serialNumber}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600">{entry.date}</span>
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
                            {entry.commodity}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {entry.bags} बोरी · {entry.netWeightKg} kg = {entry.totalMan.toFixed(2)} मण @ ₹{entry.ratePerMan}/मण
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">
                          {formatINR(entry.netPayable)}
                        </div>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                            entry.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {entry.paymentStatus === 'paid' ? 'चुकता' : 'बाकी'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 shadow-2xs">
              <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs sm:text-sm font-medium">
                बाईं ओर से किसी भी किसान या व्यापारी के खाते पर क्लिक करें
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Entry Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-700" />
              <span>भुगतान दर्ज करें - {selectedPartyName}</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                भुगतान का प्रकार
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPayType('paid')}
                  className={`py-2 rounded-lg font-bold border transition-all ${
                    payType === 'paid'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  रकम दी (Payment Paid)
                </button>
                <button
                  type="button"
                  onClick={() => setPayType('received')}
                  className={`py-2 rounded-lg font-bold border transition-all ${
                    payType === 'received'
                      ? 'bg-blue-50 border-blue-600 text-blue-900'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  रकम प्राप्त की (Received)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                रकम (Amount ₹) *
              </label>
              <input
                type="number"
                min="1"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="उदा. 25000"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold text-slate-900"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                भुगतान माध्यम (Mode)
              </label>
              <select
                value={payMode}
                onChange={(e) => setPayMode(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
              >
                <option value="cash">नकद रोकड़ (Cash)</option>
                <option value="upi">ऑनलाइन UPI (GPay/PhonePe/Paytm)</option>
                <option value="bank_transfer">बैंक ट्रांसफर (NEFT/RTGS/IMPS)</option>
                <option value="cheque">चेक (Cheque)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                टिप्पणी / रिमार्क्स
              </label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="उदा. खाता चुकता, यूटीआर नंबर"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleSavePayment}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
              >
                सुरक्षित करें (Save)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
