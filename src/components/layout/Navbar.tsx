import React from 'react';
import { useAppStore } from '../../services/store';

export type MainViewTab = 'admin' | 'pdv' | 'fiscal_estoque' | 'mobile' | 'code';

interface NavbarProps {
  activeTab: MainViewTab;
  onTabChange: (tab: MainViewTab) => void;
  onOpenPdv: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onOpenPdv }) => {
  const store = useAppStore();
  const isOnline = store.getOnlineStatus();

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onTabChange('admin')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 text-left cursor-pointer hover:text-blue-600 transition-colors"
        >
          Nexus ERP &amp; PDV
        </button>
      </div>

      {/* Zone 2: 4–5 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
        <button
          onClick={() => onTabChange('admin')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
            activeTab === 'admin'
              ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
              : ''
          }`}
        >
          Gestão Geral
        </button>

        <button
          onClick={() => onTabChange('pdv')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
            activeTab === 'pdv'
              ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
              : ''
          }`}
        >
          Frente de Caixa
        </button>

        <button
          onClick={() => onTabChange('fiscal_estoque')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
            activeTab === 'fiscal_estoque'
              ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
              : ''
          }`}
        >
          Estoque &amp; Fiscal
        </button>

        <button
          onClick={() => onTabChange('mobile')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
            activeTab === 'mobile'
              ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
              : ''
          }`}
        >
          Mobile Expo
        </button>

        <button
          onClick={() => onTabChange('code')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
            activeTab === 'code'
              ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
              : ''
          }`}
        >
          Monorepo &amp; Código
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={store.toggleOnlineStatus}
          title={isOnline ? 'Internet conectada: sincronização automática' : 'Modo offline ativado: vendas gravadas no IndexedDB (Dexie)'}
          className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
            isOnline
              ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
          }`}
        >
          {isOnline ? 'Online · SEFAZ Ativa' : 'Offline · Dexie Local'}
        </button>

        <button
          onClick={onOpenPdv}
          className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
        >
          Abrir PDV (Frente de Caixa)
        </button>
      </div>
    </header>
  );
};
