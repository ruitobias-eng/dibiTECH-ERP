import React from 'react';
import {
  Building2, Users, ShieldCheck, Package, ReceiptText,
  ShoppingCart, Truck, FileText, Settings, ArrowLeftRight,
  Calculator
} from 'lucide-react';

export type AdminSection =
  | 'empresa'
  | 'pessoas'
  | 'produtos'
  | 'estoque_movimento'
  | 'inventario'
  | 'vendas_historico'
  | 'caixas'
  | 'fiscal_parametros'
  | 'notas_fiscais'
  | 'compras'
  | 'rh_acesso';

interface SidebarProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentSection, onSelectSection }) => {
  const menuGroups: Array<{
    title: string;
    items: Array<{ id: AdminSection; label: string; icon: React.ElementType }>;
  }> = [
    {
      title: 'Principal & Cadastros',
      items: [
        { id: 'empresa', label: 'Empresa & Séries', icon: Building2 },
        { id: 'pessoas', label: 'Pessoas (Clientes/Fornecedores)', icon: Users },
      ],
    },
    {
      title: 'Estoque & Catálogo',
      items: [
        { id: 'produtos', label: 'Produtos & Preços', icon: Package },
        { id: 'estoque_movimento', label: 'Movimentação de Estoque', icon: ArrowLeftRight },
        { id: 'inventario', label: 'Inventário Físico', icon: Calculator },
      ],
    },
    {
      title: 'Operações & Vendas',
      items: [
        { id: 'vendas_historico', label: 'Histórico de Vendas', icon: ReceiptText },
        { id: 'caixas', label: 'Caixas & Conferência', icon: ShoppingCart },
        { id: 'compras', label: 'Compras & Entradas', icon: Truck },
      ],
    },
    {
      title: 'Fiscal & Documentos',
      items: [
        { id: 'notas_fiscais', label: 'Notas Fiscais (NFC-e / NF-e)', icon: FileText },
        { id: 'fiscal_parametros', label: 'Regras Fiscais (CFOP/CST)', icon: Settings },
      ],
    },
    {
      title: 'RH & Segurança',
      items: [
        { id: 'rh_acesso', label: 'Usuários & Permissões RBAC', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-57px)]">
      <div className="p-4 space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-2.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors text-left cursor-pointer ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-600'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-700">Regime Tributário</div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span>CRT 1 · Simples Nacional</span>
        </div>
        <div className="text-[11px] text-slate-600">NFC-e mod 65 · Layout 4.00</div>
      </div>
    </aside>
  );
};
