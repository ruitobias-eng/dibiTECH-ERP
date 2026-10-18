import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import { Calculator, Check, AlertCircle, Save } from 'lucide-react';

export const InventarioView: React.FC = () => {
  const store = useAppStore();
  const produtos = store.getProdutos();

  const [contagens, setContagens] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    produtos.forEach((p) => {
      initial[p.id] = p.estoqueAtual;
    });
    return initial;
  });

  const [concluido, setConcluido] = useState<boolean>(false);

  const handleAlterarContagem = (id: number, val: number) => {
    setContagens((prev) => ({
      ...prev,
      [id]: Math.max(0, val),
    }));
  };

  const handleAplicarInventario = () => {
    const itensAjuste: Array<{ idProduto: number; descricao: string; divergencia: number; estoqueFisico: number }> = [];

    produtos.forEach((p) => {
      const fisico = contagens[p.id] ?? p.estoqueAtual;
      const divergencia = fisico - p.estoqueAtual;
      if (divergencia !== 0) {
        itensAjuste.push({
          idProduto: p.id,
          descricao: p.descricao,
          divergencia,
          estoqueFisico: fisico,
        });
      }
    });

    if (itensAjuste.length === 0) {
      return alert('Nenhuma divergência encontrada entre a contagem física e o saldo do sistema.');
    }

    store.registrarAjusteInventario(itensAjuste);
    setConcluido(true);
    setTimeout(() => setConcluido(false), 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventário Físico &amp; Conciliação de Estoque
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Contagem física por almoxarifado com apuração automática de sobras e faltas e geração de movimentos de ajuste.
          </p>
        </div>

        <button
          onClick={handleAplicarInventario}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Conciliar &amp; Ajustar Estoque
        </button>
      </div>

      {concluido && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          Inventário conciliado com sucesso! Os movimentos de ajuste foram lançados no Kardex.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
              <th className="py-2.5 px-4 font-semibold">Código</th>
              <th className="py-2.5 px-4 font-semibold">Descrição do Produto</th>
              <th className="py-2.5 px-4 font-semibold text-right">Saldo no Sistema</th>
              <th className="py-2.5 px-4 font-semibold text-center w-36">Contagem Física</th>
              <th className="py-2.5 px-4 font-semibold text-right">Divergência</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {produtos.map((p) => {
              const fisico = contagens[p.id] ?? p.estoqueAtual;
              const divergencia = fisico - p.estoqueAtual;
              return (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.codigoInterno}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{p.descricao}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                    {p.estoqueAtual} un
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="number"
                      min="0"
                      value={fisico}
                      onChange={(e) => handleAlterarContagem(p.id, parseInt(e.target.value, 10) || 0)}
                      className="w-24 px-2.5 py-1 text-center font-mono font-bold border border-slate-300 rounded text-xs"
                    />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    {divergencia === 0 ? (
                      <span className="text-slate-400">0</span>
                    ) : divergencia > 0 ? (
                      <span className="text-emerald-600">+{divergencia} (Sobra)</span>
                    ) : (
                      <span className="text-rose-600">{divergencia} (Falta)</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
