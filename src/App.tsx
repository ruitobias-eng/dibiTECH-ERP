import React, { useState } from 'react';
import { Navbar, MainViewTab } from './components/layout/Navbar';
import { Sidebar, AdminSection } from './components/layout/Sidebar';
import { PdvScreen } from './components/pdv/PdvScreen';
import { EmpresaView } from './components/admin/cadastros/EmpresaView';
import { PessoasView } from './components/admin/cadastros/PessoasView';
import { ProdutosView } from './components/admin/estoque/ProdutosView';
import { MovimentoEstoqueView } from './components/admin/estoque/MovimentoEstoqueView';
import { InventarioView } from './components/admin/estoque/InventarioView';
import { VendasListView } from './components/admin/vendas/VendasListView';
import { CaixasView } from './components/admin/vendas/CaixasView';
import { FiscalView } from './components/admin/fiscal/FiscalView';
import { NotasFiscaisView } from './components/admin/fiscal/NotasFiscaisView';
import { ComprasView } from './components/admin/compras/ComprasView';
import { RhAcessoView } from './components/admin/rh/RhAcessoView';
import { MobileSimulator } from './components/mobile/MobileSimulator';
import { MonorepoExplorer } from './components/codeview/MonorepoExplorer';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainViewTab>('admin');
  const [adminSection, setAdminSection] = useState<AdminSection>('empresa');

  const handleTabChange = (tab: MainViewTab) => {
    setActiveTab(tab);
    if (tab === 'fiscal_estoque') {
      setAdminSection('produtos');
    } else if (tab === 'admin') {
      setAdminSection('empresa');
    }
  };

  const renderAdminContent = () => {
    switch (adminSection) {
      case 'empresa':
        return <EmpresaView />;
      case 'pessoas':
        return <PessoasView />;
      case 'produtos':
        return <ProdutosView />;
      case 'estoque_movimento':
        return <MovimentoEstoqueView />;
      case 'inventario':
        return <InventarioView />;
      case 'vendas_historico':
        return <VendasListView />;
      case 'caixas':
        return <CaixasView />;
      case 'fiscal_parametros':
        return <FiscalView />;
      case 'notas_fiscais':
        return <NotasFiscaisView />;
      case 'compras':
        return <ComprasView />;
      case 'rh_acesso':
        return <RhAcessoView />;
      default:
        return <EmpresaView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenPdv={() => setActiveTab('pdv')}
      />

      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'pdv' && <PdvScreen />}

        {activeTab === 'mobile' && (
          <div className="flex-1 overflow-y-auto">
            <MobileSimulator />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="flex-1 overflow-y-auto">
            <MonorepoExplorer />
          </div>
        )}

        {(activeTab === 'admin' || activeTab === 'fiscal_estoque') && (
          <div className="flex-1 flex overflow-hidden">
            <Sidebar
              currentSection={adminSection}
              onSelectSection={(sec) => setAdminSection(sec)}
            />
            <div className="flex-1 overflow-y-auto">
              {renderAdminContent()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
