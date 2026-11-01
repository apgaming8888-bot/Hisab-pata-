import React, { useState } from 'react';
import { X, Save, RefreshCw, Download, Upload, Check } from 'lucide-react';
import { MandiSettings } from '../types/mandi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MandiSettings;
  onSaveSettings: (settings: MandiSettings) => void;
  onExportAllData: () => void;
  onImportAllData: (jsonData: string) => void;
  onResetSampleData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportAllData,
  onImportAllData,
  onResetSampleData,
}) => {
  const [formData, setFormData] = useState<MandiSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportAllData(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              मंडी व फर्म सेटिंग्स (Settings)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              फर्म का नाम, मण मानक (20kg / 40kg) व डिफॉल्ट कमीशन दरें
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Firm Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                फर्म / दुकान का नाम (Firm Name) *
              </label>
              <input
                type="text"
                value={formData.firmName}
                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                टैगलाइन (Tagline / विवरण)
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                संचालक / मालिक का नाम (Proprietor)
              </label>
              <input
                type="text"
                value={formData.proprietor}
                onChange={(e) => setFormData({ ...formData, proprietor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Mandi Committee & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                मंडी समिति का नाम (Mandi Name)
              </label>
              <input
                type="text"
                value={formData.mandiName}
                onChange={(e) => setFormData({ ...formData, mandiName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                मोबाइल नंबर (Contact Phone)
              </label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>

          {/* License & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                लाइसेंस / जीएसटी क्र. (License / GST)
              </label>
              <input
                type="text"
                value={formData.gstOrLicenseNo || ''}
                onChange={(e) => setFormData({ ...formData, gstOrLicenseNo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                दुकान नं. व पता (Address)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Maund Standard Switcher (Key Setting) */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
            <label className="block text-xs font-bold text-emerald-950">
              1 मण (Maund) का मानक वजन चुनें:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, defaultKgPerMan: 20 })}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  formData.defaultKgPerMan === 20
                    ? 'bg-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-100/40 border-emerald-200 text-slate-600'
                }`}
              >
                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  1 मण = 20 किलो (20 kg)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  गुजरात, मालवा, कपास, तिलहन व पश्चिमी भारत मानक
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, defaultKgPerMan: 40 })}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  formData.defaultKgPerMan === 40
                    ? 'bg-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-100/40 border-emerald-200 text-slate-600'
                }`}
              >
                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  1 मण = 40 किलो (40 kg)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  पंजाब, हरियाणा, राजस्थान, यूपी व उत्तर भारत मानक
                </div>
              </button>
            </div>
          </div>

          {/* Default Rates */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                डिफ़ॉल्ट आढ़त (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.defaultCommissionPercent}
                onChange={(e) =>
                  setFormData({ ...formData, defaultCommissionPercent: Number(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                हमाली (₹/बोरी)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.defaultHamaliPerBag}
                onChange={(e) =>
                  setFormData({ ...formData, defaultHamaliPerBag: Number(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                तुलाई (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.defaultTulaye}
                onChange={(e) =>
                  setFormData({ ...formData, defaultTulaye: Number(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>
          </div>

          {/* Backup & Restore Data section */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              डेटा बैकअप एवं रीसेट (Data Management)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onExportAllData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>बैकअप फाइल डाउनलोड (JSON)</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>बैकअप रीस्टोर करें</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('क्या आप डेमो/सैंपल डेटा रीसेट करना चाहते हैं?')) {
                    onResetSampleData();
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors ml-auto"
              >
                <RefreshCw className="w-3.5 h-3.5 text-red-500" />
                <span>सैंपल डेटा रीसेट</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'सुरक्षित हो गया!' : 'सेव करें (Save Settings)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
