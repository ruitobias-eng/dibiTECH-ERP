import { useState, useEffect } from 'react';
import {
  Empresa, Produto, Pessoa, Venda, Caixa, CaixaMovimento,
  MovimentoEstoque, NotaFiscal, Compra, PedidoCompra, Usuario,
  PermissaoMatriz, Cargo, Setor, Papel, Cfop, Ncm, NaturezaOperacao,
  SerieFiscal
} from '../types';
import {
  SEED_EMPRESA, SEED_PRODUTOS, SEED_PESSOAS, SEED_CFOPS,
  SEED_NCMS, SEED_NATUREZAS_OPERACAO, SEED_SERIES_FISCAIS,
  SEED_CARGOS, SEED_SETORES, SEED_PAPEIS, SEED_USUARIOS,
  SEED_CAIXA_ABERTO
} from '../data/seedData';
import { gerarChaveAcesso, gerarPayloadAcbrIni, gerarXmlNfce } from './fiscalEngine';
import { pdvDb, sincronizarCatalogoProdutosLocal } from '../db/dexieDb';

const STORAGE_KEY_PREFIX = 'erp_pdv_brasil_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Erro ao salvar ${key} no localStorage:`, err);
  }
}

// Initial state
let currentEmpresa: Empresa = loadFromStorage('empresa', SEED_EMPRESA);
let currentProdutos: Produto[] = loadFromStorage('produtos', SEED_PRODUTOS);
let currentPessoas: Pessoa[] = loadFromStorage('pessoas', SEED_PESSOAS);
let currentVendas: Venda[] = loadFromStorage('vendas', []);
let currentCaixas: Caixa[] = loadFromStorage('caixas', [SEED_CAIXA_ABERTO]);
let currentMovimentosCaixa: CaixaMovimento[] = loadFromStorage('movimentos_caixa', []);
let currentMovimentosEstoque: MovimentoEstoque[] = loadFromStorage('movimentos_estoque', []);
let currentNotasFiscais: NotaFiscal[] = loadFromStorage('notas_fiscais', []);
let currentCompras: Compra[] = loadFromStorage('compras', []);
let currentUsuarios: Usuario[] = loadFromStorage('usuarios', SEED_USUARIOS);
let currentUsuarioLogado: Usuario = currentUsuarios[0];
let currentOnline: boolean = true;

// Default initial sales if empty for immediate visibility
if (currentVendas.length === 0) {
  const dataOntem = new Date(Date.now() - 3600000 * 4);
  const chave1 = gerarChaveAcesso('35', dataOntem, currentEmpresa.cnpj, '65', '1', 101);
  const venda1: Venda = {
    id: 1,
    numero: 101,
    serie: '1',
    idEmpresa: 1,
    idCliente: 1,
    nomeCliente: 'Carlos Eduardo Mendes da Silva',
    cpfCnpjCliente: '12345678901',
    idUsuario: 2,
    idCaixa: 101,
    idNaturezaOperacao: 1,
    dataVenda: dataOntem.toISOString(),
    valorProdutos: 114.00,
    valorDesconto: 0,
    valorAcrescimo: 0,
    valorTotal: 114.00,
    status: 'CONCLUIDA',
    statusSync: 'SINCRONIZADA',
    chaveAcessoNfe: chave1,
    protocoloNfe: '135260000889912',
    itens: [
      {
        id: 1,
        idProduto: 1,
        codigoInterno: 'LOG-K120',
        descricao: 'Teclado USB Logitech K120 ABNT2 Resistente a Respingos',
        quantidade: 1,
        valorUnitario: 79.00,
        valorDesconto: 0,
        valorTotal: 79.00,
        cfop: '5102',
        csosn: '102',
        ncm: '8471.60.52',
        baseIcms: 79.00,
        aliquotaIcms: 18,
        valorIcms: 14.22,
      },
      {
        id: 2,
        idProduto: 2,
        codigoInterno: 'LOG-M90',
        descricao: 'Mouse Óptico Logitech M90 USB 1000 DPI Preto',
        quantidade: 1,
        valorUnitario: 35.00,
        valorDesconto: 0,
        valorTotal: 35.00,
        cfop: '5102',
        csosn: '102',
        ncm: '8471.60.53',
        baseIcms: 35.00,
        aliquotaIcms: 18,
        valorIcms: 6.30,
      },
    ],
    pagamentos: [
      { idFormaPagamento: 2, formaDescricao: 'PIX Instantâneo', valor: 114.00, parcelas: 1 },
    ],
  };

  currentVendas = [venda1];
  saveToStorage('vendas', currentVendas);

  currentNotasFiscais = [
    {
      id: 1,
      idVenda: 1,
      modelo: '65',
      serie: '1',
      numero: 101,
      chaveAcesso: chave1,
      dataEmissao: dataOntem.toISOString(),
      valorTotal: 114.00,
      destinatario: 'Carlos Eduardo Mendes da Silva (123.456.789-01)',
      status: 'AUTORIZADA',
      protocoloAutorizacao: '135260000889912',
      motivo: 'Autorizado o uso da NF-e',
      xmlEnviado: gerarXmlNfce(venda1, currentEmpresa, chave1),
    },
  ];
  saveToStorage('notas_fiscais', currentNotasFiscais);
}

// Initial sync to Dexie
sincronizarCatalogoProdutosLocal(currentProdutos);

// Listeners for reactive updates
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export const appStore = {
  getEmpresa: () => currentEmpresa,
  updateEmpresa: (empresa: Empresa) => {
    currentEmpresa = empresa;
    saveToStorage('empresa', currentEmpresa);
    notify();
  },

  getProdutos: () => currentProdutos,
  getProdutoById: (id: number) => currentProdutos.find((p) => p.id === id),
  saveProduto: (produto: Produto) => {
    const idx = currentProdutos.findIndex((p) => p.id === produto.id);
    if (idx >= 0) {
      currentProdutos[idx] = produto;
    } else {
      currentProdutos.push({ ...produto, id: Date.now() });
    }
    saveToStorage('produtos', currentProdutos);
    sincronizarCatalogoProdutosLocal(currentProdutos);
    notify();
  },
  deleteProduto: (id: number) => {
    currentProdutos = currentProdutos.filter((p) => p.id !== id);
    saveToStorage('produtos', currentProdutos);
    sincronizarCatalogoProdutosLocal(currentProdutos);
    notify();
  },

  getPessoas: () => currentPessoas,
  savePessoa: (pessoa: Pessoa) => {
    const idx = currentPessoas.findIndex((p) => p.id === pessoa.id);
    if (idx >= 0) {
      currentPessoas[idx] = pessoa;
    } else {
      currentPessoas.push({ ...pessoa, id: Date.now() });
    }
    saveToStorage('pessoas', currentPessoas);
    notify();
  },
  deletePessoa: (id: number) => {
    currentPessoas = currentPessoas.filter((p) => p.id !== id);
    saveToStorage('pessoas', currentPessoas);
    notify();
  },

  getVendas: () => currentVendas,
  getCaixas: () => currentCaixas,
  getCaixaAberto: () => currentCaixas.find((c) => c.status === 'ABERTO'),
  getMovimentosCaixa: () => currentMovimentosCaixa,
  getMovimentosEstoque: () => currentMovimentosEstoque,
  getNotasFiscais: () => currentNotasFiscais,
  getCompras: () => currentCompras,
  getUsuarios: () => currentUsuarios,
  getUsuarioLogado: () => currentUsuarioLogado,
  setUsuarioLogado: (u: Usuario) => {
    currentUsuarioLogado = u;
    notify();
  },

  getOnlineStatus: () => currentOnline,
  toggleOnlineStatus: () => {
    currentOnline = !currentOnline;
    notify();
    if (currentOnline) {
      appStore.sincronizarVendasPendentes();
    }
  },

  /**
   * Transação de Venda:
   * 1. Deduz estoque dos produtos
   * 2. Gera MovimentoEstoque de SAÍDA
   * 3. Registra na tabela de vendas
   * 4. Gera NFC-e (Chave de 44 dígitos + XML + ACBr INI)
   * 5. Alimenta totais do Caixa aberto
   * 6. Se offline, salva no Dexie como PENDENTE_SYNC
   */
  finalizarVenda: async (dados: {
    venda: Omit<Venda, 'id' | 'numero' | 'chaveAcessoNfe' | 'protocoloNfe' | 'status'>;
    emitirNotaFiscal?: boolean;
  }): Promise<{ venda: Venda; nota?: NotaFiscal; offline: boolean }> => {
    const isOnline = currentOnline;
    const proxNumero = (currentVendas.length > 0 ? Math.max(...currentVendas.map((v) => v.numero)) : 100) + 1;
    const dataVenda = new Date();
    const chaveAcesso = gerarChaveAcesso(
      currentEmpresa.codigoIbgeUf || '35',
      dataVenda,
      currentEmpresa.cnpj,
      '65',
      dados.venda.serie || '1',
      proxNumero
    );

    // Deduz estoque
    dados.venda.itens.forEach((item) => {
      const prod = currentProdutos.find((p) => p.id === item.idProduto);
      if (prod && prod.controlarEstoque === 'S') {
        prod.estoqueAtual = Math.max(0, prod.estoqueAtual - item.quantidade);
      }
    });
    saveToStorage('produtos', currentProdutos);
    sincronizarCatalogoProdutosLocal(currentProdutos);

    // Cria registro de venda
    const novaVenda: Venda = {
      ...dados.venda,
      id: Date.now(),
      numero: proxNumero,
      status: isOnline ? 'CONCLUIDA' : 'PENDENTE_SYNC',
      statusSync: isOnline ? 'SINCRONIZADA' : 'PENDENTE_SYNC',
      chaveAcessoNfe: chaveAcesso,
      protocoloNfe: isOnline ? `1352600${Math.floor(1000000 + Math.random() * 9000000)}` : undefined,
    };

    // Gera XML
    novaVenda.xmlNfce = gerarXmlNfce(novaVenda, currentEmpresa, chaveAcesso);

    // Movimento de estoque
    const movEstoque: MovimentoEstoque = {
      id: Date.now(),
      tipo: 'SAIDA',
      origem: 'VENDA',
      idOrigem: novaVenda.id,
      dataMovimento: dataVenda.toISOString(),
      observacao: `Venda NFC-e Nº ${novaVenda.numero} - Série ${novaVenda.serie}`,
      itens: novaVenda.itens.map((i) => ({
        idProduto: i.idProduto,
        descricao: i.descricao,
        quantidade: i.quantidade,
        valorUnitario: i.valorUnitario,
      })),
    };
    currentMovimentosEstoque.unshift(movEstoque);
    saveToStorage('movimentos_estoque', currentMovimentosEstoque);

    // Atualiza Caixa se houver aberto
    const caixaAberto = currentCaixas.find((c) => c.status === 'ABERTO');
    if (caixaAberto) {
      caixaAberto.totalVendas += novaVenda.valorTotal;
      novaVenda.pagamentos.forEach((p) => {
        const desc = p.formaDescricao.toLowerCase();
        if (desc.includes('dinheiro')) caixaAberto.totalDinheiro += p.valor - (p.troco || 0);
        else if (desc.includes('pix')) caixaAberto.totalPix += p.valor;
        else caixaAberto.totalCartao += p.valor;
      });
      saveToStorage('caixas', currentCaixas);
    }

    // Salva Nota Fiscal
    let notaGerada: NotaFiscal | undefined;
    if (dados.emitirNotaFiscal !== false) {
      notaGerada = {
        id: Date.now(),
        idVenda: novaVenda.id,
        modelo: '65',
        serie: novaVenda.serie,
        numero: novaVenda.numero,
        chaveAcesso,
        dataEmissao: dataVenda.toISOString(),
        valorTotal: novaVenda.valorTotal,
        destinatario: novaVenda.cpfCnpjCliente ? `${novaVenda.nomeCliente || 'Consumidor'} (${novaVenda.cpfCnpjCliente})` : 'Consumidor Final',
        status: isOnline ? 'AUTORIZADA' : 'PENDENTE',
        protocoloAutorizacao: novaVenda.protocoloNfe,
        motivo: isOnline ? 'Autorizado o uso da NF-e / NFC-e' : 'Emissão em contingência offline (pendente de transmissão)',
        xmlEnviado: novaVenda.xmlNfce,
      };
      currentNotasFiscais.unshift(notaGerada);
      saveToStorage('notas_fiscais', currentNotasFiscais);
    }

    currentVendas.unshift(novaVenda);
    saveToStorage('vendas', currentVendas);

    // Salva no Dexie
    try {
      await pdvDb.vendas.put({
        ...novaVenda,
        localId: novaVenda.localId || `local-${novaVenda.id}`,
        statusSync: novaVenda.statusSync || 'SINCRONIZADA',
        dataCriacaoLocal: dataVenda.toISOString(),
      });
    } catch (e) {
      console.warn('Dexie write error:', e);
    }

    notify();
    return { venda: novaVenda, nota: notaGerada, offline: !isOnline };
  },

  /**
   * Sincronização offline-first: envia vendas pendentes para a base central
   */
  sincronizarVendasPendentes: async () => {
    let sincronizadas = 0;
    currentVendas = currentVendas.map((v) => {
      if (v.statusSync === 'PENDENTE_SYNC') {
        sincronizadas++;
        return {
          ...v,
          status: 'CONCLUIDA',
          statusSync: 'SINCRONIZADA',
          protocoloNfe: v.protocoloNfe || `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
        };
      }
      return v;
    });

    currentNotasFiscais = currentNotasFiscais.map((nf) => {
      if (nf.status === 'PENDENTE') {
        return {
          ...nf,
          status: 'AUTORIZADA',
          motivo: 'Autorizado o uso da NF-e (sincronizada pós-offline)',
          protocoloAutorizacao: nf.protocoloAutorizacao || `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
        };
      }
      return nf;
    });

    saveToStorage('vendas', currentVendas);
    saveToStorage('notas_fiscais', currentNotasFiscais);
    notify();
    return sincronizadas;
  },

  cancelarVenda: (idVenda: number, motivo: string) => {
    const venda = currentVendas.find((v) => v.id === idVenda);
    if (!venda || venda.status === 'CANCELADA') return false;

    // Estorna estoque
    venda.itens.forEach((item) => {
      const p = currentProdutos.find((prod) => prod.id === item.idProduto);
      if (p) p.estoqueAtual += item.quantidade;
    });
    saveToStorage('produtos', currentProdutos);

    // Registra movimento de estorno
    const movEstorno: MovimentoEstoque = {
      id: Date.now(),
      tipo: 'ENTRADA',
      origem: 'AVULSO',
      idOrigem: venda.id,
      dataMovimento: new Date().toISOString(),
      observacao: `Estorno de Estoque - Venda Cancelada Nº ${venda.numero}: ${motivo}`,
      itens: venda.itens.map((i) => ({
        idProduto: i.idProduto,
        descricao: i.descricao,
        quantidade: i.quantidade,
        valorUnitario: i.valorUnitario,
      })),
    };
    currentMovimentosEstoque.unshift(movEstorno);
    saveToStorage('movimentos_estoque', currentMovimentosEstoque);

    // Atualiza status da venda e nota
    venda.status = 'CANCELADA';
    venda.observacao = `CANCELADA: ${motivo}`;
    saveToStorage('vendas', currentVendas);

    const nota = currentNotasFiscais.find((nf) => nf.idVenda === idVenda);
    if (nota) {
      nota.status = 'CANCELADA';
      nota.motivo = `Cancelamento homologado SEFAZ: ${motivo}`;
      saveToStorage('notas_fiscais', currentNotasFiscais);
    }

    notify();
    return true;
  },

  abrirCaixa: (valorInicial: number, nomeOperador: string) => {
    const novoCaixa: Caixa = {
      id: Date.now(),
      idUsuario: currentUsuarioLogado.id,
      nomeOperador,
      dataAbertura: new Date().toISOString(),
      valorAbertura: valorInicial,
      status: 'ABERTO',
      totalVendas: 0,
      totalDinheiro: 0,
      totalCartao: 0,
      totalPix: 0,
      totalSangrias: 0,
      totalSuprimentos: valorInicial,
    };
    currentCaixas.unshift(novoCaixa);
    saveToStorage('caixas', currentCaixas);
    notify();
    return novoCaixa;
  },

  fecharCaixa: (idCaixa: number, valoresContados: { dinheiro: number; cartao: number; pix: number }) => {
    const cx = currentCaixas.find((c) => c.id === idCaixa);
    if (!cx) return;
    cx.status = 'FECHADO';
    cx.dataFechamento = new Date().toISOString();
    cx.valorFechamento = valoresContados.dinheiro + valoresContados.cartao + valoresContados.pix;
    saveToStorage('caixas', currentCaixas);
    notify();
  },

  registrarMovimentoCaixa: (tipo: 'SANGRIA' | 'SUPRIMENTO', valor: number, motivo: string) => {
    const cx = currentCaixas.find((c) => c.status === 'ABERTO');
    if (!cx) return;

    const mov: CaixaMovimento = {
      id: Date.now(),
      idCaixa: cx.id,
      tipo,
      valor,
      motivo,
      dataHora: new Date().toISOString(),
    };
    currentMovimentosCaixa.unshift(mov);
    saveToStorage('movimentos_caixa', currentMovimentosCaixa);

    if (tipo === 'SANGRIA') {
      cx.totalSangrias += valor;
    } else {
      cx.totalSuprimentos += valor;
    }
    saveToStorage('caixas', currentCaixas);
    notify();
  },

  registrarEntradaCompra: (compra: Compra) => {
    currentCompras.unshift(compra);
    saveToStorage('compras', currentCompras);

    // Atualiza estoque e custo médio
    compra.itens.forEach((item) => {
      const p = currentProdutos.find((prod) => prod.id === item.idProduto);
      if (p) {
        p.estoqueAtual += item.quantidade;
        p.precoCusto = item.precoCusto; // Atualiza custo
      }
    });
    saveToStorage('produtos', currentProdutos);

    const mov: MovimentoEstoque = {
      id: Date.now(),
      tipo: 'ENTRADA',
      origem: 'COMPRA',
      idOrigem: compra.id,
      dataMovimento: new Date().toISOString(),
      observacao: `Entrada NF-e Fornecedor ${compra.nomeFornecedor} - Doc ${compra.numeroNota}/${compra.serieNota}`,
      itens: compra.itens.map((i) => ({
        idProduto: i.idProduto,
        descricao: i.descricao,
        quantidade: i.quantidade,
        valorUnitario: i.precoCusto,
      })),
    };
    currentMovimentosEstoque.unshift(mov);
    saveToStorage('movimentos_estoque', currentMovimentosEstoque);
    notify();
  },

  registrarAjusteInventario: (itens: Array<{ idProduto: number; descricao: string; divergencia: number; estoqueFisico: number }>) => {
    itens.forEach((it) => {
      const p = currentProdutos.find((prod) => prod.id === it.idProduto);
      if (p) {
        p.estoqueAtual = it.estoqueFisico;
      }
    });
    saveToStorage('produtos', currentProdutos);

    const mov: MovimentoEstoque = {
      id: Date.now(),
      tipo: 'AJUSTE',
      origem: 'AJUSTE_INVENTARIO',
      dataMovimento: new Date().toISOString(),
      observacao: 'Ajuste Geral de Inventário Físico do Almoxarifado',
      itens: itens.map((i) => ({
        idProduto: i.idProduto,
        descricao: i.descricao,
        quantidade: Math.abs(i.divergencia),
        valorUnitario: 0,
      })),
    };
    currentMovimentosEstoque.unshift(mov);
    saveToStorage('movimentos_estoque', currentMovimentosEstoque);
    notify();
  },
};

/**
 * React hook para assinar o appStore
 */
export function useAppStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return appStore;
}
