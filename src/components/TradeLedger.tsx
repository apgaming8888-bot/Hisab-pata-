import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  FileText,
  Trash2,
  Edit2,
  Share2,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { MandiSettings, TradeEntry, TradeType, PaymentStatus } from '../types/mandi';
import { formatINR, formatKg } from '../utils/mandiCalculations';

interface TradeLedgerProps {
  entries: TradeEntry[];
  settings: MandiSettings;
  onOpenNewEntry: () => void;
  onSelectEntryForSlip: (entry: TradeEntry) => void;
  onEditEntry: (entry: TradeEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const TradeLedger: React.FC<TradeLedgerProps> = ({
  entries,
  settings,
  onOpenNewEntry,
  onSelectEntryForSlip,
  onEditEntry,
  onDeleteEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'month'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | TradeType>('all');
  const [commodityFilter, setCommodityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  // Unique commodities for filter dropdown
  const uniqueCommodities = useMemo(() => {
    return Array.from(new Set(entries.map((e) => e.commodity)));
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = e.partyName.toLowerCase().includes(q);
        const matchMobile = (e.partyMobile || '').includes(q);
        const matchSerial = e.serialNumber.toLowerCase().includes(q);
        const matchVillage = (e.villageOrCity || '').toLowerCase().includes(q);
        const matchCommodity = e.commodity.toLowerCase().includes(q);
        if (!matchName && !matchMobile && !matchSerial && !matchVillage && !matchCommodity) {
          return false;
        }
      }

      // Date filter
      if (dateFilter === 'today' && e.date !== todayStr) return false;
      if (dateFilter === 'yesterday' && e.date !== yesterdayStr) return false;
      if (dateFilter === 'month' && !e.date.startsWith(currentMonthStr)) return false;

      // Type filter
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;

      // Commodity filter
      if (commodityFilter !== 'all' && e.commodity !== commodityFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && e.paymentStatus !== statusFilter) return false;

      return true;
    });
  }, [entries, searchQuery, dateFilter, typeFilter, commodityFilter, statusFilter, todayStr, yesterdayStr, currentMonthStr]);

  // Totals of filtered entries
  const totalBags = filteredEntries.reduce((sum, e) => sum + e.bags, 0);
  const totalNetKg = filteredEntries.reduce((sum, e) => sum + e.netWeightKg, 0);
  const totalMan = filteredEntries.reduce((sum, e) => sum + e.totalMan, 0);
  const totalGrossAmount = filteredEntries.reduce((sum, e) => sum + e.grossAmount, 0);
  const totalNetPayable = filteredEntries.reduce((sum, e) => sum + e.netPayable, 0);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      alert('कोई रिकॉर्ड उपलब्ध नहीं है!');
      return;
    }

    const headers = [
      'Parchi No',
      'Date',
      'Type',
      'Party Name',
      'Mobile',
      'Village',
      'Commodity',
      'Bags',
      'Gross Kg',
      'Tare Kg',
      'Net Kg',
      'Kg Per Man',
      'Total Man',
      'Rate Per Man',
      'Gross Amount',
      'Commission',
      'Hamali',
      'Net Payable',
      'Status',
    ];

    const rows = filteredEntries.map((e) => [
      e.serialNumber,
      e.date,
      e.type === 'aavak' ? 'Aavak (Purchase)' : 'Javak (Sale)',
      `"${e.partyName}"`,
      e.partyMobile || '',
      `"${e.villageOrCity || ''}"`,
      `"${e.commodity}"`,
      e.bags,
      e.grossWeightKg,
      e.tareWeightKg,
      e.netWeightKg,
      e.kgPerMan,
      e.totalMan.toFixed(2),
      e.ratePerMan,
      e.grossAmount,
      e.commissionAmount,
      e.hamaliTotal,
      e.netPayable,
      e.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mandi_Vyapar_Ledger_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              मंडी व्यापार बही (Daily Trade Register)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              सभी आवक-जावक सौदे, वजन, मण, भाव और भुगतान विवरण
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV डाउनलोड</span>
            </button>
            <button
              onClick={onOpenNewEntry}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ नया व्यापार जोड़ें</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाम, फोन, पर्ची क्र. खोजें..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="all">तारीख: सभी (All Dates)</option>
              <option value="today">आज का व्यापार (Today)</option>
              <option value="yesterday">कल का व्यापार (Yesterday)</option>
              <option value="month">इस महीने का व्यापार (This Month)</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="all">प्रकार: सभी (आवक व जावक)</option>
              <option value="aavak">आवक / खरीद (Farmer)</option>
              <option value="javak">जावक / बिक्री (Buyer/Mill)</option>
            </select>
          </div>

          {/* Commodity Filter */}
          <div>
            <select
              value={commodityFilter}
              onChange={(e) => setCommodityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="all">जिंस: सभी फसलें (All Crops)</option>
              {uniqueCommodities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="all">भुगतान: सभी स्थितियां</option>
              <option value="paid">चुकता (Paid in Full)</option>
              <option value="pending">बाकी (Pending)</option>
              <option value="partial">आंशिक (Partial)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3">पर्ची व तारीख</th>
                <th className="py-3 px-3">प्रकार</th>
                <th className="py-3 px-3">किसान / पार्टी</th>
                <th className="py-3 px-3">फसल</th>
                <th className="py-3 px-3 text-center">बोरी</th>
                <th className="py-3 px-3 text-right">शुद्ध वजन</th>
                <th className="py-3 px-3 text-right bg-emerald-50/50">कुल मण</th>
                <th className="py-3 px-3 text-right">भाव/मण</th>
                <th className="py-3 px-3 text-right">कुल रकम</th>
                <th className="py-3 px-3 text-right">शुद्ध देय</th>
                <th className="py-3 px-3 text-center">स्थिति</th>
                <th className="py-3 px-3 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    कोई व्यापार रिकॉर्ड नहीं मिला। नया व्यापार दर्ज करने के लिए "+ नया व्यापार जोड़ें" पर क्लिक करें।
                  </td>
                </tr>
              ) : (
                filteredEntries.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => onSelectEntryForSlip(e)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">{e.serialNumber}</div>
                      <div className="text-[11px] text-slate-500">{e.date}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                          e.type === 'aavak'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-blue-50 text-blue-800'
                        }`}
                      >
                        {e.type === 'aavak' ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                            <span>आवक</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-blue-600" />
                            <span>जावक</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{e.partyName}</div>
                      <div className="text-[11px] text-slate-500">
                        {e.villageOrCity ? `${e.villageOrCity} · ` : ''}
                        {e.partyMobile || ''}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                      {e.commodity}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                      {e.bags}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {e.netWeightKg} kg
                      <span className="block text-[10px] text-slate-400 font-normal">
                        कांटा: -{e.tareWeightKg}kg
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-900 bg-emerald-50/40 whitespace-nowrap">
                      {e.totalMan.toFixed(2)} मण
                      <span className="block text-[10px] text-emerald-700 font-normal">
                        (@{e.kgPerMan}kg)
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                      ₹{e.ratePerMan}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        (₹{e.ratePerQuintal}/q)
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatINR(e.grossAmount)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {formatINR(e.netPayable)}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          e.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : e.paymentStatus === 'partial'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {e.paymentStatus === 'paid'
                          ? 'चुकता'
                          : e.paymentStatus === 'partial'
                          ? 'आंशिक'
                          : 'बाकी'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(evt) => evt.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectEntryForSlip(e)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                          title="बिक्री पर्ची देखें व प्रिंट करें"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditEntry(e)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="सुधारें (Edit)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`क्या आप ${e.partyName} की पर्ची ${e.serialNumber} हटाना चाहते हैं?`)) {
                              onDeleteEntry(e.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="हटाएं (Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer with Filtered Totals */}
            {filteredEntries.length > 0 && (
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-semibold text-slate-800">
                <tr>
                  <td colSpan={4} className="py-3 px-3 font-bold">
                    कुल योग ({filteredEntries.length} सौदे):
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                    {totalBags}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatKg(totalNetKg)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-900 bg-emerald-100/60">
                    {totalMan.toFixed(2)} मण
                  </td>
                  <td className="py-3 px-3 text-right font-mono">—</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatINR(totalGrossAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">
                    {formatINR(totalNetPayable)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
