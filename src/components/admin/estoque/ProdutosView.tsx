import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import { Produto } from '../../../types';
import {
  Package, Plus, Search, Trash2, Edit2, Barcode,
  AlertTriangle, Check, Layers, DollarSign, Percent
} from 'lucide-react';
import {
  SEED_GRUPOS, SEED_SUBGRUPOS, SEED_MARCAS, SEED_UNIDADES,
  SEED_NCMS, SEED_CFOPS, SEED_CST_ICMS, SEED_CSOSN
} from '../../../data/seedData';

export const ProdutosView: React.FC = () => {
  const store = useAppStore();
  const produtos = store.getProdutos();
  const empresa = store.getEmpresa();

  const [busca, setBusca] = useState<string>('');
  const [grupoFiltro, setGrupoFiltro] = useState<number | 'TODOS'>('TODOS');
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null);
  const [abaModal, setAbaModal] = useState<'geral' | 'fiscal' | 'estoque' | 'precos' | 'barras'>('geral');

  // Form State
  const [form, setForm] = useState<Partial<Produto>>({
    codigoInterno: '',
    codigoBarras: [''],
    descricao: '',
    descricaoCurta: '',
    idGrupoProduto: 1,
    idSubgrupoProduto: 1,
    idMarca: 1,
    idUnidadeMedida: 1,
    idNcm: '8471.60.52',
    idCfop: '5102',
    idCstIcms: '00',
    idCsosn: '102',
    cstPis: '01',
    cstCofins: '01',
    origemMercadoria: '0',
    aliquotaIcms: 18,
    aliquotaPis: 1.65,
    aliquotaCofins: 7.60,
    precoCusto: 10,
    margemLucroPercentual: 50,
    precoVenda: 15,
    precoAtacado: 13.5,
    estoqueMinimo: 5,
    estoqueMaximo: 100,
    estoqueAtual: 20,
    ativo: 'S',
    controlarEstoque: 'S',
  });

  const abrirNovo = () => {
    setProdutoEmEdicao(null);
    setForm({
      codigoInterno: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      codigoBarras: [`789${Math.floor(1000000000 + Math.random() * 9000000000)}`],
      descricao: '',
      descricaoCurta: '',
      idGrupoProduto: 1,
      idSubgrupoProduto: 1,
      idMarca: 1,
      idUnidadeMedida: 1,
      idNcm: '8471.60.52',
      idCfop: '5102',
      idCstIcms: '00',
      idCsosn: '102',
      origemMercadoria: '0',
      aliquotaIcms: 18,
      aliquotaPis: 1.65,
      aliquotaCofins: 7.60,
      precoCusto: 10,
      margemLucroPercentual: 50,
      precoVenda: 15,
      precoAtacado: 13.5,
      estoqueMinimo: 5,
      estoqueMaximo: 100,
      estoqueAtual: 10,
      ativo: 'S',
      controlarEstoque: 'S',
    });
    setAbaModal('geral');
    setModalAberto(true);
  };

  const abrirEdicao = (p: Produto) => {
    setProdutoEmEdicao(p);
    setForm({ ...p });
    setAbaModal('geral');
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.codigoInterno) {
      return alert('Preencha a descrição e código interno.');
    }

    const produtoPronto: Produto = {
      id: produtoEmEdicao ? produtoEmEdicao.id : Date.now(),
      codigoInterno: form.codigoInterno!,
      codigoBarras: form.codigoBarras || [],
      descricao: form.descricao!,
      descricaoCurta: form.descricaoCurta || form.descricao!.slice(0, 30),
      idGrupoProduto: form.idGrupoProduto || 1,
      idSubgrupoProduto: form.idSubgrupoProduto,
      idMarca: form.idMarca,
      idUnidadeMedida: form.idUnidadeMedida || 1,
      idNcm: form.idNcm || '8471.60.52',
      idCfop: form.idCfop || '5102',
      idCstIcms: form.idCstIcms,
      idCsosn: form.idCsosn,
      cstPis: form.cstPis || '01',
      cstCofins: form.cstCofins || '01',
      origemMercadoria: form.origemMercadoria || '0',
      aliquotaIcms: form.aliquotaIcms || 18,
      aliquotaPis: form.aliquotaPis || 1.65,
      aliquotaCofins: form.aliquotaCofins || 7.60,
      precoCusto: form.precoCusto || 0,
      margemLucroPercentual: form.margemLucroPercentual || 40,
      precoVenda: form.precoVenda || 1,
      precoAtacado: form.precoAtacado,
      estoqueMinimo: form.estoqueMinimo || 0,
      estoqueMaximo: form.estoqueMaximo || 100,
      estoqueAtual: form.estoqueAtual || 0,
      ativo: form.ativo || 'S',
      controlarEstoque: form.controlarEstoque || 'S',
    };

    store.saveProduto(produtoPronto);
    setModalAberto(false);
  };

  const calcularPrecoVenda = (custo: number, margem: number) => {
    const venda = custo * (1 + margem / 100);
    setForm((prev) => ({
      ...prev,
      precoCusto: custo,
      margemLucroPercentual: margem,
      precoVenda: parseFloat(venda.toFixed(2)),
      precoAtacado: parseFloat((venda * 0.9).toFixed(2)),
    }));
  };

  const produtosFiltrados = produtos.filter((p) => {
    const matchBusca =
      p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigoInterno.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigoBarras.some((b) => b.includes(busca));

    if (!matchBusca) return false;
    if (grupoFiltro !== 'TODOS' && p.idGrupoProduto !== grupoFiltro) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Catálogo de Produtos &amp; Parâmetros Fiscais
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Cadastro com abas (Dados, Fiscal NCM/CFOP/CST/CSOSN, Estoque, Tabelas de Preço e Código de Barras EAN-13).
          </p>
        </div>

        <button
          onClick={abrirNovo}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por descrição, código interno ou código de barras EAN-13..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Grupo:</span>
          <select
            value={grupoFiltro}
            onChange={(e) => setGrupoFiltro(e.target.value === 'TODOS' ? 'TODOS' : parseInt(e.target.value, 10))}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="TODOS">Todos os Grupos</option>
            {SEED_GRUPOS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.descricao}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
              <th className="py-2.5 px-4 font-semibold">Código</th>
              <th className="py-2.5 px-4 font-semibold">Descrição / Marca</th>
              <th className="py-2.5 px-4 font-semibold">NCM / CFOP</th>
              <th className="py-2.5 px-4 font-semibold text-right">Custo</th>
              <th className="py-2.5 px-4 font-semibold text-right">Preço Venda</th>
              <th className="py-2.5 px-4 font-semibold text-center">Estoque Atual</th>
              <th className="py-2.5 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {produtosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Nenhum produto cadastrado com os critérios informados.
                </td>
              </tr>
            ) : (
              produtosFiltrados.map((p) => {
                const marca = SEED_MARCAS.find((m) => m.id === p.idMarca)?.descricao || '—';
                const estoqueBaixo = p.estoqueAtual <= p.estoqueMinimo;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {p.codigoInterno}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{p.descricao}</div>
                      <div className="text-[11px] text-slate-600">
                        Marca: {marca} {p.codigoBarras[0] ? `· EAN: ${p.codigoBarras[0]}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div>NCM: {p.idNcm}</div>
                      <div className="text-[11px] text-slate-600">
                        CFOP: {p.idCfop} · {empresa.crt === 1 ? `CSOSN: ${p.idCsosn || '102'}` : `CST: ${p.idCstIcms || '00'}`}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                      R$ {p.precoCusto.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      R$ {p.precoVenda.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-bold tabular-nums ${estoqueBaixo ? 'text-amber-800' : 'text-slate-800'}`}>
                        {p.estoqueAtual}
                      </span>
                      {estoqueBaixo && (
                        <span className="block text-[10px] text-amber-700">Abaixo do mín ({p.estoqueMinimo})</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirEdicao(p)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir "${p.descricao}"?`)) {
                              store.deleteProduto(p.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro Completo com Abas */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
              <h3 className="font-semibold text-slate-800 text-sm">
                {produtoEmEdicao ? `Editar Produto: ${produtoEmEdicao.descricaoCurta}` : 'Novo Produto'}
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Abas do Formulário */}
            <div className="px-6 pt-3 border-b border-slate-200 flex gap-4 text-xs font-medium">
              {[
                { id: 'geral' as const, label: '1. Dados Gerais' },
                { id: 'fiscal' as const, label: '2. Parâmetros Fiscais' },
                { id: 'precos' as const, label: '3. Preços & Margem' },
                { id: 'estoque' as const, label: '4. Estoque & Almoxarifado' },
                { id: 'barras' as const, label: '5. Códigos de Barras' },
              ].map((aba) => (
                <button
                  key={aba.id}
                  type="button"
                  onClick={() => setAbaModal(aba.id)}
                  className={`pb-2.5 transition-colors cursor-pointer ${
                    abaModal === aba.id
                      ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {aba.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              {abaModal === 'geral' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Código Interno</label>
                    <input
                      type="text"
                      required
                      value={form.codigoInterno}
                      onChange={(e) => setForm({ ...form, codigoInterno: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Curta (PDV)</label>
                    <input
                      type="text"
                      maxLength={40}
                      value={form.descricaoCurta}
                      onChange={(e) => setForm({ ...form, descricaoCurta: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Completa</label>
                    <input
                      type="text"
                      required
                      value={form.descricao}
                      onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Grupo de Produto</label>
                    <select
                      value={form.idGrupoProduto}
                      onChange={(e) => setForm({ ...form, idGrupoProduto: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {SEED_GRUPOS.map((g) => (
                        <option key={g.id} value={g.id}>{g.descricao}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unidade de Medida</label>
                    <select
                      value={form.idUnidadeMedida}
                      onChange={(e) => setForm({ ...form, idUnidadeMedida: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {SEED_UNIDADES.map((u) => (
                        <option key={u.id} value={u.id}>{u.sigla} - {u.descricao}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {abaModal === 'fiscal' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                    Regime Vigente da Empresa: <span className="font-bold">CRT {empresa.crt} ({empresa.crt === 1 ? 'Simples Nacional' : 'Regime Normal'})</span>.
                    {empresa.crt === 1 ? ' Preencha CSOSN.' : ' Preencha CST ICMS.'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">NCM (Nomenclatura Comum)</label>
                      <select
                        value={form.idNcm}
                        onChange={(e) => setForm({ ...form, idNcm: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                      >
                        {SEED_NCMS.map((n) => (
                          <option key={n.codigo} value={n.codigo}>{n.codigo} - {n.descricao.slice(0, 45)}...</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CFOP Padrão Saída</label>
                      <select
                        value={form.idCfop}
                        onChange={(e) => setForm({ ...form, idCfop: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                      >
                        {SEED_CFOPS.filter((c) => c.tipo === 'SAIDA').map((c) => (
                          <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.descricao.slice(0, 45)}...</option>
                        ))}
                      </select>
                    </div>

                    {empresa.crt === 1 ? (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">CSOSN (Simples Nacional)</label>
                        <select
                          value={form.idCsosn || '102'}
                          onChange={(e) => setForm({ ...form, idCsosn: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                        >
                          {SEED_CSOSN.map((cs) => (
                            <option key={cs.codigo} value={cs.codigo}>{cs.codigo} - {cs.descricao}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">CST ICMS (Regime Normal)</label>
                        <select
                          value={form.idCstIcms || '00'}
                          onChange={(e) => setForm({ ...form, idCstIcms: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                        >
                          {SEED_CST_ICMS.map((cst) => (
                            <option key={cst.codigo} value={cst.codigo}>{cst.codigo} - {cst.descricao}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Alíquota ICMS Interna (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={form.aliquotaIcms}
                        onChange={(e) => setForm({ ...form, aliquotaIcms: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {abaModal === 'precos' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preço de Custo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.precoCusto}
                      onChange={(e) => calcularPrecoVenda(parseFloat(e.target.value) || 0, form.margemLucroPercentual || 40)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Margem de Lucro (%)</label>
                    <input
                      type="number"
                      step="1"
                      value={form.margemLucroPercentual}
                      onChange={(e) => calcularPrecoVenda(form.precoCusto || 0, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preço de Venda Varejo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={form.precoVenda}
                      onChange={(e) => setForm({ ...form, precoVenda: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}

              {abaModal === 'estoque' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estoque Mínimo</label>
                    <input
                      type="number"
                      value={form.estoqueMinimo}
                      onChange={(e) => setForm({ ...form, estoqueMinimo: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estoque Máximo</label>
                    <input
                      type="number"
                      value={form.estoqueMaximo}
                      onChange={(e) => setForm({ ...form, estoqueMaximo: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Saldo Atual (Matriz)</label>
                    <input
                      type="number"
                      value={form.estoqueAtual}
                      onChange={(e) => setForm({ ...form, estoqueAtual: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {abaModal === 'barras' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">Código de Barras EAN-13 Principal</label>
                  <input
                    type="text"
                    value={form.codigoBarras?.[0] || ''}
                    onChange={(e) => setForm({ ...form, codigoBarras: [e.target.value] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    placeholder="7891234567890"
                  />
                  <p className="text-xs text-slate-500">
                    Utilizado para identificação por leitor de código de barras ou câmera no PDV e Mobile.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
