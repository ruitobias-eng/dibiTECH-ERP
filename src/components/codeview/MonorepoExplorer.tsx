import React, { useState } from 'react';
import {
  Folder, FileCode, Copy, Check, Terminal, Layers,
  Code2, Download
} from 'lucide-react';

interface MonorepoFile {
  path: string;
  category: 'database' | 'shared' | 'backend' | 'web-admin' | 'web-pdv' | 'mobile-app' | 'fiscal';
  language: string;
  code: string;
  description: string;
}

const MONOREPO_FILES: MonorepoFile[] = [
  {
    path: 'packages/database/scripts/auditoria_fks_orfas.sql',
    category: 'database',
    language: 'sql',
    description: 'Script de auditoria de FKs órfãs, integridade referencial e validação de CFOPs inexistentes',
    code: `-- ============================================================================
-- SCRIPT DE AUDITORIA DE INTEGRIDADE REFERENCIAL E CHAVES ESTRANGEIRAS ÓRFÃS
-- Projeto: ERP & PDV Fiscal Brasil | MySQL 8 (utf8mb4)
-- Executar após a carga do Script_Dados.sql
-- ============================================================================

-- 1. APOIO: MUNICÍPIO -> UF
SELECT 'MUNICIPIO -> UF' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_UF inexistente em UF' ELSE 'OK' END AS resultado
FROM MUNICIPIO m
LEFT JOIN UF u ON m.ID_UF = u.ID
WHERE u.ID IS NULL;

-- 2. APOIO: AGÊNCIA -> BANCO
SELECT 'BANCO_AGENCIA -> BANCO' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_BANCO inexistente' ELSE 'OK' END AS resultado
FROM BANCO_AGENCIA a
LEFT JOIN BANCO b ON a.ID_BANCO = b.ID
WHERE b.ID IS NULL;

-- 3. APOIO: CONTA CAIXA -> AGÊNCIA BANCÁRIA
SELECT 'BANCO_CONTA_CAIXA -> BANCO_AGENCIA' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_BANCO_AGENCIA inexistente' ELSE 'OK' END AS resultado
FROM BANCO_CONTA_CAIXA c
LEFT JOIN BANCO_AGENCIA a ON c.ID_BANCO_AGENCIA = a.ID
WHERE c.ID_BANCO_AGENCIA IS NOT NULL AND a.ID IS NULL;

-- 4. PESSOAS: PESSOA_FISICA -> PESSOA & ESTADO_CIVIL
SELECT 'PESSOA_FISICA -> PESSOA' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_PESSOA inexistente' ELSE 'OK' END AS resultado
FROM PESSOA_FISICA pf
LEFT JOIN PESSOA p ON pf.ID_PESSOA = p.ID
WHERE p.ID IS NULL;

-- 5. RH & ACESSO: USUARIO -> COLABORADOR, PAPEL
SELECT 'USUARIO -> COLABORADOR' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_COLABORADOR inexistente' ELSE 'OK' END AS resultado
FROM USUARIO u
LEFT JOIN COLABORADOR c ON u.ID_COLABORADOR = c.ID
WHERE c.ID IS NULL;

-- 6. PONTO CRÍTICO: PRODUTO -> CFOP (ex: CFOP 389 e 23)
SELECT 'PRODUTO -> CFOP' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_CFOP inexistente em CFOP' ELSE 'OK' END AS resultado
FROM PRODUTO p
LEFT JOIN CFOP c ON p.ID_CFOP = c.ID
WHERE c.ID IS NULL;

-- Detalhamento de produtos com CFOP quebrado para correção:
SELECT p.ID, p.CODIGO_INTERNO, p.DESCRICAO, p.ID_CFOP, 'CFOP não cadastrado' AS motivo
FROM PRODUTO p
LEFT JOIN CFOP c ON p.ID_CFOP = c.ID
WHERE c.ID IS NULL;`,
  },
  {
    path: 'packages/database/prisma/seed.ts',
    category: 'database',
    language: 'typescript',
    description: 'Seed com 4 travas: bloqueio de prod, NO_AUTO_VALUE_ON_ZERO, FOREIGN_KEY_CHECKS=0 na sessão e utf8mb4',
    code: `import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import mysql from 'mysql2/promise';

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL não configurada.');

  const sqlPath = resolve(process.cwd(), '../../Script_Dados.sql');
  const sql = (await readFile(sqlPath, 'utf8')).trimEnd();
  if (!sql) throw new Error('Script_Dados.sql vazio.');

  // Trava 1: detectar truncamento no meio de um INSERT
  if (/INSERT\\s+INTO\\s+[\`"']?\\w+[\`"']?\\s*\\([^)]*$/i.test(sql)) {
    throw new Error('Script aparentemente truncado (INSERT sem fechamento).');
  }

  // Trava 2: exigir que o arquivo termine com ';' (fim de statement)
  if (!sql.endsWith(';')) {
    throw new Error('Script não termina com ";". Pode estar truncado.');
  }

  // Trava 3: recusar execução se o ambiente parecer produção
  const host = new URL(databaseUrl).hostname;
  if (process.env.NODE_ENV === 'production' || host.includes('prod')) {
    throw new Error('Seed bloqueado em produção. Rode em base descartável de desenvolvimento.');
  }

  const conn = await mysql.createConnection({
    uri: databaseUrl,
    multipleStatements: true,
    connectTimeout: 15_000,
    charset: 'utf8mb4',
  });

  try {
    const [db] = await conn.query<mysql.RowDataPacket[]>('SELECT DATABASE() AS db');
    console.log('Conectado com sucesso em:', db[0]?.db);

    // Trava 4: desabilitar FKs na sessão (não na global) para permitir ordem livre
    await conn.query('SET SESSION FOREIGN_KEY_CHECKS=0');
    await conn.query('SET SESSION sql_mode = CONCAT(@@sql_mode, ",NO_AUTO_VALUE_ON_ZERO")');

    await conn.query(sql);
    console.log('Script SQL executado com sucesso.');
  } finally {
    await conn.query('SET SESSION FOREIGN_KEY_CHECKS=1');
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Falha ao importar Script_Dados.sql:', err);
  process.exitCode = 1;
});`,
  },
  {
    path: 'packages/database/prisma/schema.prisma.draft',
    category: 'database',
    language: 'prisma',
    description: 'Esqueleto com modelos confirmados pelos INSERTs (Apoio, Fiscal, Pessoas, Empresa, Estoque)',
    code: `// packages/database/prisma/schema.prisma.draft
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model EstadoCivil {
  id        Int     @id @default(autoincrement())
  nome      String  @db.VarChar(30)
  descricao String? @db.VarChar(60)

  pessoasFisicas PessoaFisica[]

  @@map("ESTADO_CIVIL")
}

model NivelFormacao {
  id        Int     @id @default(autoincrement())
  nome      String  @db.VarChar(80)
  descricao String? @db.VarChar(120)

  pessoasFisicas PessoaFisica[]

  @@map("NIVEL_FORMACAO")
}

model Uf {
  id         Int    @id @default(autoincrement())
  sigla      String @unique @db.Char(2)
  nome       String @db.VarChar(60)
  codigoIbge Int    @unique

  municipios Municipio[]

  @@map("UF")
}

model Municipio {
  id                    Int     @id @default(autoincrement())
  idUf                  Int
  nome                  String  @db.VarChar(80)
  codigoIbge            Int     @unique
  codigoReceitaFederal  String? @db.VarChar(10)
  codigoEstadual        String? @db.VarChar(10)

  uf Uf @relation(fields: [idUf], references: [id])

  @@index([idUf])
  @@map("MUNICIPIO")
}

model Cfop {
  id        Int     @id @default(autoincrement())
  codigo    String  @unique @db.VarChar(4)
  descricao String  @db.VarChar(200)
  aplicacao String? @db.Text

  produtos  Produto[]

  @@map("CFOP")
}

model Produto {
  id                Int       @id @default(autoincrement())
  idEmpresa         Int
  idGrupoProduto    Int
  idSubgrupoProduto Int?
  idMarca           Int?
  idUnidadeMedida   Int
  idNcm             Int
  idCfop            Int
  idCstIcms         Int?
  idCsosn           Int?
  codigoInterno     String    @unique @db.VarChar(30)
  descricao         String    @db.VarChar(120)
  descricaoCurta    String?   @db.VarChar(60)
  precoCusto        Decimal   @default(0) @db.Decimal(12, 4)
  precoVenda        Decimal   @default(0) @db.Decimal(12, 2)
  estoqueMinimo     Int       @default(0)
  estoqueMaximo     Int       @default(0)
  ativo             String    @db.Char(1) @default("S")
  controlarEstoque  String    @db.Char(1) @default("S")

  cfop              Cfop      @relation(fields: [idCfop], references: [id])

  @@index([idEmpresa])
  @@map("PRODUTO")
}`,
  },
  {
    path: 'packages/database/prisma/schema.prisma',
    category: 'database',
    language: 'prisma',
    description: 'Modelos relacionais com snapshot fiscal (CFOP/CST/CSOSN), estoques e transações',
    code: `// packages/database/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Empresa {
  id                Int      @id @default(autoincrement())
  razaoSocial       String   @db.VarChar(120)
  nomeFantasia      String   @db.VarChar(120)
  cnpj              String   @unique @db.VarChar(14)
  inscricaoEstadual String   @db.VarChar(20)
  crt               Int      @default(1) // 1=Simples, 2=Simples excesso, 3=Normal
  codigoIbgeCidade  String   @db.VarChar(7)
  codigoIbgeUf      String   @db.VarChar(2)

  produtos          Produto[]
  vendas            Venda[]
  movimentosEstoque MovimentoEstoque[]
  caixas            Caixa[]

  @@map("EMPRESA")
}

model Produto {
  id                Int       @id @default(autoincrement())
  idEmpresa         Int
  idGrupoProduto    Int
  idSubgrupoProduto Int?
  idMarca           Int?
  idUnidadeMedida   Int
  idNcm             String    @db.VarChar(10)
  idCfop            String    @db.VarChar(4)
  idCstIcms         String?   @db.VarChar(3)
  idCsosn           String?   @db.VarChar(3)
  codigoInterno     String    @unique @db.VarChar(30)
  descricao         String    @db.VarChar(120)
  descricaoCurta    String?   @db.VarChar(60)
  precoCusto        Decimal   @db.Decimal(12, 2)
  precoVenda        Decimal   @db.Decimal(12, 2)
  estoqueMinimo     Int       @default(0)
  estoqueMaximo     Int       @default(0)
  estoqueAtual      Decimal   @default(0) @db.Decimal(12, 3)
  ativo             String    @default("S") @db.Char(1)
  controlarEstoque  String    @default("S") @db.Char(1)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  empresa           Empresa   @relation(fields: [idEmpresa], references: [id])
  itensVenda        VendaItem[]

  @@map("PRODUTO")
}

model Venda {
  id                  Int       @id @default(autoincrement())
  idEmpresa           Int
  idCliente           Int?
  idUsuario           Int
  idCaixa             Int?
  idNaturezaOperacao  Int
  idCondicaoPagamento Int?
  numero              Int
  serie               String    @db.VarChar(3)
  dataVenda           DateTime  @default(now())
  valorProdutos       Decimal   @db.Decimal(12, 2)
  valorDesconto       Decimal   @default(0) @db.Decimal(12, 2)
  valorAcrescimo      Decimal   @default(0) @db.Decimal(12, 2)
  valorTotal          Decimal   @db.Decimal(12, 2)
  status              String    @default("CONCLUIDA") @db.VarChar(20)
  chaveAcessoNfe      String?   @db.VarChar(44)
  protocoloNfe        String?   @db.VarChar(30)
  observacao          String?   @db.Text
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  empresa             Empresa   @relation(fields: [idEmpresa], references: [id])
  itens               VendaItem[]
  pagamentos          VendaPagamento[]
  notaFiscal          NotaFiscal?
  movimentosEstoque   MovimentoEstoque[]

  @@unique([idEmpresa, serie, numero])
  @@map("VENDA")
}

model VendaItem {
  id             Int      @id @default(autoincrement())
  idVenda        Int
  idProduto      Int
  sequencia      Int
  quantidade     Decimal  @db.Decimal(12, 3)
  valorUnitario  Decimal  @db.Decimal(12, 2)
  valorDesconto  Decimal  @default(0) @db.Decimal(12, 2)
  valorTotal     Decimal  @db.Decimal(12, 2)
  cfop           String   @db.VarChar(4)
  cstIcms        String?  @db.VarChar(3)
  csosn          String?  @db.VarChar(3)
  baseIcms       Decimal  @default(0) @db.Decimal(12, 2)
  aliquotaIcms   Decimal  @default(0) @db.Decimal(5, 2)
  valorIcms      Decimal  @default(0) @db.Decimal(12, 2)

  venda          Venda    @relation(fields: [idVenda], references: [id], onDelete: Cascade)
  produto        Produto  @relation(fields: [idProduto], references: [id])

  @@map("VENDA_ITEM")
}

model VendaPagamento {
  id             Int      @id @default(autoincrement())
  idVenda        Int
  idFormaPagamento Int
  sequencia      Int
  valor          Decimal  @db.Decimal(12, 2)
  parcelas       Int      @default(1)
  troco          Decimal  @default(0) @db.Decimal(12, 2)
  nsu            String?  @db.VarChar(30)

  venda          Venda    @relation(fields: [idVenda], references: [id], onDelete: Cascade)

  @@map("VENDA_PAGAMENTO")
}

model Pessoa {
  id                Int      @id @default(autoincrement())
  tipo              String   @db.Char(1) // F / J
  nome              String   @db.VarChar(120)
  email             String?  @db.VarChar(120)
  ehCliente         String   @default("N") @db.Char(1)
  ehFornecedor      String   @default("N") @db.Char(1)
  ehColaborador     String   @default("N") @db.Char(1)
  ehTransportadora  String   @default("N") @db.Char(1)

  pessoaFisica      PessoaFisica?
  pessoaJuridica    PessoaJuridica?
  enderecos         PessoaEndereco[]
  telefones         PessoaTelefone[]

  @@map("PESSOA")
}

model PessoaFisica {
  idPessoa          Int      @id
  cpf               String   @unique @db.VarChar(11)
  rg                String?  @db.VarChar(20)
  dataNascimento    DateTime @db.Date
  sexo              String   @db.Char(1)

  pessoa            Pessoa   @relation(fields: [idPessoa], references: [id], onDelete: Cascade)

  @@map("PESSOA_FISICA")
}

model PessoaJuridica {
  idPessoa          Int      @id
  cnpj              String   @unique @db.VarChar(14)
  nomeFantasia      String   @db.VarChar(120)
  inscricaoEstadual String?  @db.VarChar(20)
  crt               String   @default("1") @db.Char(1)

  pessoa            Pessoa   @relation(fields: [idPessoa], references: [id], onDelete: Cascade)

  @@map("PESSOA_JURIDICA")
}`,
  },
  {
    path: 'apps/api/src/modules/venda/venda.service.ts',
    category: 'backend',
    language: 'typescript',
    description: 'Serviço transacional NestJS com isolamento SERIALIZABLE, snapshot fiscal e ACBrLib',
    code: `// apps/api/src/modules/venda/venda.service.ts
import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VendaInput } from '@repo/shared/schemas/venda';
import { FiscalService } from '../fiscal/fiscal.service';
import { AcbrNfeService } from '../fiscal/acbr-nfe.service';

@Injectable()
export class VendaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fiscal: FiscalService,
    private readonly acbr: AcbrNfeService,
  ) {}

  async finalizar(dto: VendaInput) {
    // 1. Transação com isolamento SERIALIZABLE para evitar concorrência e saldo negativo
    const venda = await this.prisma.$transaction(async (tx) => {
      // 1.1 Sequencial por empresa e série
      const ultima = await tx.venda.findFirst({
        where: { idEmpresa: dto.idEmpresa, serie: dto.serie },
        orderBy: { numero: 'desc' },
        select: { numero: true },
      });
      const numero = (ultima?.numero ?? 0) + 1;

      // 1.2 Valida estoque
      const idsProdutos = dto.itens.map((i) => i.idProduto);
      const produtos = await tx.produto.findMany({
        where: { id: { in: idsProdutos }, idEmpresa: dto.idEmpresa, ativo: 'S' },
      });
      const produtoMap = new Map(produtos.map((p) => [p.id, p]));

      for (const item of dto.itens) {
        const produto = produtoMap.get(item.idProduto);
        if (!produto) throw new NotFoundException(\`Produto \${item.idProduto} não encontrado\`);

        if (produto.controlarEstoque === 'S' && Number(produto.estoqueAtual) < item.quantidade) {
          throw new ConflictException(
            \`Estoque insuficiente para "\${produto.descricao}": disponível \${produto.estoqueAtual}, solicitado \${item.quantidade}\`
          );
        }
      }

      // 1.3 Deduz estoque
      for (const item of dto.itens) {
        await tx.produto.update({
          where: { id: item.idProduto },
          data: { estoqueAtual: { decrement: item.quantidade } },
        });
      }

      // 1.4 Snapshot fiscal por item
      const natureza = await tx.naturezaOperacao.findUniqueOrThrow({
        where: { id: dto.idNaturezaOperacao },
        include: { cfop: true, cstIcms: true, csosn: true },
      });

      let valorProdutos = 0;
      const itensPreparados = dto.itens.map((item, idx) => {
        const produto = produtoMap.get(item.idProduto)!;
        const subtotal = item.valorUnitario * item.quantidade - item.valorDesconto;
        valorProdutos += subtotal;

        const cfop = natureza.cfop?.codigo ?? produto.idCfop ?? '5102';
        const cstIcms = natureza.cstIcms?.codigo ?? produto.idCstIcms ?? null;
        const csosn = natureza.csosn?.codigo ?? produto.idCsosn ?? null;

        const aliquota = this.fiscal.aliquotaIcms(dto.idEmpresa, cfop);
        const baseIcms = subtotal;
        const valorIcms = baseIcms * (aliquota / 100);

        return {
          idProduto: item.idProduto,
          sequencia: idx + 1,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorDesconto: item.valorDesconto,
          valorTotal: subtotal,
          cfop, cstIcms, csosn,
          baseIcms, aliquotaIcms: aliquota, valorIcms,
        };
      });

      const valorTotal = valorProdutos - dto.valorDesconto + dto.valorAcrescimo;

      // 1.5 Cria Venda + Itens + Pagamentos
      const novaVenda = await tx.venda.create({
        data: {
          idEmpresa: dto.idEmpresa,
          idCliente: dto.idCliente,
          idUsuario: dto.idUsuario,
          idCaixa: dto.idCaixa,
          idNaturezaOperacao: dto.idNaturezaOperacao,
          idCondicaoPagamento: dto.idCondicaoPagamento,
          numero,
          serie: dto.serie,
          valorProdutos,
          valorDesconto: dto.valorDesconto,
          valorAcrescimo: dto.valorAcrescimo,
          valorTotal,
          observacao: dto.observacao,
          itens: { create: itensPreparados },
          pagamentos: {
            create: dto.pagamentos.map((p, idx) => ({ ...p, sequencia: idx + 1 })),
          },
        },
        include: { itens: true, pagamentos: true },
      });

      // 1.6 Movimento de estoque
      await tx.movimentoEstoque.create({
        data: {
          idEmpresa: dto.idEmpresa,
          tipo: 'SAIDA',
          origem: 'VENDA',
          idOrigem: novaVenda.id,
          dataMovimento: new Date(),
          itens: {
            create: itensPreparados.map((i) => ({
              idProduto: i.idProduto,
              quantidade: i.quantidade,
              valorUnitario: i.valorUnitario,
            })),
          },
        },
      });

      return novaVenda;
    }, { isolationLevel: 'Serializable' });

    // 2. Transmissão fiscal via ACBrLib (fora da transação SQL)
    if (dto.emitirNotaFiscal) {
      await this.acbr.emitirNfce(venda.id);
    }

    return venda;
  }
}`,
  },
  {
    path: 'apps/api/src/modules/venda/venda.controller.ts',
    category: 'backend',
    language: 'typescript',
    description: 'Controller NestJS com validação Zod e RBAC Guards',
    code: `// apps/api/src/modules/venda/venda.controller.ts
import { Controller, Post, Body, Param, Get, UseGuards, Req } from '@nestjs/common';
import { VendaService } from './venda.service';
import { VendaSchema, VendaInput } from '@repo/shared/schemas/venda';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';

@Controller('vendas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendaController {
  constructor(private readonly service: VendaService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'VENDEDOR', 'OPERADOR_CAIXA')
  finalizar(@Body(new ZodValidationPipe(VendaSchema)) body: VendaInput, @Req() req: any) {
    // Garante que o operador do caixa/vendedor vem do JWT autenticado
    return this.service.finalizar({ ...body, idUsuario: req.user.idUsuario });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Post(':id/cancelar')
  @Roles('ADMINISTRADOR', 'GERENTE')
  cancelar(@Param('id') id: string, @Body('motivo') motivo: string) {
    return this.service.cancelar(Number(id), motivo);
  }
}`,
  },
  {
    path: 'apps/web-pdv/src/sync/processarPendentes.ts',
    category: 'web-pdv',
    language: 'typescript',
    description: 'Sincronização em lote Dexie.js (Offline-first) com resolução de conflito de estoque',
    code: `// apps/web-pdv/src/sync/processarPendentes.ts
import { db } from '../db';

export async function processarVendasPendentes(token: string) {
  const pendentes = await db.vendas.where('statusSync').equals('PENDENTE_SYNC').toArray();

  for (const venda of pendentes) {
    try {
      await db.vendas.update(venda.localId, { statusSync: 'SINCRONIZANDO' });

      const res = await fetch(\`\${import.meta.env.VITE_API_URL}/vendas\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify(venda),
      });

      if (res.ok) {
        await db.vendas.update(venda.localId, { statusSync: 'SINCRONIZADA' });
      } else if (res.status === 409) {
        // Conflito: estoque esgotado durante a operação offline
        await db.vendas.update(venda.localId, { statusSync: 'CONFLITO_ESTOQUE' });
        console.warn(\`Conflito de estoque detectado na venda local \${venda.localId}\`);
      }
    } catch (err) {
      // Falha de rede: mantém status PENDENTE_SYNC para retry automático
      await db.vendas.update(venda.localId, { statusSync: 'PENDENTE_SYNC' });
    }
  }
}`,
  },
  {
    path: 'turbo.json',
    category: 'shared',
    language: 'json',
    description: 'Configuração do pipeline Turborepo para pnpm workspaces',
    code: `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}`,
  },
];

export const MonorepoExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<MonorepoFile>(MONOREPO_FILES[0]);
  const [copiado, setCopiado] = useState<boolean>(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODOS');

  const copiarCodigo = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const arquivosFiltrados = MONOREPO_FILES.filter((f) =>
    filtroCategoria === 'TODOS' ? true : f.category === filtroCategoria
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Arquitetura do Monorepo &amp; Modelos de Código
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Turborepo + pnpm workspaces: NestJS (API), Next.js 14 (Admin), React/Vite (PDV Dexie) e Expo (Mobile).
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {['TODOS', 'database', 'backend', 'web-pdv', 'shared'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filtroCategoria === cat ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Árvore de Arquivos (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
            Estrutura de Pacotes (@repo/*)
          </div>
          <div className="space-y-1">
            {arquivosFiltrados.map((f) => {
              const active = selectedFile.path === f.path;
              return (
                <button
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono transition-colors flex items-start gap-2 cursor-pointer ${
                    active
                      ? 'bg-blue-50 text-blue-900 border border-blue-200 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="flex-1 truncate">
                    <div className="truncate">{f.path}</div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">{f.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visualizador de Código (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-800 flex flex-col">
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{selectedFile.path}</span>
            </div>
            <button
              onClick={copiarCodigo}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs cursor-pointer transition-colors"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiado ? 'Copiado!' : 'Copiar Código'}
            </button>
          </div>

          <div className="p-5 overflow-auto max-h-[580px]">
            <pre className="font-mono text-xs text-slate-200 leading-relaxed">
              {selectedFile.code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
