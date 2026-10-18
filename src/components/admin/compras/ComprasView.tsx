import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import { Compra, Produto } from '../../../types';
import { Truck, Plus, PackageCheck, Search, Check } from 'lucide-react';

export const ComprasView: React.FC = () => {
  const store = useAppStore();
  const compras = store.getCompras();
  const produtos = store.getProdutos();
  const fornecedores = store.getPessoas().filter((p) => p.ehFornecedor === 'S');

  const [modalEntrada, setModalEntrada] = useState<boolean>(false);
  const [fornecedorId, setFornecedorId] = useState<number>(fornecedores[0]?.id || 1);
  const [numeroNota, setNumeroNota] = useState<string>('98421');
  const [serieNota, setSerieNota] = useState<string>('1');
  const [itensCompra, setItensCompra] = useState<Array<{ idProduto: number; quantidade: number; precoCusto: number }>>([
    { idProduto: produtos[0]?.id || 1, quantidade: 20, precoCusto: produtos[0]?.precoCusto || 50 },
  ]);

  const handleSalvarEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    const forn = fornecedores.find((f) => f.id === fornecedorId) || { nome: 'Fornecedor Geral' };

    const itensProcessados = itensCompra.map((item) => {
      const prod = produtos.find((p) => p.id === item.idProduto);
      return {
        idProduto: item.idProduto,
        descricao: prod?.descricao || 'Produto',
        quantidade: item.quantidade,
        precoCusto: item.precoCusto,
        subtotal: item.quantidade * item.precoCusto,
      };
    });

    const valorTotal = itensProcessados.reduce((acc, i) => acc + i.subtotal, 0);

    const novaCompra: Compra = {
      id: Date.now(),
      numeroNota,
      serieNota,
      idFornecedor: fornecedorId,
      nomeFornecedor: forn.nome,
      dataEmissao: new Date().toISOString(),
      dataEntrada: new Date().toISOString(),
      valorProdutos: valorTotal,
      valorFrete: 0,
      valorTotal,
      itens: itensProcessados,
    };

    store.registrarEntradaCompra(novaCompra);
    setModalEntrada(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Compras &amp; Entrada de Mercadorias (NF-e de Compra)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Gera Movimento de Estoque do tipo ENTRADA, atualiza saldos e recalcula custo de aquisição.
          </p>
        </div>

        <button
          onClick={() => setModalEntrada(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Lançar Entrada de NF-e
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
              <th className="py-2.5 px-4 font-semibold">Nota / Série</th>
              <th className="py-2.5 px-4 font-semibold">Data Entrada</th>
              <th className="py-2.5 px-4 font-semibold">Fornecedor</th>
              <th className="py-2.5 px-4 font-semibold">Itens Recebidos</th>
              <th className="py-2.5 px-4 font-semibold text-right">Valor Total</th>
              <th className="py-2.5 px-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {compras.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  Nenhuma entrada de mercadoria registrada ainda.
                </td>
              </tr>
            ) : (
              compras.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    NF Nº {c.numeroNota}/{c.serieNota}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {new Date(c.dataEntrada).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{c.nomeFornecedor}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {c.itens.map((i) => `${i.descricao} (+${i.quantidade} un)`).join(', ')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                    R$ {c.valorTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-emerald-700 font-semibold text-xs inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Entrada Efetuada
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalEntrada && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 text-sm">Entrada de Mercadoria / Compra</h3>
              <button onClick={() => setModalEntrada(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSalvarEntrada} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Número da NF-e</label>
                  <input
                    type="text"
                    required
                    value={numeroNota}
                    onChange={(e) => setNumeroNota(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Série</label>
                  <input
                    type="text"
                    required
                    value={serieNota}
                    onChange={(e) => setSerieNota(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fornecedor</label>
                <select
                  value={fornecedorId}
                  onChange={(e) => setFornecedorId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome} (CNPJ: {f.cnpj || '—'})</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Item da Entrada
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 sm:col-span-1">
                    <label className="block text-[11px] text-slate-600 mb-1">Produto</label>
                    <select
                      value={itensCompra[0]?.idProduto}
                      onChange={(e) => {
                        const id = parseInt(e.target.value, 10);
                        const prod = produtos.find((p) => p.id === id);
                        setItensCompra([{ idProduto: id, quantidade: itensCompra[0].quantidade, precoCusto: prod?.precoCusto || 10 }]);
                      }}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                    >
                      {produtos.map((p) => (
                        <option key={p.id} value={p.id}>{p.descricaoCurta}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Qtd Comprada</label>
                    <input
                      type="number"
                      min="1"
                      value={itensCompra[0]?.quantidade}
                      onChange={(e) => {
                        const qtd = parseInt(e.target.value, 10) || 1;
                        setItensCompra([{ ...itensCompra[0], quantidade: qtd }]);
                      }}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Preço Custo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={itensCompra[0]?.precoCusto}
                      onChange={(e) => {
                        const custo = parseFloat(e.target.value) || 0;
                        setItensCompra([{ ...itensCompra[0], precoCusto: custo }]);
                      }}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalEntrada(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Confirmar Entrada no Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
