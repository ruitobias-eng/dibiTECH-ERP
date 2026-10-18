import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import { Produto } from '../../types';
import {
  Smartphone, Search, Plus, ShoppingCart, User, Package,
  ArrowLeft, Check, RefreshCw, Barcode
} from 'lucide-react';

export const MobileSimulator: React.FC = () => {
  const store = useAppStore();
  const produtos = store.getProdutos();
  const clientes = store.getPessoas().filter((p) => p.ehCliente === 'S');

  const [mobileTab, setMobileTab] = useState<'catalogo' | 'novo_cliente' | 'carrinho'>('catalogo');
  const [busca, setBusca] = useState<string>('');
  const [carrinhoMobile, setCarrinhoMobile] = useState<Array<{ produto: Produto; qtd: number }>>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Form Mobile State (PF/PJ com alternância)
  const [tipoPessoa, setTipoPessoa] = useState<'F' | 'J'>('F');
  const [nome, setNome] = useState<string>('');
  const [documento, setDocumento] = useState<string>('');
  const [cidade, setCidade] = useState<string>('São Paulo');
  const [uf, setUf] = useState<string>('SP');
  const [clienteSalvoMsg, setClienteSalvoMsg] = useState<boolean>(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleAdicionarCarrinho = (p: Produto) => {
    setCarrinhoMobile((prev) => {
      const idx = prev.findIndex((i) => i.produto.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].qtd += 1;
        return copy;
      }
      return [...prev, { produto: p, qtd: 1 }];
    });
  };

  const handleSalvarClienteMobile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !documento) return alert('Preencha os campos obrigatórios');

    store.savePessoa({
      id: Date.now(),
      tipo: tipoPessoa,
      nome,
      ehCliente: 'S',
      ehFornecedor: 'N',
      ehColaborador: 'N',
      ehTransportadora: 'N',
      ...(tipoPessoa === 'F' ? { cpf: documento.replace(/\D/g, '') } : { cnpj: documento.replace(/\D/g, '') }),
      enderecos: [
        {
          logradouro: 'Rua Principal',
          numero: '10',
          bairro: 'Centro',
          cidade,
          uf,
          cep: '01000000',
          municipioIbge: '3550308',
          principal: 'S',
          entrega: 'S',
          cobranca: 'S',
          correspondencia: 'S',
        },
      ],
      telefones: [],
    });

    setClienteSalvoMsg(true);
    setTimeout(() => {
      setClienteSalvoMsg(false);
      setMobileTab('catalogo');
    }, 1500);
  };

  const produtosFiltrados = produtos.filter((p) =>
    p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    p.codigoInterno.toLowerCase().includes(busca.toLowerCase())
  );

  const totalCarrinho = carrinhoMobile.reduce((acc, i) => acc + i.produto.precoVenda * i.qtd, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Simulador Mobile Expo (React Native + Expo Router)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Demonstração interativa do app mobile para vendedores externos: catálogo, pedido e alternância PF/PJ.
          </p>
        </div>
      </div>

      <div className="flex justify-center py-4">
        {/* Mockup iPhone */}
        <div className="w-[360px] h-[720px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col relative overflow-hidden">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
            <div className="w-2 h-2 rounded-full bg-blue-900/40" />
          </div>

          {/* Screen Content */}
          <div className="w-full h-full bg-slate-50 rounded-[38px] overflow-hidden flex flex-col pt-8 text-slate-900 relative">
            {/* Status Bar */}
            <div className="px-6 py-1 flex justify-between items-center text-[11px] font-semibold text-slate-700">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Header Mobile */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800">
                {mobileTab === 'catalogo' && 'Vendas Mobile'}
                {mobileTab === 'novo_cliente' && 'Novo Cliente'}
                {mobileTab === 'carrinho' && 'Meu Pedido'}
              </span>

              {mobileTab !== 'catalogo' ? (
                <button
                  onClick={() => setMobileTab('catalogo')}
                  className="text-xs text-blue-600 font-semibold cursor-pointer"
                >
                  Voltar
                </button>
              ) : (
                <button
                  onClick={handleRefresh}
                  className={`p-1 text-slate-500 cursor-pointer ${refreshing ? 'animate-spin' : ''}`}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Corpo da Tela Conforme Tab */}
            <div className="flex-1 overflow-y-auto p-3">
              {mobileTab === 'catalogo' && (
                <div className="space-y-3">
                  {/* Busca */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Consultar produto ou preço..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Lista de Produtos (FlatList Simulada) */}
                  <div className="space-y-2">
                    {produtosFiltrados.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between"
                      >
                        <div className="flex-1 pr-2">
                          <div className="font-semibold text-xs text-slate-800 line-clamp-1">
                            {p.descricao}
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono">
                            {p.codigoInterno} · Estoque: {p.estoqueAtual} un
                          </div>
                          <div className="text-xs font-bold text-blue-600 font-mono mt-0.5">
                            R$ {p.precoVenda.toFixed(2)}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAdicionarCarrinho(p)}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                        >
                          + Adicionar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mobileTab === 'novo_cliente' && (
                <form onSubmit={handleSalvarClienteMobile} className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                  {/* Alternância PF / PJ Segmented */}
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setTipoPessoa('F')}
                      className={`flex-1 py-1.5 rounded-md font-bold text-center cursor-pointer ${
                        tipoPessoa === 'F' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'
                      }`}
                    >
                      Pessoa Física
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoPessoa('J')}
                      className={`flex-1 py-1.5 rounded-md font-bold text-center cursor-pointer ${
                        tipoPessoa === 'J' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'
                      }`}
                    >
                      Pessoa Jurídica
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      {tipoPessoa === 'F' ? 'Nome do Cliente' : 'Razão Social'}
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="Nome completo..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      {tipoPessoa === 'F' ? 'CPF' : 'CNPJ'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={tipoPessoa === 'F' ? 11 : 14}
                      value={documento}
                      onChange={(e) => setDocumento(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                      placeholder={tipoPessoa === 'F' ? '12345678901' : '12345678000190'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Cidade</label>
                      <input
                        type="text"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">UF</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={uf}
                        onChange={(e) => setUf(e.target.value.toUpperCase())}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs uppercase font-mono"
                      />
                    </div>
                  </div>

                  {clienteSalvoMsg && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-center text-xs font-semibold">
                      Cliente cadastrado com sucesso!
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                  >
                    Salvar Cliente (Zod Validado)
                  </button>
                </form>
              )}

              {mobileTab === 'carrinho' && (
                <div className="space-y-3">
                  {carrinhoMobile.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Seu pedido mobile está vazio.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {carrinhoMobile.map((item, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-slate-800">{item.produto.descricaoCurta}</div>
                              <div className="text-slate-400 font-mono text-[10px]">
                                {item.qtd}x R$ {item.produto.precoVenda.toFixed(2)}
                              </div>
                            </div>
                            <div className="font-bold text-slate-900 font-mono">
                              R$ {(item.produto.precoVenda * item.qtd).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-sm">
                          <span>Total do Pedido:</span>
                          <span className="font-mono text-emerald-600">R$ {totalCarrinho.toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          alert(`Pedido de R$ ${totalCarrinho.toFixed(2)} transmitido com sucesso ao ERP!`);
                          setCarrinhoMobile([]);
                          setMobileTab('catalogo');
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                      >
                        Enviar Pedido ao ERP
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Tab Bar (Expo Router) */}
            <div className="px-6 py-2.5 bg-white border-t border-slate-200 flex justify-around text-[10px] text-slate-500">
              <button
                onClick={() => setMobileTab('catalogo')}
                className={`flex flex-col items-center gap-1 cursor-pointer ${
                  mobileTab === 'catalogo' ? 'text-blue-600 font-bold' : ''
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Catálogo</span>
              </button>

              <button
                onClick={() => setMobileTab('carrinho')}
                className={`flex flex-col items-center gap-1 cursor-pointer relative ${
                  mobileTab === 'carrinho' ? 'text-blue-600 font-bold' : ''
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Pedido</span>
                {carrinhoMobile.length > 0 && (
                  <span className="absolute -top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                    {carrinhoMobile.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileTab('novo_cliente')}
                className={`flex flex-col items-center gap-1 cursor-pointer ${
                  mobileTab === 'novo_cliente' ? 'text-blue-600 font-bold' : ''
                }`}
              >
                <User className="w-4 h-4" />
                <span>Clientes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
