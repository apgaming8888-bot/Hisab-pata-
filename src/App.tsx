import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { TradeLedger } from './components/TradeLedger';
import { QuickMandiCalculator } from './components/QuickMandiCalculator';
import { PartyLedger } from './components/PartyLedger';
import { TradeEntryModal } from './components/TradeEntryModal';
import { BikriParchiModal } from './components/BikriParchiModal';
import { SettingsModal } from './components/SettingsModal';
import { MandiSettings, TradeEntry, PaymentRecord } from './types/mandi';
import { INITIAL_ENTRIES, INITIAL_SETTINGS } from './data/seedData';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'calculator' | 'parties'>('dashboard');

  // Persistence State
  const [settings, setSettings] = useState<MandiSettings>(() => {
    try {
      const saved = localStorage.getItem('mandibahi_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [entries, setEntries] = useState<TradeEntry[]>(() => {
    try {
      const saved = localStorage.getItem('mandibahi_entries');
      return saved ? JSON.parse(saved) : INITIAL_ENTRIES;
    } catch {
      return INITIAL_ENTRIES;
    }
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('mandibahi_payments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TradeEntry | null>(null);
  const [slipEntry, setSlipEntry] = useState<TradeEntry | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mandibahi_settings', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('mandibahi_entries', JSON.stringify(entries));
    } catch (e) {
      console.error(e);
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem('mandibahi_payments', JSON.stringify(payments));
    } catch (e) {
      console.error(e);
    }
  }, [payments]);

  // Handlers
  const handleToggleKgPerMan = (kg: 20 | 40) => {
    setSettings((prev) => ({ ...prev, defaultKgPerMan: kg }));
  };

  const handleOpenNewEntry = () => {
    setEditingEntry(null);
    setIsNewEntryOpen(true);
  };

  const handleEditEntry = (entry: TradeEntry) => {
    setEditingEntry(entry);
    setIsNewEntryOpen(true);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaveEntry = (entry: TradeEntry, shouldOpenSlip: boolean = false) => {
    setEntries((prev) => {
      const index = prev.findIndex((e) => e.id === entry.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = entry;
        return copy;
      }
      return [entry, ...prev];
    });

    setIsNewEntryOpen(false);
    setEditingEntry(null);

    if (shouldOpenSlip) {
      setSlipEntry(entry);
    }
  };

  const handleAddPayment = (payment: PaymentRecord) => {
    setPayments((prev) => [payment, ...prev]);
  };

  const handleApplyQuickCalcToTrade = (data: {
    bags: number;
    grossKg: number;
    netKg: number;
    ratePerMan: number;
    kgPerMan: number;
  }) => {
    const dummyEntry: Partial<TradeEntry> = {
      bags: data.bags,
      grossWeightKg: data.grossKg,
      tareWeightKg: Math.max(0, data.grossKg - data.netKg),
      netWeightKg: data.netKg,
      ratePerMan: data.ratePerMan,
      kgPerMan: data.kgPerMan,
      type: 'aavak',
      paymentStatus: 'pending',
    };
    setEditingEntry(dummyEntry as TradeEntry);
    setIsNewEntryOpen(true);
  };

  // Export / Import
  const handleExportAllData = () => {
    const fullBackup = {
      settings,
      entries,
      payments,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MandiBahi_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAllData = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings) setSettings(parsed.settings);
      if (Array.isArray(parsed.entries)) setEntries(parsed.entries);
      if (Array.isArray(parsed.payments)) setPayments(parsed.payments);
      alert('डेटा सफलतापूर्वक रीस्टोर हो गया!');
      setIsSettingsOpen(false);
    } catch {
      alert('अमान्य फाइल! कृपया सही JSON बैकअप फाइल चुनें।');
    }
  };

  const handleResetSampleData = () => {
    setSettings(INITIAL_SETTINGS);
    setEntries(INITIAL_ENTRIES);
    setPayments([]);
    localStorage.removeItem('mandibahi_settings');
    localStorage.removeItem('mandibahi_entries');
    localStorage.removeItem('mandibahi_payments');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onOpenNewEntry={handleOpenNewEntry}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleKgPerMan={handleToggleKgPerMan}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            entries={entries}
            settings={settings}
            onOpenNewEntry={handleOpenNewEntry}
            onSelectEntryForSlip={(entry) => setSlipEntry(entry)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'ledger' && (
          <TradeLedger
            entries={entries}
            settings={settings}
            onOpenNewEntry={handleOpenNewEntry}
            onSelectEntryForSlip={(entry) => setSlipEntry(entry)}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {activeTab === 'calculator' && (
          <QuickMandiCalculator
            settings={settings}
            onApplyToNewEntry={handleApplyQuickCalcToTrade}
          />
        )}

        {activeTab === 'parties' && (
          <PartyLedger
            entries={entries}
            settings={settings}
            onSelectEntryForSlip={(entry) => setSlipEntry(entry)}
            payments={payments}
            onAddPayment={handleAddPayment}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-5 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">MandiBahi</span>
            <span aria-hidden="true">·</span>
            <span>{settings.firmName}</span>
            <span aria-hidden="true">·</span>
            <span>{settings.mandiName}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>मानक: 1 मण = {settings.defaultKgPerMan} kg</span>
            <span>·</span>
            <span>दैनिक आवक-जावक व मण हिसाब</span>
          </div>
        </div>
      </footer>

      {/* Trade Entry Modal */}
      <TradeEntryModal
        isOpen={isNewEntryOpen}
        onClose={() => {
          setIsNewEntryOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        settings={settings}
        initialEntry={editingEntry}
      />

      {/* Bikri Parchi Slip Modal */}
      <BikriParchiModal
        isOpen={!!slipEntry}
        onClose={() => setSlipEntry(null)}
        entry={slipEntry}
        settings={settings}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onExportAllData={handleExportAllData}
        onImportAllData={handleImportAllData}
        onResetSampleData={handleResetSampleData}
      />
    </div>
  );
}
