-- ============================================================================
-- SCRIPT DE AUDITORIA DE INTEGRIDADE REFERENCIAL E CHAVES ESTRANGEIRAS ÓRFÃS
-- Projeto: ERP & PDV Fiscal Brasil
-- Banco de Dados: MySQL 8 (utf8mb4)
-- Executar após a carga do Script_Dados.sql
-- ============================================================================

-- Objetivo:
-- Identifica se existem IDs em tabelas-filhas apontando para chaves primárias
-- inexistentes em tabelas-mães (decorrentes de scripts de seed antigos, IDs truncados
-- ou remoções manuais sem integridade referencial ativa).

SET NAMES 'utf8mb4';
SET @total_erros = 0;

SELECT '==================================================' AS status,
       'INICIANDO AUDITORIA DE INTEGRIDADE REFERENCIAL' AS mensagem;

-- ----------------------------------------------------------------------------
-- 1. APOIO: MUNICÍPIO -> UF
-- ----------------------------------------------------------------------------
SELECT 'MUNICIPIO -> UF' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_UF inexistente em UF' ELSE 'OK' END AS resultado
FROM MUNICIPIO m
LEFT JOIN UF u ON m.ID_UF = u.ID
WHERE u.ID IS NULL;

-- Detalhe se houver órfãos:
SELECT m.ID, m.NOME, m.ID_UF, 'ID_UF não encontrado na tabela UF' AS detalhe_erro
FROM MUNICIPIO m
LEFT JOIN UF u ON m.ID_UF = u.ID
WHERE u.ID IS NULL;

-- ----------------------------------------------------------------------------
-- 2. APOIO: AGÊNCIA -> BANCO
-- ----------------------------------------------------------------------------
SELECT 'BANCO_AGENCIA -> BANCO' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_BANCO inexistente em BANCO' ELSE 'OK' END AS resultado
FROM BANCO_AGENCIA a
LEFT JOIN BANCO b ON a.ID_BANCO = b.ID
WHERE b.ID IS NULL;

-- ----------------------------------------------------------------------------
-- 3. APOIO: CONTA CAIXA -> AGÊNCIA BANCÁRIA
-- Nota: ID_BANCO_AGENCIA é NULL para caixas internos ('X')
-- ----------------------------------------------------------------------------
SELECT 'BANCO_CONTA_CAIXA -> BANCO_AGENCIA' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_BANCO_AGENCIA inexistente em BANCO_AGENCIA' ELSE 'OK' END AS resultado
FROM BANCO_CONTA_CAIXA c
LEFT JOIN BANCO_AGENCIA a ON c.ID_BANCO_AGENCIA = a.ID
WHERE c.ID_BANCO_AGENCIA IS NOT NULL AND a.ID IS NULL;

-- ----------------------------------------------------------------------------
-- 4. PESSOAS: PESSOA_FISICA -> PESSOA
-- ----------------------------------------------------------------------------
SELECT 'PESSOA_FISICA -> PESSOA' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_PESSOA inexistente em PESSOA' ELSE 'OK' END AS resultado
FROM PESSOA_FISICA pf
LEFT JOIN PESSOA p ON pf.ID_PESSOA = p.ID
WHERE p.ID IS NULL;

-- ----------------------------------------------------------------------------
-- 5. PESSOAS: PESSOA_FISICA -> ESTADO_CIVIL & NIVEL_FORMACAO
-- ----------------------------------------------------------------------------
SELECT 'PESSOA_FISICA -> ESTADO_CIVIL' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_ESTADO_CIVIL inexistente' ELSE 'OK' END AS resultado
FROM PESSOA_FISICA pf
LEFT JOIN ESTADO_CIVIL ec ON pf.ID_ESTADO_CIVIL = ec.ID
WHERE ec.ID IS NULL;

SELECT 'PESSOA_FISICA -> NIVEL_FORMACAO' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_NIVEL_FORMACAO inexistente' ELSE 'OK' END AS resultado
FROM PESSOA_FISICA pf
LEFT JOIN NIVEL_FORMACAO nf ON pf.ID_NIVEL_FORMACAO = nf.ID
WHERE nf.ID IS NULL;

-- ----------------------------------------------------------------------------
-- 6. PESSOAS: PESSOA_JURIDICA -> PESSOA
-- ----------------------------------------------------------------------------
SELECT 'PESSOA_JURIDICA -> PESSOA' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_PESSOA inexistente em PESSOA' ELSE 'OK' END AS resultado
FROM PESSOA_JURIDICA pj
LEFT JOIN PESSOA p ON pj.ID_PESSOA = p.ID
WHERE p.ID IS NULL;

-- ----------------------------------------------------------------------------
-- 7. PESSOAS: ENDEREÇOS E TELEFONES -> PESSOA
-- ----------------------------------------------------------------------------
SELECT 'PESSOA_ENDERECO -> PESSOA' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_PESSOA inexistente em PESSOA' ELSE 'OK' END AS resultado
FROM PESSOA_ENDERECO pe
LEFT JOIN PESSOA p ON pe.ID_PESSOA = p.ID
WHERE p.ID IS NULL;

SELECT 'PESSOA_TELEFONE -> PESSOA' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_PESSOA inexistente em PESSOA' ELSE 'OK' END AS resultado
FROM PESSOA_TELEFONE pt
LEFT JOIN PESSOA p ON pt.ID_PESSOA = p.ID
WHERE p.ID IS NULL;

-- ----------------------------------------------------------------------------
-- 8. RH & ACESSO: COLABORADOR -> PESSOA, CARGO, SETOR
-- ----------------------------------------------------------------------------
SELECT 'COLABORADOR -> PESSOA' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_PESSOA inexistente em PESSOA' ELSE 'OK' END AS resultado
FROM COLABORADOR c
LEFT JOIN PESSOA p ON c.ID_PESSOA = p.ID
WHERE p.ID IS NULL;

SELECT 'COLABORADOR -> CARGO' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_CARGO inexistente em CARGO' ELSE 'OK' END AS resultado
FROM COLABORADOR c
LEFT JOIN CARGO cg ON c.ID_CARGO = cg.ID
WHERE cg.ID IS NULL;

SELECT 'COLABORADOR -> SETOR' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_SETOR inexistente em SETOR' ELSE 'OK' END AS resultado
FROM COLABORADOR c
LEFT JOIN SETOR s ON c.ID_SETOR = s.ID
WHERE s.ID IS NULL;

-- ----------------------------------------------------------------------------
-- 9. RH & ACESSO: USUARIO -> COLABORADOR, PAPEL
-- ----------------------------------------------------------------------------
SELECT 'USUARIO -> COLABORADOR' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_COLABORADOR inexistente' ELSE 'OK' END AS resultado
FROM USUARIO u
LEFT JOIN COLABORADOR c ON u.ID_COLABORADOR = c.ID
WHERE c.ID IS NULL;

SELECT 'USUARIO -> PAPEL' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_PAPEL inexistente' ELSE 'OK' END AS resultado
FROM USUARIO u
LEFT JOIN PAPEL p ON u.ID_PAPEL = p.ID
WHERE p.ID IS NULL;

-- ----------------------------------------------------------------------------
-- 10. ESTOQUE: SUBGRUPO -> GRUPO_PRODUTO
-- ----------------------------------------------------------------------------
SELECT 'SUBGRUPO_PRODUTO -> GRUPO_PRODUTO' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_GRUPO_PRODUTO inexistente' ELSE 'OK' END AS resultado
FROM SUBGRUPO_PRODUTO sg
LEFT JOIN GRUPO_PRODUTO gp ON sg.ID_GRUPO_PRODUTO = gp.ID
WHERE gp.ID IS NULL;

-- ----------------------------------------------------------------------------
-- 11. ESTOQUE: PRODUTO -> GRUPO, NCM, CFOP, CST, CSOSN
-- ----------------------------------------------------------------------------
SELECT 'PRODUTO -> GRUPO_PRODUTO' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_GRUPO_PRODUTO inexistente' ELSE 'OK' END AS resultado
FROM PRODUTO p
LEFT JOIN GRUPO_PRODUTO gp ON p.ID_GRUPO_PRODUTO = gp.ID
WHERE gp.ID IS NULL;

SELECT 'PRODUTO -> NCM' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_NCM inexistente em NCM' ELSE 'OK' END AS resultado
FROM PRODUTO p
LEFT JOIN NCM n ON p.ID_NCM = n.ID
WHERE n.ID IS NULL;

-- Ponto Crítico da Auditoria: CFOPs 389 e 23
SELECT 'PRODUTO -> CFOP' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_CFOP inexistente em CFOP (Ex: CFOPs 389, 23)' ELSE 'OK' END AS resultado
FROM PRODUTO p
LEFT JOIN CFOP c ON p.ID_CFOP = c.ID
WHERE c.ID IS NULL;

-- Listagem de produtos com ID_CFOP quebrado para correção:
SELECT p.ID, p.CODIGO_INTERNO, p.DESCRICAO, p.ID_CFOP, 'CFOP não cadastrado' AS motivo
FROM PRODUTO p
LEFT JOIN CFOP c ON p.ID_CFOP = c.ID
WHERE c.ID IS NULL;

-- ----------------------------------------------------------------------------
-- 12. ESTOQUE: PRODUTO_CODIGO_BARRAS & ESTOQUE -> PRODUTO
-- ----------------------------------------------------------------------------
SELECT 'PRODUTO_CODIGO_BARRAS -> PRODUTO' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_PRODUTO inexistente' ELSE 'OK' END AS resultado
FROM PRODUTO_CODIGO_BARRAS cb
LEFT JOIN PRODUTO p ON cb.ID_PRODUTO = p.ID
WHERE p.ID IS NULL;

SELECT 'PRODUTO_ESTOQUE -> PRODUTO' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_PRODUTO inexistente' ELSE 'OK' END AS resultado
FROM PRODUTO_ESTOQUE pe
LEFT JOIN PRODUTO p ON pe.ID_PRODUTO = p.ID
WHERE p.ID IS NULL;

SELECT 'PRODUTO_ESTOQUE -> ALMOXARIFADO' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_ALMOXARIFADO inexistente' ELSE 'OK' END AS resultado
FROM PRODUTO_ESTOQUE pe
LEFT JOIN ALMOXARIFADO a ON pe.ID_ALMOXARIFADO = a.ID
WHERE a.ID IS NULL;

-- ----------------------------------------------------------------------------
-- 13. FISCAL: NATUREZA_OPERACAO -> CFOP
-- ----------------------------------------------------------------------------
SELECT 'NATUREZA_OPERACAO -> CFOP' AS relacao,
       COUNT(*) AS total_orfaos,
       CASE WHEN COUNT(*) > 0 THEN 'FALHA: ID_CFOP inexistente em CFOP' ELSE 'OK' END AS resultado
FROM NATUREZA_OPERACAO no
LEFT JOIN CFOP c ON no.ID_CFOP = c.ID
WHERE c.ID IS NULL;

SELECT '==================================================' AS status,
       'AUDITORIA CONCLUÍDA. SE HOUVER LINHAS ACIMA, CORRIJA ANTES DE ATIVAR FKs.' AS mensagem;
