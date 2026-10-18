import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import {
  SEED_CFOPS, SEED_NCMS, SEED_CST_ICMS, SEED_CSOSN, SEED_NATUREZAS_OPERACAO
} from '../../../data/seedData';
import { gerarPayloadAcbrIni } from '../../../services/fiscalEngine';
import { Settings, FileCode, Check, Search, Terminal } from 'lucide-react';

export const FiscalView: React.FC = () => {
  const store = useAppStore();
  const empresa = store.getEmpresa();
  const vendas = store.getVendas();

  const [aba, setAba] = useState<'naturezas' | 'cfop' | 'ncm' | 'cst_csosn' | 'acbr_tester'>('naturezas');
  const [buscaCfop, setBuscaCfop] = useState<string>('');
  const [buscaNcm, setBuscaNcm] = useState<string>('');

  // ACBr Lib Testbed state
  const vendaSelecionada = vendas[0] || null;
  const [iniGerado, setIniGerado] = useState<string>(
    vendaSelecionada ? gerarPayloadAcbrIni(vendaSelecionada, empresa) : '; Nenhuma venda realizada para gerar o INI.'
  );
  const [copiado, setCopiado] = useState<boolean>(false);

  const copiarIni = () => {
    navigator.clipboard.writeText(iniGerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const cfopsFiltrados = SEED_CFOPS.filter(
    (c) => c.codigo.includes(buscaCfop) || c.descricao.toLowerCase().includes(buscaCfop.toLowerCase())
  );

  const ncmsFiltrados = SEED_NCMS.filter(
    (n) => n.codigo.includes(buscaNcm) || n.descricao.toLowerCase().includes(buscaNcm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Motor de Regras Fiscais &amp; Parâmetros Tributários
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Gestão de CFOP (541 registros seed), NCMs, CST ICMS/PIS/COFINS, CSOSN, Naturezas de Operação e ACBrLib.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          {[
            { id: 'naturezas' as const, label: 'Naturezas de Operação' },
            { id: 'cfop' as const, label: 'CFOP (Seed)' },
            { id: 'ncm' as const, label: 'NCM' },
            { id: 'cst_csosn' as const, label: 'CST & CSOSN' },
            { id: 'acbr_tester' as const, label: 'Simulador ACBrLib' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setAba(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                aba === item.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {aba === 'naturezas' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Naturezas de Operação Cadastradas
            </span>
          </div>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-4 font-semibold">Descrição</th>
                <th className="py-2.5 px-4 font-semibold">Tipo</th>
                <th className="py-2.5 px-4 font-semibold">CFOP Vinculado</th>
                <th className="py-2.5 px-4 font-semibold">CSOSN / CST Padrão</th>
                <th className="py-2.5 px-4 font-semibold text-center">Movimenta Estoque</th>
                <th className="py-2.5 px-4 font-semibold text-center">Gera Financeiro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SEED_NATUREZAS_OPERACAO.map((nat) => (
                <tr key={nat.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-semibold text-slate-800">{nat.descricao}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${nat.tipo === 'SAIDA' ? 'text-emerald-700' : 'text-blue-700'}`}>
                      {nat.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{nat.idCfop}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    CSOSN: {nat.csosnPadrao} · CST: {nat.cstIcmsPadrao}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-emerald-700 font-semibold">Sim</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-emerald-700 font-semibold">Sim</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {aba === 'cfop' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={buscaCfop}
              onChange={(e) => setBuscaCfop(e.target.value)}
              placeholder="Buscar por código de CFOP (ex: 5102, 6102, 5405) ou descrição..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                  <th className="py-2.5 px-4 font-semibold w-24">CFOP</th>
                  <th className="py-2.5 px-4 font-semibold w-24">Tipo</th>
                  <th className="py-2.5 px-4 font-semibold">Descrição Oficial SEFAZ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cfopsFiltrados.map((c) => (
                  <tr key={c.codigo} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{c.codigo}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{c.tipo}</td>
                    <td className="py-3 px-4 text-slate-800">{c.descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aba === 'ncm' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={buscaNcm}
              onChange={(e) => setBuscaNcm(e.target.value)}
              placeholder="Buscar por código de NCM ou descrição..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                  <th className="py-2.5 px-4 font-semibold w-32">NCM</th>
                  <th className="py-2.5 px-4 font-semibold">Descrição</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Carga Tributária Média (IBPT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ncmsFiltrados.map((n) => (
                  <tr key={n.codigo} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{n.codigo}</td>
                    <td className="py-3 px-4 text-slate-800">{n.descricao}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      {n.aliquotaNacional.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aba === 'cst_csosn' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
              Tabela CSOSN (CRT 1 - Simples Nacional)
            </div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500">
                  <th className="py-2 px-3 w-20">CSOSN</th>
                  <th className="py-2 px-3">Significado Fiscal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SEED_CSOSN.map((c) => (
                  <tr key={c.codigo}>
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{c.codigo}</td>
                    <td className="py-2 px-3 text-slate-700">{c.descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
              Tabela CST ICMS (CRT 3 - Regime Normal)
            </div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500">
                  <th className="py-2 px-3 w-16">CST</th>
                  <th className="py-2 px-3">Descrição da Tributação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SEED_CST_ICMS.map((c) => (
                  <tr key={c.codigo}>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{c.codigo}</td>
                    <td className="py-2 px-3 text-slate-700">{c.descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aba === 'acbr_tester' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-slate-800" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Gerador de Payload ACBrLibNFe (Padrão INI Oficial)
                </h3>
                <p className="text-xs text-slate-500">
                  Estrutura enviada para libacbrnfe.so / libacbrnfe64.dll para montagem, assinatura e transmissão SEFAZ.
                </p>
              </div>
            </div>

            <button
              onClick={copiarIni}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <FileCode className="w-4 h-4" />}
              {copiado ? 'Copiado!' : 'Copiar INI'}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
            {iniGerado}
          </pre>
        </div>
      )}
    </div>
  );
};
