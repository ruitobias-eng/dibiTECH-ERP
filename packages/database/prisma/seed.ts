import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import mysql from 'mysql2/promise';

/**
 * Script de Carga e Seed do Banco de Dados
 * - Valida travas de integridade antes da execução
 * - Força charset utf8mb4 para não corromper acentuações brasileiras
 * - Ativa NO_AUTO_VALUE_ON_ZERO para respeitar IDs explícitos
 * - Controla FOREIGN_KEY_CHECKS estritamente no escopo da sessão
 */
async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL não configurada.');

  const sqlPath = resolve(process.cwd(), '../../Script_Dados.sql');
  const sql = (await readFile(sqlPath, 'utf8')).trimEnd();
  if (!sql) throw new Error('Script_Dados.sql vazio.');

  // Trava 1: detectar truncamento no meio de um INSERT
  if (/INSERT\s+INTO\s+[`"']?\w+[`"']?\s*\([^)]*$/i.test(sql)) {
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

    console.log('Executando Script_Dados.sql (isso pode levar alguns segundos)...');
    await conn.query(sql);
    console.log('Script SQL executado com sucesso.');

    console.log('\n--- ATENÇÃO DE SEGURANÇA ---');
    console.log('Senhas migradas com hash MD5 ("1" e "2") devem ser atualizadas para bcrypt custo 12 antes de ir para homologação/produção.');
  } finally {
    await conn.query('SET SESSION FOREIGN_KEY_CHECKS=1');
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Falha ao importar Script_Dados.sql:', err);
  process.exitCode = 1;
});
