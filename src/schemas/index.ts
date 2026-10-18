import { z } from 'zod';

/**
 * Shared Zod Schemas for ERP & PDV Fiscal Brasil
 * Usado tanto no frontend quanto validadores de API NestJS
 */

// 1. PRODUTO SCHEMA
export const ProdutoSchema = z.object({
  id: z.number().int().positive().optional(),
  idEmpresa: z.number().int().positive().default(1),
  idGrupoProduto: z.number().int().positive({ message: 'Selecione o Grupo de Produto' }),
  idSubgrupoProduto: z.number().int().positive().nullable().optional(),
  idMarca: z.number().int().positive().nullable().optional(),
  idUnidadeMedida: z.number().int().positive({ message: 'Selecione a Unidade de Medida' }),
  idNcm: z.string().min(8, 'NCM deve conter 8 dígitos').max(10),
  idCfop: z.string().length(4, 'CFOP deve conter 4 dígitos'),
  idCstIcms: z.string().nullable().optional(),
  idCsosn: z.string().nullable().optional(),
  cstPis: z.string().default('01'),
  cstCofins: z.string().default('01'),
  origemMercadoria: z.enum(['0', '1', '2']).default('0'),
  codigoInterno: z.string().min(1, 'Código interno obrigatório').max(30),
  codigoBarras: z.array(z.string()).default([]),
  descricao: z.string().min(3, 'Descrição deve ter ao menos 3 caracteres').max(120),
  descricaoCurta: z.string().max(60).default(''),
  precoCusto: z.number().nonnegative('Preço de custo não pode ser negativo'),
  margemLucroPercentual: z.number().default(40),
  precoVenda: z.number().positive('Preço de venda deve ser maior que zero'),
  precoAtacado: z.number().positive().optional(),
  estoqueMinimo: z.number().int().nonnegative('Estoque mínimo deve ser >= 0'),
  estoqueMaximo: z.number().int().nonnegative('Estoque máximo deve ser >= 0'),
  estoqueAtual: z.number().default(0),
  aliquotaIcms: z.number().nonnegative().default(18),
  aliquotaPis: z.number().nonnegative().default(1.65),
  aliquotaCofins: z.number().nonnegative().default(7.60),
  ativo: z.enum(['S', 'N']).default('S'),
  controlarEstoque: z.enum(['S', 'N']).default('S'),
});

export type ProdutoInput = z.infer<typeof ProdutoSchema>;

// 2. ENDEREÇO & TELEFONE
export const EnderecoSchema = z.object({
  id: z.number().int().positive().optional(),
  logradouro: z.string().min(3, 'Logradouro muito curto').max(120),
  numero: z.string().min(1, 'Número é obrigatório').max(10),
  complemento: z.string().max(60).optional(),
  bairro: z.string().min(2, 'Bairro obrigatório').max(60),
  cidade: z.string().min(2, 'Cidade obrigatória').max(60),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos numéricos'),
  municipioIbge: z.string().length(7, 'Código IBGE do município deve ter 7 dígitos'),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
  principal: z.enum(['S', 'N']).default('S'),
  entrega: z.enum(['S', 'N']).default('N'),
  cobranca: z.enum(['S', 'N']).default('N'),
  correspondencia: z.enum(['S', 'N']).default('N'),
});

export const TelefoneSchema = z.object({
  id: z.number().int().positive().optional(),
  tipo: z.enum(['0', '1', '2']), // 0=celular, 1=residencial, 2=comercial
  numero: z.string().regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos numéricos'),
  contato: z.string().optional(),
});

// 3. PESSOA SCHEMA (PF / PJ COM DISCRIMINATED UNION)
const PessoaBaseSchema = z.object({
  id: z.number().int().positive().optional(),
  nome: z.string().min(3, 'Nome ou Razão Social deve ter ao menos 3 caracteres').max(120),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  site: z.string().url('URL inválida').optional().or(z.literal('')),
  ehCliente: z.enum(['S', 'N']).default('N'),
  ehFornecedor: z.enum(['S', 'N']).default('N'),
  ehColaborador: z.enum(['S', 'N']).default('N'),
  ehTransportadora: z.enum(['S', 'N']).default('N'),
  limiteCredito: z.number().nonnegative().optional(),
  idTabelaPreco: z.number().int().positive().optional(),
  rntrc: z.string().optional(),
  prazoPagamentoDias: z.number().int().optional(),
  enderecos: z.array(EnderecoSchema).min(1, 'Pessoa deve ter ao menos 1 endereço'),
  telefones: z.array(TelefoneSchema).default([]),
});

export const PessoaFisicaSchema = PessoaBaseSchema.extend({
  tipo: z.literal('F'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos numéricos'),
  rg: z.string().max(20).optional(),
  orgaoRg: z.string().max(20).optional(),
  dataEmissaoRg: z.string().optional(),
  dataNascimento: z.string().min(10, 'Data de nascimento obrigatória'),
  sexo: z.enum(['M', 'F', 'O']).default('M'),
  idEstadoCivil: z.number().int().positive().default(1),
  idNivelFormacao: z.number().int().positive().default(1),
});

export const PessoaJuridicaSchema = PessoaBaseSchema.extend({
  tipo: z.literal('J'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos numéricos'),
  nomeFantasia: z.string().min(2, 'Nome Fantasia obrigatório').max(120),
  inscricaoMunicipal: z.string().max(20).optional(),
  inscricaoEstadual: z.string().max(20).optional(),
  dataConstituicao: z.string().min(10, 'Data de constituição obrigatória'),
  tipoRegime: z.enum(['1', '2', '3']).default('1'), // 1=Simples, 2=Simples excesso, 3=Normal
  crt: z.enum(['1', '2', '3']).default('1'),
});

export const PessoaSchema = z.discriminatedUnion('tipo', [
  PessoaFisicaSchema,
  PessoaJuridicaSchema,
]);

export type PessoaInput = z.infer<typeof PessoaSchema>;
export type PessoaFisicaInput = z.infer<typeof PessoaFisicaSchema>;
export type PessoaJuridicaInput = z.infer<typeof PessoaJuridicaSchema>;

// 4. VENDA & PAGAMENTO
export const VendaItemSchema = z.object({
  idProduto: z.number().int().positive('Produto obrigatório'),
  codigoInterno: z.string(),
  descricao: z.string(),
  quantidade: z.number().positive('Quantidade deve ser positiva'),
  valorUnitario: z.number().positive('Preço unitário deve ser positivo'),
  valorDesconto: z.number().nonnegative().default(0),
  valorTotal: z.number().positive(),
  cfop: z.string().length(4),
  cstIcms: z.string().optional().nullable(),
  csosn: z.string().optional().nullable(),
  ncm: z.string(),
  baseIcms: z.number().default(0),
  aliquotaIcms: z.number().default(0),
  valorIcms: z.number().default(0),
});

export const VendaPagamentoSchema = z.object({
  idFormaPagamento: z.number().int().positive('Selecione a forma de pagamento'),
  formaDescricao: z.string(),
  valor: z.number().positive('Valor do pagamento deve ser maior que zero'),
  parcelas: z.number().int().min(1).max(24).default(1),
  troco: z.number().nonnegative().default(0),
  nsu: z.string().max(30).optional(),
  autorizacao: z.string().max(30).optional(),
  bandeira: z.string().max(30).optional(),
});

export const VendaSchema = z.object({
  idEmpresa: z.number().int().positive().default(1),
  idCliente: z.number().int().positive().nullable().optional(),
  nomeCliente: z.string().optional(),
  cpfCnpjCliente: z.string().optional(),
  idUsuario: z.number().int().positive().default(1),
  idCaixa: z.number().int().positive().nullable().optional(),
  idNaturezaOperacao: z.number().int().positive().default(1),
  idCondicaoPagamento: z.number().int().positive().nullable().optional(),
  serie: z.string().min(1).max(3).default('1'),
  observacao: z.string().max(1000).optional(),
  valorProdutos: z.number().nonnegative(),
  valorDesconto: z.number().nonnegative().default(0),
  valorAcrescimo: z.number().nonnegative().default(0),
  valorTotal: z.number().positive('Total da venda deve ser maior que zero'),
  itens: z.array(VendaItemSchema).min(1, 'A venda deve possuir ao menos 1 item'),
  pagamentos: z.array(VendaPagamentoSchema).min(1, 'A venda deve possuir ao menos 1 pagamento'),
  emitirNotaFiscal: z.boolean().default(true),
}).refine((data) => {
  const totalLiquido = data.valorProdutos - data.valorDesconto + data.valorAcrescimo;
  const totalPago = data.pagamentos.reduce((acc, p) => acc + p.valor, 0);
  // Tolerância de 2 centavos para arredondamentos
  return Math.abs(totalLiquido - totalPago) <= 0.05;
}, {
  message: 'A soma dos pagamentos não cobre o valor líquido total da venda',
  path: ['pagamentos'],
});

export type VendaInput = z.infer<typeof VendaSchema>;

// 5. CAIXA & MOVIMENTAÇÃO
export const AberturaCaixaSchema = z.object({
  idUsuario: z.number().int().positive(),
  nomeOperador: z.string().min(2),
  valorAbertura: z.number().nonnegative('Valor de suprimento inicial não pode ser negativo'),
});

export const FechamentoCaixaSchema = z.object({
  idCaixa: z.number().int().positive(),
  valorDinheiroContado: z.number().nonnegative(),
  valorCartaoContado: z.number().nonnegative(),
  valorPixContado: z.number().nonnegative(),
  observacao: z.string().optional(),
});

export const MovimentoCaixaSchema = z.object({
  idCaixa: z.number().int().positive(),
  tipo: z.enum(['SANGRIA', 'SUPRIMENTO']),
  valor: z.number().positive('Valor do movimento deve ser maior que zero'),
  motivo: z.string().min(3, 'Descreva o motivo da sangria/suprimento'),
});
