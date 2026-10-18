/**
 * Core Types for ERP & PDV Fiscal Brasil
 */

export type TipoPessoa = 'F' | 'J';
export type SimNao = 'S' | 'N';
export type CrtEmpresa = 1 | 2 | 3; // 1 = Simples Nacional, 2 = Simples excesso, 3 = Regime Normal

export interface UF {
  sigla: string;
  nome: string;
  codigoIbge: string;
  aliquotaInternaIcms: number;
}

export interface Municipio {
  codigoIbge: string;
  nome: string;
  uf: string;
}

export interface Banco {
  codigo: string;
  nome: string;
}

export interface AgenciaBancaria {
  id: number;
  idBanco: string;
  numero: string;
  digito: string;
  nome: string;
}

export interface ContaCaixa {
  id: number;
  descricao: string;
  tipo: 'C' | 'X'; // C = Corrente, X = Caixa Interno
  idBanco?: string;
  agencia?: string;
  conta?: string;
  saldoInicial: number;
  saldoAtual: number;
}

export interface Empresa {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  crt: CrtEmpresa;
  cnae: string;
  email: string;
  telefone: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  codigoIbgeCidade: string;
  codigoIbgeUf: string;
  // Configuração ACBr
  ambienteSefaz: 'homologacao' | 'producao';
  idCscNfce: string;
  codigoCscNfce: string;
  certificadoValidade: string;
  certificadoNome: string;
}

export interface Endereco {
  id?: number;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  municipioIbge: string;
  principal: SimNao;
  entrega: SimNao;
  cobranca: SimNao;
  correspondencia: SimNao;
}

export interface Telefone {
  id?: number;
  tipo: '0' | '1' | '2'; // 0 = Celular, 1 = Fixo, 2 = Comercial
  numero: string;
  contato?: string;
}

export interface Pessoa {
  id: number;
  tipo: TipoPessoa;
  nome: string; // Razão social ou Nome completo
  email?: string;
  site?: string;
  ehCliente: SimNao;
  ehFornecedor: SimNao;
  ehColaborador: SimNao;
  ehTransportadora: SimNao;
  enderecos: Endereco[];
  telefones: Telefone[];
  // Campos PF
  cpf?: string;
  rg?: string;
  orgaoRg?: string;
  dataEmissaoRg?: string;
  dataNascimento?: string;
  sexo?: 'M' | 'F' | 'O';
  idEstadoCivil?: number;
  idNivelFormacao?: number;
  // Campos PJ
  cnpj?: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  dataConstituicao?: string;
  tipoRegime?: '1' | '2' | '3';
  crt?: '1' | '2' | '3';
  // Vínculos
  limiteCredito?: number;
  idTabelaPreco?: number;
  rntrc?: string;
  prazoPagamentoDias?: number;
  veiculos?: Array<{ placa: string; renavam: string; uf: string; capacidadeKg: number }>;
  motoristas?: Array<{ cnh: string; categoria: string; nome: string; cpf: string }>;
}

export interface GrupoProduto {
  id: number;
  descricao: string;
}

export interface SubgrupoProduto {
  id: number;
  idGrupoProduto: number;
  descricao: string;
}

export interface Marca {
  id: number;
  descricao: string;
}

export interface UnidadeMedida {
  id: number;
  sigla: string;
  descricao: string;
  permiteDecimais: SimNao;
}

export interface Almoxarifado {
  id: number;
  descricao: string;
  padrao: SimNao;
}

export interface Cfop {
  codigo: string;
  descricao: string;
  tipo: 'ENTRADA' | 'SAIDA';
}

export interface Ncm {
  codigo: string;
  descricao: string;
  aliquotaNacional: number;
}

export interface CstIcms {
  codigo: string;
  descricao: string;
}

export interface Csosn {
  codigo: string;
  descricao: string;
}

export interface NaturezaOperacao {
  id: number;
  descricao: string;
  idCfop: string;
  cstIcmsPadrao?: string;
  csosnPadrao?: string;
  tipo: 'SAIDA' | 'ENTRADA';
  movimentaEstoque: SimNao;
  geraFinanceiro: SimNao;
}

export interface SerieFiscal {
  id: number;
  serie: string;
  modelo: '65' | '55' | '59'; // 65 = NFC-e, 55 = NF-e, 59 = SAT
  descricao: string;
  ultimoNumero: number;
  ativa: SimNao;
}

export interface Produto {
  id: number;
  codigoInterno: string;
  codigoBarras: string[];
  descricao: string;
  descricaoCurta: string;
  idGrupoProduto: number;
  idSubgrupoProduto?: number;
  idMarca?: number;
  idUnidadeMedida: number;
  // Fiscal
  idNcm: string;
  idCfop: string;
  idCstIcms?: string;
  idCsosn?: string;
  cstPis?: string;
  cstCofins?: string;
  origemMercadoria: '0' | '1' | '2'; // 0 = Nacional
  aliquotaIcms: number;
  aliquotaPis: number;
  aliquotaCofins: number;
  // Preços
  precoCusto: number;
  margemLucroPercentual: number;
  precoVenda: number;
  precoAtacado?: number;
  // Estoque
  estoqueMinimo: number;
  estoqueMaximo: number;
  estoqueAtual: number;
  ativo: SimNao;
  controlarEstoque: SimNao;
  imagemUrl?: string;
}

export interface TabelaPreco {
  id: number;
  descricao: string;
  percentualAjuste: number; // e.g. -10 para 10% de desconto
  padrao: SimNao;
}

export interface MovimentoEstoqueItem {
  idProduto: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export interface MovimentoEstoque {
  id: number;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  origem: 'VENDA' | 'COMPRA' | 'AJUSTE_INVENTARIO' | 'AVULSO';
  idOrigem?: number;
  dataMovimento: string;
  observacao?: string;
  itens: MovimentoEstoqueItem[];
}

export interface InventarioItem {
  idProduto: number;
  descricao: string;
  estoqueSistema: number;
  estoqueFisico: number;
  divergencia: number;
}

export interface Inventario {
  id: number;
  dataAbertura: string;
  dataFechamento?: string;
  status: 'ABERTO' | 'CONCLUIDO';
  idAlmoxarifado: number;
  itens: InventarioItem[];
  observacao?: string;
}

export interface FormaPagamento {
  id: number;
  descricao: string;
  tipo: 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'BOLETO' | 'CREDIARIO';
  permiteTroco: SimNao;
  permiteParcelamento: SimNao;
  maxParcelas: number;
}

export interface CondicaoPagamento {
  id: number;
  descricao: string;
  diasIntervalo: number[];
}

export interface Caixa {
  id: number;
  idUsuario: number;
  nomeOperador: string;
  dataAbertura: string;
  dataFechamento?: string;
  valorAbertura: number;
  valorFechamento?: number;
  status: 'ABERTO' | 'FECHADO';
  totalVendas: number;
  totalDinheiro: number;
  totalCartao: number;
  totalPix: number;
  totalSangrias: number;
  totalSuprimentos: number;
}

export interface CaixaMovimento {
  id: number;
  idCaixa: number;
  tipo: 'SANGRIA' | 'SUPRIMENTO';
  valor: number;
  motivo: string;
  dataHora: string;
}

export interface VendaItem {
  id?: number;
  idProduto: number;
  codigoInterno: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
  valorTotal: number;
  // Snapshot fiscal
  cfop: string;
  cstIcms?: string;
  csosn?: string;
  ncm: string;
  baseIcms: number;
  aliquotaIcms: number;
  valorIcms: number;
}

export interface VendaPagamento {
  idFormaPagamento: number;
  formaDescricao: string;
  valor: number;
  parcelas: number;
  troco?: number;
  nsu?: string;
  autorizacao?: string;
  bandeira?: string;
}

export interface Venda {
  id: number;
  localId?: string; // Para offline sync
  numero: number;
  serie: string;
  idEmpresa: number;
  idCliente?: number | null;
  nomeCliente?: string;
  cpfCnpjCliente?: string;
  idUsuario: number;
  idCaixa?: number | null;
  idNaturezaOperacao: number;
  dataVenda: string;
  valorProdutos: number;
  valorDesconto: number;
  valorAcrescimo: number;
  valorTotal: number;
  status: 'CONCLUIDA' | 'CANCELADA' | 'PENDENTE_SYNC' | 'CONFLITO_ESTOQUE';
  statusSync?: 'PENDENTE_SYNC' | 'SINCRONIZANDO' | 'SINCRONIZADA' | 'CONFLITO_ESTOQUE';
  observacao?: string;
  itens: VendaItem[];
  pagamentos: VendaPagamento[];
  chaveAcessoNfe?: string;
  protocoloNfe?: string;
  xmlNfce?: string;
}

export interface NotaFiscal {
  id: number;
  idVenda?: number;
  modelo: '65' | '55'; // 65 = NFC-e, 55 = NF-e
  serie: string;
  numero: number;
  chaveAcesso: string;
  dataEmissao: string;
  valorTotal: number;
  destinatario: string;
  status: 'AUTORIZADA' | 'CANCELADA' | 'REJEITADA' | 'PENDENTE';
  protocoloAutorizacao?: string;
  motivo?: string;
  xmlEnviado?: string;
  xmlRetorno?: string;
}

export interface PedidoCompraItem {
  idProduto: number;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
}

export interface PedidoCompra {
  id: number;
  numero: number;
  idFornecedor: number;
  nomeFornecedor: string;
  dataPedido: string;
  previsaoEntrega: string;
  valorTotal: number;
  status: 'COTACAO' | 'APROVADO' | 'FATURADO' | 'CANCELADO';
  itens: PedidoCompraItem[];
}

export interface Compra {
  id: number;
  numeroNota: string;
  serieNota: string;
  chaveAcesso?: string;
  idFornecedor: number;
  nomeFornecedor: string;
  dataEmissao: string;
  dataEntrada: string;
  valorProdutos: number;
  valorFrete: number;
  valorTotal: number;
  itens: Array<{
    idProduto: number;
    descricao: string;
    quantidade: number;
    precoCusto: number;
    subtotal: number;
  }>;
}

export interface Cargo {
  id: number;
  nome: string;
  cbo: string;
  salarioBase: number;
}

export interface Setor {
  id: number;
  nome: string;
}

export interface Papel {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
}

export interface Colaborador {
  id: number;
  idPessoa: number;
  nome: string;
  cpf: string;
  idCargo: number;
  idSetor: number;
  matricula: string;
  dataAdmissao: string;
  ativo: SimNao;
}

export interface Usuario {
  id: number;
  idColaborador?: number;
  nome: string;
  login: string;
  papel: string;
  administrador: SimNao;
  ativo: SimNao;
}

export interface PermissaoMatriz {
  recurso: string;
  nomeRecurso: string;
  visualizar: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
  especial?: {
    nome: string;
    concedida: boolean;
  };
}
