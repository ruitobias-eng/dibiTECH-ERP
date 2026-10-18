import Dexie, { type Table } from 'dexie';
import { Produto, Venda, Caixa } from '../types';

export interface ProdutoLocalDexie {
  id: number;
  codigoInterno: string;
  codigoBarras: string[];
  descricao: string;
  precoVenda: number;
  estoqueAtual: number;
  cfop: string;
  cstIcms?: string;
  csosn?: string;
  ncm: string;
  aliquotaIcms: number;
}

export interface VendaLocalDexie extends Venda {
  localId: string;
  statusSync: 'PENDENTE_SYNC' | 'SINCRONIZANDO' | 'SINCRONIZADA' | 'CONFLITO_ESTOQUE';
  dataCriacaoLocal: string;
}

export class PdvDexieDatabase extends Dexie {
  produtos!: Table<ProdutoLocalDexie, number>;
  vendas!: Table<VendaLocalDexie, string>;
  caixa!: Table<Caixa, number>;

  constructor() {
    super('pdv_fiscal_brasil_db');
    this.version(1).stores({
      produtos: 'id, codigoInterno, *codigoBarras, descricao',
      vendas: 'localId, statusSync, dataVenda, numero',
      caixa: 'id, status, dataAbertura',
    });
  }
}

export const pdvDb = new PdvDexieDatabase();

/**
 * Inicializa ou atualiza o catálogo de produtos no IndexedDB local para uso offline
 */
export async function sincronizarCatalogoProdutosLocal(produtos: Produto[]): Promise<void> {
  try {
    const formatados: ProdutoLocalDexie[] = produtos.map((p) => ({
      id: p.id,
      codigoInterno: p.codigoInterno,
      codigoBarras: p.codigoBarras || [],
      descricao: p.descricao,
      precoVenda: p.precoVenda,
      estoqueAtual: p.estoqueAtual,
      cfop: p.idCfop,
      cstIcms: p.idCstIcms,
      csosn: p.idCsosn,
      ncm: p.idNcm,
      aliquotaIcms: p.aliquotaIcms || 18,
    }));

    await pdvDb.produtos.clear();
    await pdvDb.produtos.bulkPut(formatados);
  } catch (err) {
    console.error('Falha ao sincronizar catálogo local Dexie:', err);
  }
}
