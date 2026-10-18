import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import { CaixaModal, CaixaModalMode } from '../../pdv/CaixaModal';
import { ShoppingCart, Unlock, Lock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const CaixasView: React.FC = () => {
  const store = useAppStore();
  const caixas = store.getCaixas();
  const caixaAberto = store.getCaixaAberto();
  const movimentos = store.getMovimentosCaixa();

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; mode: CaixaModalMode }>({
    isOpen: false,
    mode: 'abertura',
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Controle de Caixas &amp; Conferência Financeira
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Abertura, fechamento cego de caixa, sangrias (recolhimento) e suprimentos (fundo de troco).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {caixaAberto ? (
            <>
              <button
                onClick={() => setModalConfig({ isOpen: true, mode: 'suprimento' })}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                + Suprimento
              </button>
              <button
                onClick={() => setModalConfig({ isOpen: true, mode: 'sangria' })}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 cursor-pointer"
              >
                - Sangria
              </button>
              <button
                onClick={() => setModalConfig({ isOpen: true, mode: 'fechamento' })}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
              >
                Fechar Caixa Atual
              </button>
            </>
          ) : (
            <button
              onClick={() => setModalConfig({ isOpen: true, mode: 'abertura' })}
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
            >
              Abrir Novo Caixa
            </button>
          )}
        </div>
      </div>

      {/* Caixa Ativo Banner */}
      {caixaAberto ? (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-emerald-800 font-bold uppercase tracking-wider text-[10px]">Caixa Aberto Nº {caixaAberto.id}</div>
            <div className="font-semibold text-slate-900 text-sm mt-0.5">{caixaAberto.nomeOperador}</div>
            <div className="text-slate-500 font-mono text-[11px]">Desde {new Date(caixaAberto.dataAbertura).toLocaleTimeString('pt-BR')}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase tracking-wider text-[10px]">Fundo Inicial</div>
            <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">R$ {caixaAberto.valorAbertura.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase tracking-wider text-[10px]">Total Vendas Acumuladas</div>
            <div className="text-sm font-bold font-mono text-emerald-700 tabular-nums">R$ {caixaAberto.totalVendas.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase tracking-wider text-[10px]">Em Espécie na Gaveta</div>
            <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
              R$ {(caixaAberto.valorAbertura + caixaAberto.totalDinheiro + caixaAberto.totalSuprimentos - caixaAberto.totalSangrias).toFixed(2)}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center justify-between">
          <span>Nenhum caixa está aberto no momento. O operador de PDV precisará abrir um caixa para realizar vendas.</span>
          <button
            onClick={() => setModalConfig({ isOpen: true, mode: 'abertura' })}
            className="font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Abrir Caixa Agora
          </button>
        </div>
      )}

      {/* Histórico de Caixas */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
          Histórico de Caixas Registrados
        </div>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
              <th className="py-2.5 px-4 font-semibold">Caixa #</th>
              <th className="py-2.5 px-4 font-semibold">Operador</th>
              <th className="py-2.5 px-4 font-semibold">Abertura</th>
              <th className="py-2.5 px-4 font-semibold">Fechamento</th>
              <th className="py-2.5 px-4 font-semibold text-right">Inicial</th>
              <th className="py-2.5 px-4 font-semibold text-right">Vendas</th>
              <th className="py-2.5 px-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {caixas.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-mono font-bold text-slate-800">#{c.id}</td>
                <td className="py-3 px-4 font-medium text-slate-900">{c.nomeOperador}</td>
                <td className="py-3 px-4 font-mono text-slate-600">
                  {new Date(c.dataAbertura).toLocaleString('pt-BR')}
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">
                  {c.dataFechamento ? new Date(c.dataFechamento).toLocaleString('pt-BR') : '—'}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">
                  R$ {c.valorAbertura.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-700">
                  R$ {c.totalVendas.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`font-semibold text-xs ${
                      c.status === 'ABERTO' ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sangrias & Suprimentos */}
      {movimentos.length > 0 && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
            Movimentos de Caixa (Sangrias e Suprimentos)
          </div>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-4 font-semibold">Tipo</th>
                <th className="py-2.5 px-4 font-semibold">Data / Hora</th>
                <th className="py-2.5 px-4 font-semibold">Justificativa</th>
                <th className="py-2.5 px-4 font-semibold text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimentos.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        m.tipo === 'SANGRIA' ? 'text-rose-700' : 'text-blue-700'
                      }`}
                    >
                      {m.tipo === 'SANGRIA' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                      {m.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {new Date(m.dataHora).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{m.motivo}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    R$ {m.valor.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CaixaModal
        isOpen={modalConfig.isOpen}
        mode={modalConfig.mode}
        caixaAberto={caixaAberto}
        onClose={() => setModalConfig({ isOpen: false, mode: 'abertura' })}
      />
    </div>
  );
};
