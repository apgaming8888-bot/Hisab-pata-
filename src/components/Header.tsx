import React from 'react';
import { Plus, Settings as SettingsIcon, Calculator } from 'lucide-react';
import { MandiSettings } from '../types/mandi';

interface HeaderProps {
  activeTab: 'dashboard' | 'ledger' | 'calculator' | 'parties';
  setActiveTab: (tab: 'dashboard' | 'ledger' | 'calculator' | 'parties') => void;
  settings: MandiSettings;
  onOpenNewEntry: () => void;
  onOpenSettings: () => void;
  onToggleKgPerMan: (kg: 20 | 40) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onOpenNewEntry,
  onOpenSettings,
  onToggleKgPerMan,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            मं
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                MandiBahi
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 hidden sm:inline-block">
                मंडी व्यापार & मण हिसाब
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-xs font-medium">
              {settings.firmName}
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            डैशबोर्ड (Overview)
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'ledger'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            व्यापार बही (Trade Register)
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            मण कैलकुलेटर (Calculator)
          </button>
          <button
            onClick={() => setActiveTab('parties')}
            className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'parties'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            खाताबही (Party Ledger)
          </button>
        </nav>

        {/* Zone 3: Primary Actions & Standard Switch */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Man Standard Quick Toggle */}
          <div className="hidden sm:flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => onToggleKgPerMan(20)}
              title="1 मण = 20 किलो (गुजरात / सौराष्ट्र / मालवा / कपास मानक)"
              className={`px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
                settings.defaultKgPerMan === 20
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              20 kg/मण
            </button>
            <button
              type="button"
              onClick={() => onToggleKgPerMan(40)}
              title="1 मण = 40 किलो (उत्तर भारत / पंजाब / हरियाणा / यूपी मानक)"
              className={`px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
                settings.defaultKgPerMan === 40
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              40 kg/मण
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="मंडी व फर्म सेटिंग्स"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenNewEntry}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ नया व्यापार</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-100 gap-2 scrollbar-none bg-slate-50/70">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard'
              ? 'bg-white text-emerald-800 shadow-xs font-semibold border border-slate-200'
              : 'text-slate-600'
          }`}
        >
          डैशबोर्ड
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'ledger'
              ? 'bg-white text-emerald-800 shadow-xs font-semibold border border-slate-200'
              : 'text-slate-600'
          }`}
        >
          व्यापार बही
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'calculator'
              ? 'bg-white text-emerald-800 shadow-xs font-semibold border border-slate-200'
              : 'text-slate-600'
          }`}
        >
          मण कैलकुलेटर
        </button>
        <button
          onClick={() => setActiveTab('parties')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'parties'
              ? 'bg-white text-emerald-800 shadow-xs font-semibold border border-slate-200'
              : 'text-slate-600'
          }`}
        >
          खाताबही
        </button>
        <div className="flex items-center ml-auto gap-1 text-[11px] font-medium text-slate-500 whitespace-nowrap">
          <span>मानक:</span>
          <button
            onClick={() => onToggleKgPerMan(settings.defaultKgPerMan === 20 ? 40 : 20)}
            className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-semibold text-emerald-700"
          >
            {settings.defaultKgPerMan}kg/मण
          </button>
        </div>
      </div>
    </header>
  );
};
