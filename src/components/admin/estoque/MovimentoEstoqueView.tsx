import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Wrench, Plus } from 'lucide-react';

export const MovimentoEstoqueView: React.FC = () => {
  const store = useAppStore();
  const movimentos = store.getMovimentosEstoque();
  const produtos = store.getProdutos();

  const [modalAjuste, setModalAjuste] = useState<boolean>(false);
  const [produtoAjuste, setProdutoAjuste] = useState<number>(produtos[0]?.id || 1);
  const [novoSaldoFisico, setNovoSaldoFisico] = useState<string>('50');
  const [motivoAjuste, setMotivoAjuste] = useState<string>('Inventário rotativo de contagem');

  const handleSalvarAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = produtos.find((p) => p.id === produtoAjuste);
    if (!prod) return;

    const fisico = parseInt(novoSaldoFisico, 10) || 0;
    const divergencia = fisico - prod.estoqueAtual;

    store.registrarAjusteInventario([
      {
        idProduto: prod.id,
        descricao: prod.descricao,
        divergencia,
        estoqueFisico: fisico,
      },
    ]);

    setModalAjuste(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Livro de Movimentação de Estoque (Kardex)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Rastreabilidade transacional de Entradas (compras), Saídas (vendas PDV) e Ajustes físicos.
          </p>
        </div>

        <button
          onClick={() => setModalAjuste(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Wrench className="w-4 h-4" />
          Ajuste de Inventário Avulso
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
              <th className="py-2.5 px-4 font-semibold">Tipo</th>
              <th className="py-2.5 px-4 font-semibold">Data / Hora</th>
              <th className="py-2.5 px-4 font-semibold">Origem</th>
              <th className="py-2.5 px-4 font-semibold">Observação / Justificativa</th>
              <th className="py-2.5 px-4 font-semibold text-right">Qtd Itens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movimentos.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">
                  Nenhum movimento de estoque registrado ainda.
                </td>
              </tr>
            ) : (
              movimentos.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        m.tipo === 'ENTRADA'
                          ? 'text-emerald-700'
                          : m.tipo === 'SAIDA'
                          ? 'text-rose-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {m.tipo === 'ENTRADA' && <ArrowDownLeft className="w-3.5 h-3.5" />}
                      {m.tipo === 'SAIDA' && <ArrowUpRight className="w-3.5 h-3.5" />}
                      {m.tipo === 'AJUSTE' && <ArrowLeftRight className="w-3.5 h-3.5" />}
                      {m.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {new Date(m.dataMovimento).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{m.origem}</td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{m.observacao || '—'}</div>
                    <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                      {m.itens.map((i) => `${i.descricao} (${i.quantidade} un)`).join(', ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                    {m.itens.reduce((acc, i) => acc + i.quantidade, 0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAjuste && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 text-sm">Ajuste de Inventário Físico</h3>
              <button onClick={() => setModalAjuste(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSalvarAjuste} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione o Produto</label>
                <select
                  value={produtoAjuste}
                  onChange={(e) => setProdutoAjuste(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.descricao} (Estoque atual: {p.estoqueAtual} un)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nova Contagem Física Real (un)</label>
                <input
                  type="number"
                  required
                  value={novoSaldoFisico}
                  onChange={(e) => setNovoSaldoFisico(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo do Ajuste</label>
                <input
                  type="text"
                  required
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalAjuste(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
