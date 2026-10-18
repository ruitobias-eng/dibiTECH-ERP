import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import {
  SEED_CARGOS, SEED_SETORES, SEED_PAPEIS
} from '../../../data/seedData';
import { ShieldCheck, UserCheck, Key, Lock, Check } from 'lucide-react';

export const RhAcessoView: React.FC = () => {
  const store = useAppStore();
  const usuarios = store.getUsuarios();
  const usuarioLogado = store.getUsuarioLogado();

  const [aba, setAba] = useState<'usuarios' | 'matriz_rbac' | 'cargos'>('matriz_rbac');

  // Matriz de Permissões Interativa
  const [permissoes, setPermissoes] = useState<Record<string, Record<string, boolean>>>({
    ADMINISTRADOR: {
      'produtos:ver': true, 'produtos:criar': true, 'produtos:editar': true, 'produtos:excluir': true,
      'vendas:ver': true, 'vendas:criar': true, 'vendas:cancelar': true, 'vendas:desconto': true,
      'caixa:abrir': true, 'caixa:fechar': true, 'caixa:sangria': true,
      'fiscal:configurar': true, 'fiscal:cancelar_sefaz': true,
    },
    GERENTE: {
      'produtos:ver': true, 'produtos:criar': true, 'produtos:editar': true, 'produtos:excluir': false,
      'vendas:ver': true, 'vendas:criar': true, 'vendas:cancelar': true, 'vendas:desconto': true,
      'caixa:abrir': true, 'caixa:fechar': true, 'caixa:sangria': true,
      'fiscal:configurar': false, 'fiscal:cancelar_sefaz': true,
    },
    OPERADOR_CAIXA: {
      'produtos:ver': true, 'produtos:criar': false, 'produtos:editar': false, 'produtos:excluir': false,
      'vendas:ver': true, 'vendas:criar': true, 'vendas:cancelar': false, 'vendas:desconto': false,
      'caixa:abrir': true, 'caixa:fechar': true, 'caixa:sangria': false,
      'fiscal:configurar': false, 'fiscal:cancelar_sefaz': false,
    },
    VENDEDOR: {
      'produtos:ver': true, 'produtos:criar': false, 'produtos:editar': false, 'produtos:excluir': false,
      'vendas:ver': true, 'vendas:criar': true, 'vendas:cancelar': false, 'vendas:desconto': false,
      'caixa:abrir': false, 'caixa:fechar': false, 'caixa:sangria': false,
      'fiscal:configurar': false, 'fiscal:cancelar_sefaz': false,
    },
  });

  const togglePermissao = (papel: string, recursoAcao: string) => {
    if (papel === 'ADMINISTRADOR') return; // Admin sempre tem bypass total conforme regra de negócio
    setPermissoes((prev) => ({
      ...prev,
      [papel]: {
        ...prev[papel],
        [recursoAcao]: !prev[papel]?.[recursoAcao],
      },
    }));
  };

  const recursosMatriz = [
    { grupo: 'Produtos & Estoque', items: [
      { id: 'produtos:ver', label: 'Consultar Catálogo e Estoque' },
      { id: 'produtos:criar', label: 'Cadastrar Novos Produtos' },
      { id: 'produtos:editar', label: 'Alterar Preços e Tributação' },
      { id: 'produtos:excluir', label: 'Inativar / Excluir Produtos' },
    ]},
    { grupo: 'Frente de Caixa & Vendas', items: [
      { id: 'vendas:ver', label: 'Visualizar Histórico de Vendas' },
      { id: 'vendas:criar', label: 'Emitir Vendas no PDV' },
      { id: 'vendas:cancelar', label: 'Cancelar Venda Concluída' },
      { id: 'vendas:desconto', label: 'Conceder Desconto Manual' },
    ]},
    { grupo: 'Controle de Caixa', items: [
      { id: 'caixa:abrir', label: 'Abrir Caixa' },
      { id: 'caixa:fechar', label: 'Fechar Caixa e Conferência' },
      { id: 'caixa:sangria', label: 'Realizar Sangria para Cofre' },
    ]},
    { grupo: 'Fiscal & SEFAZ', items: [
      { id: 'fiscal:configurar', label: 'Configurar Certificado e Séries' },
      { id: 'fiscal:cancelar_sefaz', label: 'Transmitir Cancelamento SEFAZ' },
    ]},
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            RH, Usuários &amp; Matriz de Permissões (RBAC)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Controle de acesso por papel (Recurso × Ação), com bypass total para o Administrador Master.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setAba('matriz_rbac')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              aba === 'matriz_rbac' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Matriz de Permissões RBAC
          </button>
          <button
            onClick={() => setAba('usuarios')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              aba === 'usuarios' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Usuários do Sistema ({usuarios.length})
          </button>
          <button
            onClick={() => setAba('cargos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              aba === 'cargos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Cargos &amp; Setores
          </button>
        </div>
      </div>

      {aba === 'matriz_rbac' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 uppercase tracking-wider">
              Matriz de Acesso: Recursos vs Papéis
            </span>
            <span className="text-slate-500">
              * Administrador possui acesso total obrigatório conforme regra do sistema.
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-4 font-semibold w-1/3">Operação / Recurso</th>
                {SEED_PAPEIS.map((p) => (
                  <th key={p.codigo} className="py-2.5 px-4 font-semibold text-center">
                    {p.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recursosMatriz.map((rec) => (
                <React.Fragment key={rec.grupo}>
                  <tr className="bg-slate-50 font-bold text-slate-700">
                    <td colSpan={1 + SEED_PAPEIS.length} className="py-2 px-4 uppercase text-[11px] tracking-wider">
                      {rec.grupo}
                    </td>
                  </tr>
                  {rec.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-medium text-slate-800">{item.label}</td>
                      {SEED_PAPEIS.map((papel) => {
                        const ativo = permissoes[papel.codigo]?.[item.id] ?? false;
                        const isAdmin = papel.codigo === 'ADMINISTRADOR';
                        return (
                          <td key={papel.codigo} className="py-2.5 px-4 text-center">
                            <button
                              type="button"
                              disabled={isAdmin}
                              onClick={() => togglePermissao(papel.codigo, item.id)}
                              className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition-colors ${
                                isAdmin
                                  ? 'bg-slate-200 text-slate-700 cursor-not-allowed'
                                  : ativo
                                  ? 'bg-emerald-600 text-white cursor-pointer'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200 cursor-pointer'
                              }`}
                            >
                              {ativo ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '—'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {aba === 'usuarios' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-4 font-semibold">Nome</th>
                <th className="py-2.5 px-4 font-semibold">Login</th>
                <th className="py-2.5 px-4 font-semibold">Papel RBAC</th>
                <th className="py-2.5 px-4 font-semibold text-center">Admin (Bypass)</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                <th className="py-2.5 px-4 text-center">Trocar Usuário Ativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => {
                const isCurrent = usuarioLogado.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-semibold text-slate-900">{u.nome}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{u.login}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{u.papel}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${u.administrador === 'S' ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {u.administrador === 'S' ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-emerald-700 font-semibold">Ativo</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => store.setUsuarioLogado(u)}
                        className={`px-3 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-100 text-blue-800 font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isCurrent ? 'Ativo Agora' : 'Alternar para este'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {aba === 'cargos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
              Cargos &amp; Códigos CBO
            </div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500">
                  <th className="py-2 px-3">Cargo</th>
                  <th className="py-2 px-3">CBO</th>
                  <th className="py-2 px-3 text-right">Piso Base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SEED_CARGOS.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 px-3 font-semibold text-slate-800">{c.nome}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{c.cbo}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">R$ {c.salarioBase.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
              Setores da Empresa
            </div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Setor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SEED_SETORES.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 px-3 font-mono text-slate-400">#{s.id}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{s.nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
