import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../services/store';
import { Produto, Venda, VendaItem, VendaPagamento, FormaPagamento } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import { CaixaModal, CaixaModalMode } from './CaixaModal';
import {
  Barcode, Search, Trash2, Plus, Minus, CreditCard, Banknote,
  QrCode, User, RefreshCw, AlertTriangle, Check, ShieldAlert,
  ArrowUpRight, ArrowDownLeft, Lock, Unlock, ShoppingBag
} from 'lucide-react';
import { SEED_FORMAS_PAGAMENTO } from '../../data/seedData';

export const PdvScreen: React.FC = () => {
  const store = useAppStore();
  const empresa = store.getEmpresa();
  const produtos = store.getProdutos();
  const clientes = store.getPessoas().filter((p) => p.ehCliente === 'S');
  const caixaAberto = store.getCaixaAberto();
  const isOnline = store.getOnlineStatus();

  // Estados da Venda
  const [carrinho, setCarrinho] = useState<VendaItem[]>([]);
  const [desconto, setDesconto] = useState<number>(0);
  const [clienteCpf, setClienteCpf] = useState<string>('');
  const [clienteNome, setClienteNome] = useState<string>('');
  const [inputBusca, setInputBusca] = useState<string>('');

  // Modais
  const [showPagamentoModal, setShowPagamentoModal] = useState<boolean>(false);
  const [showClienteModal, setShowClienteModal] = useState<boolean>(false);
  const [caixaModalConfig, setCaixaModalConfig] = useState<{ isOpen: boolean; mode: CaixaModalMode }>({
    isOpen: false,
    mode: 'abertura',
  });
  const [vendaConcluida, setVendaConcluida] = useState<Venda | null>(null);

  // Pagamento State
  const [pagamentos, setPagamentos] = useState<VendaPagamento[]>([]);
  const [formaSelecionada, setFormaSelecionada] = useState<FormaPagamento>(SEED_FORMAS_PAGAMENTO[0]);
  const [valorPagamentoInput, setValorPagamentoInput] = useState<string>('');
  const [parcelasInput, setParcelasInput] = useState<number>(1);
  const [valorRecebidoDinheiro, setValorRecebidoDinheiro] = useState<string>('');
  const [isFinalizando, setIsFinalizando] = useState<boolean>(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Totais do carrinho
  const subtotal = carrinho.reduce((sum, item) => sum + item.valorTotal, 0);
  const totalPagar = Math.max(0, subtotal - desconto);
  const totalPago = pagamentos.reduce((sum, p) => sum + p.valor, 0);
  const restantePagar = Math.max(0, totalPagar - totalPago);

  // Troco para dinheiro
  const valorDinheiroTotal = pagamentos
    .filter((p) => p.formaDescricao.toLowerCase().includes('dinheiro'))
    .reduce((sum, p) => sum + p.valor, 0);
  const trocoCalculado = Math.max(
    0,
    (parseFloat(valorRecebidoDinheiro) || 0) - (valorDinheiroTotal || totalPagar)
  );

  // Contagem de vendas pendentes offline
  const vendasPendentesCount = store
    .getVendas()
    .filter((v) => v.statusSync === 'PENDENTE_SYNC').length;

  const handleAdicionarProduto = (produto: Produto, quantidade = 1) => {
    // Snapshot fiscal automático
    const cfop = empresa.crt === 1 ? '5102' : produto.idCfop || '5102';
    const csosn = produto.idCsosn || '102';
    const cstIcms = produto.idCstIcms || '00';
    const aliquotaIcms = empresa.crt === 1 ? 0 : produto.aliquotaIcms || 18;
    const baseIcms = empresa.crt === 1 ? 0 : produto.precoVenda * quantidade;
    const valorIcms = (baseIcms * aliquotaIcms) / 100;

    setCarrinho((prev) => {
      const idx = prev.findIndex((item) => item.idProduto === produto.id);
      if (idx >= 0) {
        const novo = [...prev];
        const novaQtd = novo[idx].quantidade + quantidade;
        const novoTotal = novaQtd * novo[idx].valorUnitario - novo[idx].valorDesconto;
        novo[idx] = {
          ...novo[idx],
          quantidade: novaQtd,
          valorTotal: novoTotal,
          baseIcms: empresa.crt === 1 ? 0 : novoTotal,
          valorIcms: empresa.crt === 1 ? 0 : (novoTotal * aliquotaIcms) / 100,
        };
        return novo;
      }
      return [
        ...prev,
        {
          idProduto: produto.id,
          codigoInterno: produto.codigoInterno,
          descricao: produto.descricao,
          quantidade,
          valorUnitario: produto.precoVenda,
          valorDesconto: 0,
          valorTotal: produto.precoVenda * quantidade,
          cfop,
          cstIcms,
          csosn,
          ncm: produto.idNcm,
          baseIcms,
          aliquotaIcms,
          valorIcms,
        },
      ];
    });

    setInputBusca('');
    barcodeInputRef.current?.focus();
  };

  const handleRemoverItem = (index: number) => {
    setCarrinho((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAlterarQuantidade = (index: number, delta: number) => {
    setCarrinho((prev) => {
      const novo = [...prev];
      const item = novo[index];
      const novaQtd = Math.max(1, item.quantidade + delta);
      const total = novaQtd * item.valorUnitario - item.valorDesconto;
      novo[index] = {
        ...item,
        quantidade: novaQtd,
        valorTotal: total,
        baseIcms: empresa.crt === 1 ? 0 : total,
        valorIcms: empresa.crt === 1 ? 0 : (total * item.aliquotaIcms) / 100,
      };
      return novo;
    });
  };

  const handleScanOrSubmitBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBusca.trim()) return;

    const termo = inputBusca.trim().toLowerCase();
    const encontrado = produtos.find(
      (p) =>
        p.codigoInterno.toLowerCase() === termo ||
        p.codigoBarras.some((b) => b.toLowerCase() === termo) ||
        p.descricao.toLowerCase().includes(termo)
    );

    if (encontrado) {
      handleAdicionarProduto(encontrado, 1);
    } else {
      alert(`Produto "${inputBusca}" não encontrado no catálogo.`);
    }
  };

  const abrirModalPagamento = () => {
    if (carrinho.length === 0) {
      return alert('O carrinho está vazio! Adicione itens antes de prosseguir para o pagamento.');
    }
    if (!caixaAberto) {
      return alert('O Caixa está fechado! Abra o caixa antes de realizar vendas.');
    }
    setPagamentos([]);
    setValorPagamentoInput(totalPagar.toFixed(2));
    setValorRecebidoDinheiro(totalPagar.toFixed(2));
    setShowPagamentoModal(true);
  };

  const handleAdicionarPagamento = () => {
    const valor = parseFloat(valorPagamentoInput) || 0;
    if (valor <= 0) return alert('Informe um valor de pagamento válido.');
    if (valor > restantePagar + 0.01) {
      return alert(`O valor informado excede o saldo restante de R$ ${restantePagar.toFixed(2)}.`);
    }

    const novoPag: VendaPagamento = {
      idFormaPagamento: formaSelecionada.id,
      formaDescricao: formaSelecionada.descricao,
      valor,
      parcelas: parcelasInput,
      troco: formaSelecionada.tipo === 'DINHEIRO' ? trocoCalculado : 0,
      nsu: formaSelecionada.tipo.includes('CARTAO') ? Math.floor(100000 + Math.random() * 900000).toString() : undefined,
    };

    const novosPagamentos = [...pagamentos, novoPag];
    setPagamentos(novosPagamentos);

    const novoTotalPago = novosPagamentos.reduce((acc, p) => acc + p.valor, 0);
    const novoRestante = Math.max(0, totalPagar - novoTotalPago);
    setValorPagamentoInput(novoRestante > 0 ? novoRestante.toFixed(2) : '0.00');
  };

  const handleRemoverPagamento = (index: number) => {
    const filtrados = pagamentos.filter((_, i) => i !== index);
    setPagamentos(filtrados);
    const novoTotalPago = filtrados.reduce((acc, p) => acc + p.valor, 0);
    setValorPagamentoInput((totalPagar - novoTotalPago).toFixed(2));
  };

  const handleFinalizarVenda = async () => {
    if (Math.abs(totalPagar - totalPago) > 0.05) {
      return alert(`O total pago (R$ ${totalPago.toFixed(2)}) não cobre o total da venda (R$ ${totalPagar.toFixed(2)}).`);
    }

    setIsFinalizando(true);
    try {
      const resultado = await store.finalizarVenda({
        venda: {
          idEmpresa: empresa.id,
          idCliente: null,
          nomeCliente: clienteNome || undefined,
          cpfCnpjCliente: clienteCpf || undefined,
          idUsuario: store.getUsuarioLogado().id,
          idCaixa: caixaAberto ? caixaAberto.id : null,
          idNaturezaOperacao: 1, // Venda Consumidor
          serie: '1',
          dataVenda: new Date().toISOString(),
          valorProdutos: subtotal,
          valorDesconto: desconto,
          valorAcrescimo: 0,
          valorTotal: totalPagar,
          itens: carrinho,
          pagamentos,
        },
        emitirNotaFiscal: true,
      });

      setVendaConcluida(resultado.venda);
      setCarrinho([]);
      setDesconto(0);
      setClienteCpf('');
      setClienteNome('');
      setPagamentos([]);
      setShowPagamentoModal(false);
    } catch (err: any) {
      alert(`Falha ao finalizar venda: ${err?.message || err}`);
    } finally {
      setIsFinalizando(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-57px)]">
      {/* Barra de Status do PDV */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>Frente de Caixa 01 · Loja Matriz</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-600">
            <span>Operador:</span>
            <span className="font-semibold text-slate-800">{caixaAberto ? caixaAberto.nomeOperador : 'Nenhum'}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${caixaAberto ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="font-medium text-slate-700">
              {caixaAberto ? `Caixa Aberto (R$ ${caixaAberto.totalVendas.toFixed(2)})` : 'Caixa Fechado'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {vendasPendentesCount > 0 && (
            <button
              onClick={() => store.sincronizarVendasPendentes()}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-amber-50 text-amber-800 border border-amber-300 rounded hover:bg-amber-100 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{vendasPendentesCount} Venda(s) Pendente(s) (Dexie)</span>
            </button>
          )}

          {caixaAberto ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCaixaModalConfig({ isOpen: true, mode: 'suprimento' })}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer"
              >
                + Suprimento
              </button>
              <button
                onClick={() => setCaixaModalConfig({ isOpen: true, mode: 'sangria' })}
                className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 cursor-pointer"
              >
                - Sangria
              </button>
              <button
                onClick={() => setCaixaModalConfig({ isOpen: true, mode: 'fechamento' })}
                className="px-3 py-1 text-xs font-medium text-slate-900 bg-slate-200 rounded hover:bg-slate-300 cursor-pointer"
              >
                Fechar Caixa
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCaixaModalConfig({ isOpen: true, mode: 'abertura' })}
              className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 shadow-xs cursor-pointer"
            >
              Abrir Caixa
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo Principal do PDV: Grid 2 Colunas */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Coluna Esquerda (8 cols): Bipe, Pesquisa e Carrinho */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Caixa de Bipe & Atalhos Rápidos */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-3">
            <form onSubmit={handleScanOrSubmitBusca} className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={inputBusca}
                  onChange={(e) => setInputBusca(e.target.value)}
                  placeholder="Bipe o código de barras (EAN-13), código interno ou digite o nome do produto..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                Adicionar
              </button>
            </form>

            {/* Atalhos Rápidos de Demonstração */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-600 shrink-0">Bipes rápidos de teste:</span>
              {produtos.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAdicionarProduto(p, 1)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap shrink-0 border border-slate-200 cursor-pointer transition-colors"
                >
                  + {p.descricaoCurta} (R$ {p.precoVenda.toFixed(2)})
                </button>
              ))}
            </div>
          </div>

          {/* Tabela do Carrinho */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="font-semibold text-xs uppercase tracking-wider text-slate-700">
                Itens da Venda Atual ({carrinho.length})
              </div>
              {carrinho.length > 0 && (
                <button
                  onClick={() => setCarrinho([])}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar Carrinho
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px]">
              {carrinho.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <Barcode className="w-12 h-12 stroke-[1.25] text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-600">Nenhum item adicionado à venda</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Bipe um código de barras ou selecione um produto acima
                  </p>
                </div>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                      <th className="py-2.5 px-4 font-semibold w-12">#</th>
                      <th className="py-2.5 px-4 font-semibold">Produto / Descrição</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Unitário</th>
                      <th className="py-2.5 px-4 font-semibold text-center w-28">Quantidade</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Total</th>
                      <th className="py-2.5 px-4 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {carrinho.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-400 tabular-nums">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{item.descricao}</div>
                          <div className="text-[11px] text-slate-600 font-mono">
                            Cód: {item.codigoInterno} · NCM: {item.ncm} · CFOP: {item.cfop}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-mono">
                          R$ {item.valorUnitario.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleAlterarQuantidade(idx, -1)}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-bold tabular-nums font-mono">
                              {item.quantidade}
                            </span>
                            <button
                              onClick={() => handleAlterarQuantidade(idx, 1)}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums font-mono">
                          R$ {item.valorTotal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleRemoverItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita (4 cols): Resumo Financeiro, Consumidor e Finalização */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Identificação do Consumidor */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Cliente na Nota
              </span>
              {clienteCpf && (
                <button
                  onClick={() => {
                    setClienteCpf('');
                    setClienteNome('');
                  }}
                  className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                >
                  Remover
                </button>
              )}
            </div>

            {clienteCpf ? (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-0.5">
                <div className="font-semibold text-blue-900">{clienteNome || 'Consumidor'}</div>
                <div className="text-blue-700 font-mono">CPF/CNPJ: {clienteCpf}</div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clienteCpf}
                    onChange={(e) => setClienteCpf(e.target.value)}
                    placeholder="CPF do consumidor (opcional)..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                  <button
                    onClick={() => {
                      if (clientes.length > 0) {
                        setClienteCpf(clientes[0].cpf || '');
                        setClienteNome(clientes[0].nome);
                      }
                    }}
                    className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    Exemplo
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Emitida sem CPF gera NFC-e para consumidor final anônimo.
                </p>
              </div>
            )}
          </div>

          {/* Painel de Totais & Desconto */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal dos Produtos:</span>
                <span className="font-mono tabular-nums">R$ {subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Desconto (R$):</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    max={subtotal}
                    value={desconto}
                    onChange={(e) => setDesconto(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-20 px-2 py-1 text-right text-xs border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="text-xs font-semibold uppercase text-slate-600 mb-1">
                  Total Líquido a Pagar
                </div>
                <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                  R$ {totalPagar.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                disabled={carrinho.length === 0 || !caixaAberto}
                onClick={abrirModalPagamento}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <CreditCard className="w-5 h-5" />
                Receber Pagamento &amp; Emitir (F4)
              </button>

              {!caixaAberto && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 justify-center">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Abra o caixa antes de receber vendas</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Múltiplos Pagamentos */}
      {showPagamentoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-800 text-sm">
                  Recebimento de Venda · Total R$ {totalPagar.toFixed(2)}
                </h3>
              </div>
              <button
                onClick={() => setShowPagamentoModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Seletor de Formas de Pagamento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                  Selecione a Forma
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SEED_FORMAS_PAGAMENTO.slice(0, 4).map((forma) => {
                    const active = formaSelecionada.id === forma.id;
                    return (
                      <button
                        key={forma.id}
                        type="button"
                        onClick={() => {
                          setFormaSelecionada(forma);
                          setParcelasInput(1);
                        }}
                        className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                          active
                            ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {forma.tipo === 'DINHEIRO' && <Banknote className="w-4 h-4 text-emerald-600" />}
                        {forma.tipo === 'PIX' && <QrCode className="w-4 h-4 text-purple-600" />}
                        {forma.tipo.includes('CARTAO') && <CreditCard className="w-4 h-4 text-blue-600" />}
                        <span className="truncate">{forma.descricao.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Valor a Lançar nesta Forma */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Desta Parcela (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={valorPagamentoInput}
                    onChange={(e) => setValorPagamentoInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    placeholder="0.00"
                  />
                </div>

                {formaSelecionada.permiteParcelamento === 'S' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Parcelas no Cartão
                    </label>
                    <select
                      value={parcelasInput}
                      onChange={(e) => setParcelasInput(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    >
                      {[1, 2, 3, 4, 5, 6, 10, 12].map((num) => (
                        <option key={num} value={num}>
                          {num}x de R$ {((parseFloat(valorPagamentoInput) || 0) / num).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formaSelecionada.tipo === 'DINHEIRO' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Valor Entregue pelo Cliente (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={valorRecebidoDinheiro}
                      onChange={(e) => setValorRecebidoDinheiro(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                      placeholder="0.00"
                    />
                    {trocoCalculado > 0 && (
                      <div className="mt-1 text-xs font-bold text-emerald-700">
                        Troco: R$ {trocoCalculado.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAdicionarPagamento}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer transition-colors"
              >
                + Adicionar Este Pagamento (Saldo Restante: R$ {restantePagar.toFixed(2)})
              </button>

              {/* Lista de Pagamentos Lançados */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Pagamentos Adicionados ({pagamentos.length})
                </div>
                {pagamentos.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum pagamento registrado ainda.</p>
                ) : (
                  <div className="space-y-1.5">
                    {pagamentos.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200"
                      >
                        <span className="font-medium text-slate-800">
                          {p.formaDescricao} {p.parcelas > 1 ? `(${p.parcelas}x)` : ''}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900">
                            R$ {p.valor.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleRemoverPagamento(i)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
              <div className="text-xs">
                <span className="text-slate-500">Saldo a Cobrir: </span>
                <span className={`font-mono font-bold ${restantePagar > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  R$ {restantePagar.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPagamentoModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={restantePagar > 0.05 || isFinalizando}
                  onClick={handleFinalizarVenda}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-lg shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {isFinalizando ? 'Emitindo NFC-e...' : 'Concluir Venda & Emitir NFC-e'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cupom Fiscal Impresso */}
      {vendaConcluida && (
        <ReceiptModal
          venda={vendaConcluida}
          empresa={empresa}
          isOpen={!!vendaConcluida}
          onClose={() => setVendaConcluida(null)}
        />
      )}

      {/* Modal de Gestão de Caixa */}
      <CaixaModal
        isOpen={caixaModalConfig.isOpen}
        mode={caixaModalConfig.mode}
        caixaAberto={caixaAberto}
        onClose={() => setCaixaModalConfig({ isOpen: false, mode: 'abertura' })}
      />
    </div>
  );
};
