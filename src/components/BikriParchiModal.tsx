import React from 'react';
import { X, Printer, Share2, Check, Download } from 'lucide-react';
import { MandiSettings, TradeEntry } from '../types/mandi';
import { formatINR, formatKg, numberToWordsHindi, calculateMaund } from '../utils/mandiCalculations';

interface BikriParchiModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TradeEntry | null;
  settings: MandiSettings;
}

export const BikriParchiModal: React.FC<BikriParchiModalProps> = ({
  isOpen,
  onClose,
  entry,
  settings,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !entry) return null;

  const maundBreakdown = calculateMaund(entry.netWeightKg, entry.kgPerMan);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*मंडी तौल व बिक्री पर्ची (Mandi Parchi)*
🏢 *${settings.firmName}*
📍 ${settings.mandiName}
📞 ${settings.mobile}
-------------------------
पर्ची नं: ${entry.serialNumber}
तारीख: ${entry.date} ${entry.time || ''}
किसान/पार्टी: *${entry.partyName}* ${entry.villageOrCity ? `(${entry.villageOrCity})` : ''}
फसल (जिंस): *${entry.commodity}*
बोरी (कट्टा): ${entry.bags}
कुल वजन: ${entry.grossWeightKg} kg
कटौती (बारदाना): ${entry.tareWeightKg} kg
शुद्ध वजन: *${entry.netWeightKg} kg*
कुल मण: *${entry.totalMan.toFixed(2)} मण* (@${entry.kgPerMan}kg/मण)
भाव प्रति मण: *₹${entry.ratePerMan}*
कुल माल मूल्य: ${formatINR(entry.grossAmount)}
कमीशन/आढ़त: -${formatINR(entry.commissionAmount)}
हमाली: -${formatINR(entry.hamaliTotal)}
तुलाई/अन्य: -${formatINR(entry.tulaye + (entry.otherDeductions || 0))}
${entry.advancePaid > 0 ? `रोकड़ एडवांस: -${formatINR(entry.advancePaid)}\n` : ''}-------------------------
*शुद्ध देय राशि: ${formatINR(entry.netPayable)}*
(${numberToWordsHindi(entry.netPayable)})
-------------------------
धन्यवाद! शुभ व्यापार!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    // Open WhatsApp Web/App
    const encoded = encodeURIComponent(text);
    const url = entry.partyMobile
      ? `https://wa.me/91${entry.partyMobile.replace(/\D/g, '')}?text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print-backdrop">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top bar controls (hidden in print) */}
        <div className="p-3 sm:p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">
              मंडी तौल व बिक्री पर्ची (Bill Slip)
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
              {entry.serialNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'कॉपी हुआ!' : 'व्हाट्सएप भेजें'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट करें (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Slip Container */}
        <div className="p-5 sm:p-8 overflow-y-auto bg-white text-slate-900" id="printable-slip">
          {/* Slip Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3">
            <div className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase">
              ।। श्री गणेशाय नमः ।।
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-0.5">
              {settings.firmName}
            </h1>
            <p className="text-xs font-medium text-slate-700">{settings.tagline}</p>
            <p className="text-[11px] text-slate-600">
              {settings.mandiName} · {settings.address}
            </p>
            <div className="mt-1 flex items-center justify-center gap-3 text-[11px] font-mono text-slate-600">
              <span>फोन: {settings.mobile}</span>
              <span>·</span>
              <span>लाइसेंस नं: {settings.gstOrLicenseNo || 'MND-APMC-9901'}</span>
            </div>
          </div>

          {/* Slip Title & Serial/Date */}
          <div className="my-3 flex items-center justify-between text-xs border-b border-slate-200 pb-2">
            <div>
              <span className="font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">
                {entry.type === 'aavak' ? 'किसान बिक्री पर्ची (कच्ची तौल)' : 'व्यापारी बिक्री बीजक'}
              </span>
            </div>
            <div className="text-right font-mono text-[11px]">
              <div><strong>पर्ची क्र.:</strong> {entry.serialNumber}</div>
              <div><strong>तारीख:</strong> {entry.date} {entry.time || ''}</div>
            </div>
          </div>

          {/* Party Details */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">
                  {entry.type === 'aavak' ? 'किसान का नाम:' : 'खरीदार/पार्टी:'}
                </span>{' '}
                <strong className="text-slate-900 text-sm">{entry.partyName}</strong>
              </div>
              <div>
                <span className="text-slate-500">गाँव/स्थान:</span>{' '}
                <strong>{entry.villageOrCity || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-500">मोबाइल:</span>{' '}
                <strong className="font-mono">{entry.partyMobile || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-500">जिंस (फसल):</span>{' '}
                <strong className="text-emerald-800">{entry.commodity}</strong>
              </div>
            </div>
          </div>

          {/* Weight & Maund Table */}
          <table className="w-full text-xs border-collapse border border-slate-300 mb-3">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                <th className="p-1.5 text-left border-r border-slate-300">विवरण</th>
                <th className="p-1.5 text-center border-r border-slate-300">बोरी</th>
                <th className="p-1.5 text-right border-r border-slate-300">कुल वजन</th>
                <th className="p-1.5 text-right border-r border-slate-300">कटौती</th>
                <th className="p-1.5 text-right border-r border-slate-300">शुद्ध वजन</th>
                <th className="p-1.5 text-right bg-emerald-50">कुल मण</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 font-mono">
                <td className="p-1.5 font-sans font-semibold text-slate-800 border-r border-slate-300">
                  {entry.commodity}
                </td>
                <td className="p-1.5 text-center border-r border-slate-300">{entry.bags}</td>
                <td className="p-1.5 text-right border-r border-slate-300">{entry.grossWeightKg} kg</td>
                <td className="p-1.5 text-right text-red-600 border-r border-slate-300">
                  -{entry.tareWeightKg} kg
                </td>
                <td className="p-1.5 text-right font-bold text-slate-900 border-r border-slate-300">
                  {entry.netWeightKg} kg
                </td>
                <td className="p-1.5 text-right font-bold text-emerald-900 bg-emerald-50">
                  {entry.totalMan.toFixed(2)} मण
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-[11px] text-slate-600 mb-4 flex items-center justify-between font-mono">
            <span>मानक: 1 मण = {entry.kgPerMan} किलो</span>
            <span>तौल विवरण: {maundBreakdown.formattedText}</span>
          </div>

          {/* Financial Calculation breakdown */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs mb-4">
            <div className="bg-slate-100 px-3 py-1.5 font-bold border-b border-slate-300 flex justify-between">
              <span>हिसाब विवरण (Calculation)</span>
              <span>रकम (₹)</span>
            </div>
            <div className="p-3 space-y-1.5 font-mono">
              <div className="flex justify-between font-sans">
                <span>
                  माल मूल्य: {entry.totalMan.toFixed(2)} मण × ₹{entry.ratePerMan}/मण
                  <span className="text-[11px] text-slate-500 font-mono ml-2">
                    (₹{entry.ratePerQuintal}/क्विंटल)
                  </span>
                </span>
                <span className="font-bold">{formatINR(entry.grossAmount)}</span>
              </div>

              {entry.commissionAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>- आढ़त / कमीशन ({entry.commissionPercent}%):</span>
                  <span>-{formatINR(entry.commissionAmount)}</span>
                </div>
              )}

              {entry.hamaliTotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>- हमाली ({entry.bags} बोरी @ ₹{entry.hamaliPerBag}):</span>
                  <span>-{formatINR(entry.hamaliTotal)}</span>
                </div>
              )}

              {entry.tulaye > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>- कांटा तुलाई:</span>
                  <span>-{formatINR(entry.tulaye)}</span>
                </div>
              )}

              {entry.otherDeductions > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>- अन्य कटौती:</span>
                  <span>-{formatINR(entry.otherDeductions)}</span>
                </div>
              )}

              {entry.advancePaid > 0 && (
                <div className="flex justify-between text-blue-700 font-medium">
                  <span>- रोकड़ एडवांस पूर्व में दिया:</span>
                  <span>-{formatINR(entry.advancePaid)}</span>
                </div>
              )}

              {/* Net Payable Highlight */}
              <div className="border-t-2 border-slate-900 pt-2 mt-2 flex justify-between text-sm sm:text-base font-bold text-slate-900">
                <span>शुद्ध देय राशि (Net Payable):</span>
                <span className="text-emerald-800">{formatINR(entry.netPayable)}</span>
              </div>
            </div>
          </div>

          {/* Amount in Hindi words */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs mb-6 font-medium text-slate-800">
            <strong>अक्षरे रुपये:</strong> {numberToWordsHindi(entry.netPayable)}
          </div>

          {/* Signature Areas */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-700">
            <div>
              <div className="border-t border-dashed border-slate-400 w-36 mx-auto pt-1 font-semibold">
                हस्ताक्षर किसान / प्राप्तकर्ता
              </div>
            </div>
            <div>
              <div className="border-t border-dashed border-slate-400 w-36 mx-auto pt-1 font-semibold">
                कृते {settings.firmName}
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">(अधिकृत हस्ताक्षर)</div>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 mt-6 border-t border-slate-200 pt-2 no-print">
            सॉफ्टवेयर: MandiBahi - मंडी व्यापार व मण हिसाब प्रणाली
          </div>
        </div>
      </div>
    </div>
  );
};
