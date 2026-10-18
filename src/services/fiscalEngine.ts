import { Empresa, Produto, Venda, VendaItem } from '../types';

/**
 * Motor Fiscal Brasileiro & Emulador ACBrLib
 * - Geração de Chave de Acesso com Módulo 11 oficial da SEFAZ
 * - Validação fiscal Simples Nacional (CSOSN) vs Regime Normal (CST)
 * - Geração do arquivo INI para o Projeto ACBr (ACBrLibNFe)
 * - Geração e parse do XML NFC-e / NF-e
 */

/**
 * Calcula o Dígito Verificador (Módulo 11) para os 43 dígitos da chave de acesso
 */
export function calcularDigitoModulo11(chave43: string): number {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  let pesoIndex = 0;

  for (let i = chave43.length - 1; i >= 0; i--) {
    const digito = parseInt(chave43[i], 10);
    soma += digito * pesos[pesoIndex];
    pesoIndex = (pesoIndex + 1) % pesos.length;
  }

  const resto = soma % 11;
  const dv = 11 - resto;
  return dv === 0 || dv >= 10 ? 0 : dv;
}

/**
 * Gera a chave de acesso de 44 dígitos da NF-e / NFC-e
 */
export function gerarChaveAcesso(
  codigoUf: string,
  data: Date,
  cnpj: string,
  modelo: '65' | '55',
  serie: string,
  numero: number
): string {
  const uf = codigoUf.padStart(2, '0');
  const ano = data.getFullYear().toString().slice(-2);
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const aamm = `${ano}${mes}`;
  const cnpjLimpo = cnpj.replace(/\D/g, '').padStart(14, '0');
  const mod = modelo;
  const serieFormatada = serie.replace(/\D/g, '').padStart(3, '0');
  const nNF = numero.toString().padStart(9, '0');
  const tpEmis = '1'; // 1 = Normal
  const cNF = Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 dígitos aleatórios

  const chave43 = `${uf}${aamm}${cnpjLimpo}${mod}${serieFormatada}${nNF}${tpEmis}${cNF}`;
  const dv = calcularDigitoModulo11(chave43);
  return `${chave43}${dv}`;
}

/**
 * Validação fiscal de conformidade
 */
export function validarFiscalItem(
  item: VendaItem,
  crtEmpresa: 1 | 2 | 3
): { valido: boolean; mensagem?: string } {
  if (crtEmpresa === 1) {
    if (!item.csosn) {
      return { valido: false, mensagem: `Produto "${item.descricao}" exige CSOSN para Simples Nacional (CRT 1).` };
    }
  } else {
    if (!item.cstIcms) {
      return { valido: false, mensagem: `Produto "${item.descricao}" exige CST ICMS para Regime Normal (CRT 3).` };
    }
  }

  if (!item.cfop || item.cfop.length !== 4) {
    return { valido: false, mensagem: `CFOP inválido para o produto "${item.descricao}".` };
  }

  if (!item.ncm || item.ncm.length < 8) {
    return { valido: false, mensagem: `NCM deve ter ao menos 8 dígitos para o item "${item.descricao}".` };
  }

  return { valido: true };
}

/**
 * Gera payload no padrão ACBr INI (para libacbrnfe)
 */
export function gerarPayloadAcbrIni(venda: Venda, empresa: Empresa): string {
  const agora = new Date(venda.dataVenda);
  const dataFormatada = agora.toISOString().replace(/\.\d{3}Z$/, '');

  const ini: string[] = [
    '; ====================================================',
    '; ACBrLibNFe - Payload de Emissão NFC-e / NF-e',
    '; Gerado automaticamente pelo ERP & PDV Fiscal Brasil',
    '; ====================================================',
    '[Identificacao]',
    `cUF=${empresa.codigoIbgeUf || '35'}`,
    `cNF=${venda.numero.toString().padStart(8, '0')}`,
    `natOp=VENDA AO CONSUMIDOR`,
    `mod=65`,
    `serie=${venda.serie}`,
    `nNF=${venda.numero}`,
    `dhEmi=${dataFormatada}`,
    `tpNF=1`,
    `idDest=1`,
    `cMunFG=${empresa.codigoIbgeCidade || '3550308'}`,
    `tpImp=4`,
    `tpEmis=1`,
    `finNFe=1`,
    `indFinal=1`,
    `indPres=1`,
    `procEmi=0`,
    `verProc=ERP_PDV_BR_1.0`,
    '',
    '[Emitente]',
    `CNPJCPF=${empresa.cnpj.replace(/\D/g, '')}`,
    `xNome=${empresa.razaoSocial}`,
    `xFant=${empresa.nomeFantasia}`,
    `IE=${empresa.inscricaoEstadual.replace(/\D/g, '')}`,
    `CRT=${empresa.crt}`,
    `xLgr=${empresa.logradouro}`,
    `nro=${empresa.numero}`,
    `xBairro=${empresa.bairro}`,
    `cMun=${empresa.codigoIbgeCidade || '3550308'}`,
    `xMun=${empresa.cidade}`,
    `UF=${empresa.uf}`,
    `CEP=${empresa.cep.replace(/\D/g, '')}`,
    `cPais=1058`,
    `xPais=BRASIL`,
    '',
  ];

  if (venda.cpfCnpjCliente) {
    const doc = venda.cpfCnpjCliente.replace(/\D/g, '');
    ini.push(
      '[Destinatario]',
      `CNPJCPF=${doc}`,
      `xNome=${venda.nomeCliente || 'CONSUMIDOR FINAL'}`,
      `indIEDest=9`,
      ''
    );
  }

  // Itens
  venda.itens.forEach((item, index) => {
    const seq = (index + 1).toString().padStart(3, '0');
    ini.push(
      `[Produto${seq}]`,
      `cProd=${item.codigoInterno}`,
      `cEAN=SEM GTIN`,
      `xProd=${item.descricao}`,
      `NCM=${item.ncm.replace(/\D/g, '')}`,
      `CFOP=${item.cfop}`,
      `uCom=UN`,
      `qCom=${item.quantidade.toFixed(3)}`,
      `vUnCom=${item.valorUnitario.toFixed(2)}`,
      `vProd=${(item.quantidade * item.valorUnitario).toFixed(2)}`,
      `vDesc=${item.valorDesconto.toFixed(2)}`,
      `cEANTrib=SEM GTIN`,
      `uTrib=UN`,
      `qTrib=${item.quantidade.toFixed(3)}`,
      `vUnTrib=${item.valorUnitario.toFixed(2)}`,
      `indTot=1`,
      ''
    );

    // ICMS
    ini.push(`[ICMS${seq}]`);
    if (empresa.crt === 1) {
      ini.push(
        `Orig=0`,
        `CSOSN=${item.csosn || '102'}`
      );
    } else {
      ini.push(
        `Orig=0`,
        `CST=${item.cstIcms || '00'}`,
        `modBC=3`,
        `vBC=${item.baseIcms.toFixed(2)}`,
        `pICMS=${item.aliquotaIcms.toFixed(2)}`,
        `vICMS=${item.valorIcms.toFixed(2)}`
      );
    }
    ini.push('');

    // PIS / COFINS
    ini.push(
      `[PIS${seq}]`,
      `CST=01`,
      `vBC=${(item.valorTotal).toFixed(2)}`,
      `pPIS=1.65`,
      `vPIS=${(item.valorTotal * 0.0165).toFixed(2)}`,
      '',
      `[COFINS${seq}]`,
      `CST=01`,
      `vBC=${(item.valorTotal).toFixed(2)}`,
      `pCOFINS=7.60`,
      `vCOFINS=${(item.valorTotal * 0.076).toFixed(2)}`,
      ''
    );
  });

  // Totais
  ini.push(
    '[Total]',
    `vProd=${venda.valorProdutos.toFixed(2)}`,
    `vDesc=${venda.valorDesconto.toFixed(2)}`,
    `vNF=${venda.valorTotal.toFixed(2)}`,
    ''
  );

  // Pagamentos
  venda.pagamentos.forEach((pag, index) => {
    const seq = (index + 1).toString().padStart(3, '0');
    let tPag = '01'; // 01=Dinheiro, 03=Cartão Crédito, 04=Cartão Débito, 17=PIX
    if (pag.formaDescricao.toLowerCase().includes('crédito')) tPag = '03';
    else if (pag.formaDescricao.toLowerCase().includes('débito')) tPag = '04';
    else if (pag.formaDescricao.toLowerCase().includes('pix')) tPag = '17';

    ini.push(
      `[Pagamento${seq}]`,
      `tPag=${tPag}`,
      `vPag=${pag.valor.toFixed(2)}`,
      `tpIntegra=2`
    );
    if (pag.troco && pag.troco > 0) {
      ini.push(`vTroco=${pag.troco.toFixed(2)}`);
    }
    ini.push('');
  });

  return ini.join('\n');
}

/**
 * Gera documento XML formatado da NFC-e para visualização e exportação
 */
export function gerarXmlNfce(venda: Venda, empresa: Empresa, chaveAcesso: string): string {
  const dhEmi = new Date(venda.dataVenda).toISOString();
  const cNF = chaveAcesso.substring(35, 43);
  const cDV = chaveAcesso.substring(43, 44);

  return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${chaveAcesso}" versao="4.00">
    <ide>
      <cUF>${empresa.codigoIbgeUf || '35'}</cUF>
      <cNF>${cNF}</cNF>
      <natOp>VENDA AO CONSUMIDOR</natOp>
      <mod>65</mod>
      <serie>${venda.serie}</serie>
      <nNF>${venda.numero}</nNF>
      <dhEmi>${dhEmi}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>${empresa.codigoIbgeCidade || '3550308'}</cMunFG>
      <tpImp>4</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>${cDV}</cDV>
      <tpAmb>${empresa.ambienteSefaz === 'producao' ? '1' : '2'}</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>ERP_PDV_BR_1.0</verProc>
    </ide>
    <emit>
      <CNPJ>${empresa.cnpj.replace(/\D/g, '')}</CNPJ>
      <xNome>${empresa.razaoSocial}</xNome>
      <xFant>${empresa.nomeFantasia}</xFant>
      <enderEmit>
        <xLgr>${empresa.logradouro}</xLgr>
        <nro>${empresa.numero}</nro>
        <xBairro>${empresa.bairro}</xBairro>
        <cMun>${empresa.codigoIbgeCidade || '3550308'}</cMun>
        <xMun>${empresa.cidade}</xMun>
        <UF>${empresa.uf}</UF>
        <CEP>${empresa.cep.replace(/\D/g, '')}</CEP>
        <cPais>1058</cPais>
        <xPais>BRASIL</xPais>
      </enderEmit>
      <IE>${empresa.inscricaoEstadual.replace(/\D/g, '')}</IE>
      <CRT>${empresa.crt}</CRT>
    </emit>
    ${venda.cpfCnpjCliente ? `
    <dest>
      <CPF>${venda.cpfCnpjCliente.replace(/\D/g, '')}</CPF>
      <xNome>${venda.nomeCliente || 'CONSUMIDOR'}</xNome>
      <indIEDest>9</indIEDest>
    </dest>` : '<dest><xNome>CONSUMIDOR NAO IDENTIFICADO</xNome><indIEDest>9</indIEDest></dest>'}
    ${venda.itens.map((item, idx) => `
    <det nItem="${idx + 1}">
      <prod>
        <cProd>${item.codigoInterno}</cProd>
        <cEAN>SEM GTIN</cEAN>
        <xProd>${item.descricao}</xProd>
        <NCM>${item.ncm.replace(/\D/g, '')}</NCM>
        <CFOP>${item.cfop}</CFOP>
        <uCom>UN</uCom>
        <qCom>${item.quantidade.toFixed(4)}</qCom>
        <vUnCom>${item.valorUnitario.toFixed(2)}</vUnCom>
        <vProd>${(item.quantidade * item.valorUnitario).toFixed(2)}</vProd>
        ${item.valorDesconto > 0 ? `<vDesc>${item.valorDesconto.toFixed(2)}</vDesc>` : ''}
        <cEANTrib>SEM GTIN</cEANTrib>
        <uTrib>UN</uTrib>
        <qTrib>${item.quantidade.toFixed(4)}</qTrib>
        <vUnTrib>${item.valorUnitario.toFixed(2)}</vUnTrib>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <ICMS>
          ${empresa.crt === 1 ? `
          <ICMSSN102>
            <orig>0</orig>
            <CSOSN>${item.csosn || '102'}</CSOSN>
          </ICMSSN102>` : `
          <ICMS00>
            <orig>0</orig>
            <CST>${item.cstIcms || '00'}</CST>
            <modBC>3</modBC>
            <vBC>${item.baseIcms.toFixed(2)}</vBC>
            <pICMS>${item.aliquotaIcms.toFixed(2)}</pICMS>
            <vICMS>${item.valorIcms.toFixed(2)}</vICMS>
          </ICMS00>`}
        </ICMS>
      </imposto>
    </det>`).join('')}
    <total>
      <ICMSTot>
        <vBC>${venda.itens.reduce((acc, i) => acc + (i.baseIcms || 0), 0).toFixed(2)}</vBC>
        <vICMS>${venda.itens.reduce((acc, i) => acc + (i.valorIcms || 0), 0).toFixed(2)}</vICMS>
        <vProd>${venda.valorProdutos.toFixed(2)}</vProd>
        <vDesc>${venda.valorDesconto.toFixed(2)}</vDesc>
        <vNF>${venda.valorTotal.toFixed(2)}</vNF>
      </ICMSTot>
    </total>
    <pag>
      ${venda.pagamentos.map((pag) => `
      <detPag>
        <tPag>${pag.formaDescricao.toLowerCase().includes('crédito') ? '03' : pag.formaDescricao.toLowerCase().includes('pix') ? '17' : '01'}</tPag>
        <vPag>${pag.valor.toFixed(2)}</vPag>
      </detPag>`).join('')}
    </pag>
  </infNFe>
</NFe>`;
}
