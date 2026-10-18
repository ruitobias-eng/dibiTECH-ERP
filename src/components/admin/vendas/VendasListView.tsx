import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import { Venda } from '../../../types';
import { ReceiptModal } from '../../pdv/ReceiptModal';
import { ReceiptText, Printer, Ban, Search, CheckCircle, Clock } from 'lucide-react';

export const VendasListView: React.FC = () => {
  const store = useAppStore();
  const vendas = store.getVendas();
  const empresa = store.getEmpresa();

  const [busca, setBusca] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<'TODAS' | 'CONCLUIDA' | 'PENDENTE_SYNC' | 'CANCELADA'>('TODAS');
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [modalCancelamento, setModalCancelamento] = useState<{ aberto: boolean; venda?: Venda }>({ aberto: false });
  const [motivoCancelamento, setMotivoCancelamento] = useState<string>('Desistência do cliente ou erro na forma de pagamento');

  const handleConfirmarCancelamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCancelamento.venda) return;
    if (motivoCancelamento.length < 15) {
      return alert('A legislação da SEFAZ exige justificativa de cancelamento com no mínimo 15 caracteres.');
    }

    store.cancelarVenda(modalCancelamento.venda.id, motivoCancelamento);
    setModalCancelamento({ aberto: false });
  };

  const vendasFiltradas = vendas.filter((v) => {
    const matchBusca =
      v.numero.toString().includes(busca) ||
      (v.nomeCliente && v.nomeCliente.toLowerCase().includes(busca.toLowerCase())) ||
      (v.cpfCnpjCliente && v.cpfCnpjCliente.includes(busca)) ||
      (v.chaveAcessoNfe && v.chaveAcessoNfe.includes(busca));

    if (!matchBusca) return false;
    if (filtroStatus !== 'TODAS' && v.status !== filtroStatus) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Histórico de Vendas &amp; Emissões de Caixa
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Auditoria de cupons emitidos, status de sincronização offline (Dexie) e cancelamentos fiscais.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por número do cupom, CPF, cliente ou chave de acesso..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          {(['TODAS', 'CONCLUIDA', 'PENDENTE_SYNC', 'CANCELADA'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filtroStatus === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {st === 'TODAS'
                ? 'Todas'
                : st === 'CONCLUIDA'
                ? 'Concluídas'
                : st === 'PENDENTE_SYNC'
                ? 'Pendente Sync'
                : 'Canceladas'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
              <th className="py-2.5 px-4 font-semibold">Cupom / Série</th>
              <th className="py-2.5 px-4 font-semibold">Data / Hora</th>
              <th className="py-2.5 px-4 font-semibold">Consumidor</th>
              <th className="py-2.5 px-4 font-semibold">Pagamento</th>
              <th className="py-2.5 px-4 font-semibold text-right">Valor Total</th>
              <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              <th className="py-2.5 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vendasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Nenhuma venda localizada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              vendasFiltradas.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900">Nº {v.numero}</span>
                    <span className="text-slate-600 ml-1 font-mono">Série {v.serie}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {new Date(v.dataVenda).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">
                      {v.nomeCliente || 'Consumidor Final'}
                    </div>
                    {v.cpfCnpjCliente && (
                      <div className="text-[11px] text-slate-600 font-mono">
                        CPF: {v.cpfCnpjCliente}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {v.pagamentos.map((p) => p.formaDescricao).join(', ')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                    R$ {v.valorTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-xs ${
                        v.status === 'CONCLUIDA'
                          ? 'text-emerald-700'
                          : v.status === 'PENDENTE_SYNC'
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {v.status === 'CONCLUIDA' && <CheckCircle className="w-3.5 h-3.5" />}
                      {v.status === 'PENDENTE_SYNC' && <Clock className="w-3.5 h-3.5" />}
                      {v.status === 'CANCELADA' && <Ban className="w-3.5 h-3.5" />}
                      {v.status === 'CONCLUIDA'
                        ? 'Autorizada'
                        : v.status === 'PENDENTE_SYNC'
                        ? 'Offline (Dexie)'
                        : 'Cancelada'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Reimprimir Cupom NFC-e"
                        onClick={() => setVendaSelecionada(v)}
                        className="p-1 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {v.status === 'CONCLUIDA' && (
                        <button
                          title="Cancelar Venda na SEFAZ"
                          onClick={() => setModalCancelamento({ aberto: true, venda: v })}
                          className="p-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Reimpressão de Cupom */}
      {vendaSelecionada && (
        <ReceiptModal
          venda={vendaSelecionada}
          empresa={empresa}
          isOpen={!!vendaSelecionada}
          onClose={() => setVendaSelecionada(null)}
        />
      )}

      {/* Modal de Cancelamento de Venda */}
      {modalCancelamento.aberto && modalCancelamento.venda && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-rose-50 flex items-center gap-2 text-rose-800">
              <Ban className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm">
                Cancelar Venda Nº {modalCancelamento.venda.numero} na SEFAZ
              </h3>
            </div>
            <form onSubmit={handleConfirmarCancelamento} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                O cancelamento homologará o evento na SEFAZ e estornará automaticamente os itens ao estoque físico da loja.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Justificativa Obrigatória (mínimo 15 caracteres)
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={15}
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
                <span className="text-[11px] text-slate-600">
                  {motivoCancelamento.length}/15 caracteres mínimos
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalCancelamento({ aberto: false })}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={motivoCancelamento.length < 15}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 rounded-lg shadow-sm cursor-pointer"
                >
                  Homologar Cancelamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
