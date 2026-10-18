import React from 'react';
import { Venda, Empresa } from '../../types';
import { Printer, X, CheckCircle } from 'lucide-react';

interface ReceiptModalProps {
  venda: Venda;
  empresa: Empresa;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ venda, empresa, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Formata a chave em blocos de 4 dígitos
  const chaveFormatada = venda.chaveAcessoNfe
    ? venda.chaveAcessoNfe.replace(/(\d{4})/g, '$1 ').trim()
    : 'Chave não gerada';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-slate-800 text-sm">
              Venda Nº {venda.numero} Concluída com Sucesso
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cupom Fiscal Visualizador (80mm) */}
        <div className="p-6 bg-slate-100 flex justify-center max-h-[70vh] overflow-y-auto">
          <div
            id="cupom-fiscal-imprimir"
            className="bg-white p-5 shadow-xs border border-slate-300 w-full max-w-[340px] text-[11px] font-mono leading-relaxed text-slate-900"
          >
            <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-0.5">
              <div className="font-bold text-xs">{empresa.razaoSocial}</div>
              <div className="text-[10px] text-slate-600">{empresa.nomeFantasia}</div>
              <div>CNPJ: {empresa.cnpj} IE: {empresa.inscricaoEstadual}</div>
              <div>{empresa.logradouro}, {empresa.numero} - {empresa.bairro}</div>
              <div>{empresa.cidade}/{empresa.uf} - CEP {empresa.cep}</div>
            </div>

            <div className="text-center py-2 border-b border-dashed border-slate-400">
              <div className="font-bold">DANFE NFC-e - Documento Auxiliar</div>
              <div className="text-[10px]">Nota Fiscal de Consumidor Eletrônica</div>
              {empresa.ambienteSefaz === 'homologacao' && (
                <div className="text-[10px] font-bold text-amber-700 mt-1">
                  EMITIDA EM HOMOLOGAÇÃO - SEM VALOR FISCAL
                </div>
              )}
            </div>

            {/* Cabeçalho dos Itens */}
            <div className="py-2 border-b border-dashed border-slate-400">
              <div className="grid grid-cols-12 text-[10px] font-bold text-slate-600 mb-1">
                <span className="col-span-6">ITEM / DESCRIÇÃO</span>
                <span className="col-span-2 text-right">QTD</span>
                <span className="col-span-2 text-right">UN</span>
                <span className="col-span-2 text-right">TOTAL</span>
              </div>
              <div className="space-y-1.5">
                {venda.itens.map((it, idx) => (
                  <div key={idx} className="border-b border-dotted border-slate-200 pb-1">
                    <div className="truncate font-semibold">
                      {(idx + 1).toString().padStart(3, '0')} {it.descricao}
                    </div>
                    <div className="grid grid-cols-12 text-[10px] text-slate-600">
                      <span className="col-span-6 text-[9px] text-slate-600">
                        Cód:{it.codigoInterno} NCM:{it.ncm}
                      </span>
                      <span className="col-span-2 text-right tabular-nums">{it.quantidade}</span>
                      <span className="col-span-2 text-right tabular-nums">
                        {it.valorUnitario.toFixed(2)}
                      </span>
                      <span className="col-span-2 text-right font-medium text-slate-900 tabular-nums">
                        {it.valorTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totais */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Qtd. Total de Itens:</span>
                <span className="tabular-nums">{venda.itens.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor Total dos Produtos:</span>
                <span className="tabular-nums">R$ {venda.valorProdutos.toFixed(2)}</span>
              </div>
              {venda.valorDesconto > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Desconto:</span>
                  <span className="tabular-nums">- R$ {venda.valorDesconto.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-300">
                <span>VALOR A PAGAR:</span>
                <span className="tabular-nums">R$ {venda.valorTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Pagamentos */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
              <div className="font-bold text-[10px] text-slate-600">FORMA DE PAGAMENTO</div>
              {venda.pagamentos.map((p, i) => (
                <div key={i} className="flex justify-between">
                  <span>{p.formaDescricao}:</span>
                  <span className="tabular-nums">R$ {p.valor.toFixed(2)}</span>
                </div>
              ))}
              {venda.pagamentos.some((p) => p.troco && p.troco > 0) && (
                <div className="flex justify-between font-semibold pt-1 border-t border-dotted border-slate-200">
                  <span>Troco:</span>
                  <span className="tabular-nums">
                    R$ {venda.pagamentos.reduce((acc, p) => acc + (p.troco || 0), 0).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Informações Fiscais */}
            <div className="py-2 text-[10px] space-y-1 border-b border-dashed border-slate-400">
              <div className="flex justify-between">
                <span>NFC-e Nº: {venda.numero}</span>
                <span>Série: {venda.serie}</span>
              </div>
              <div>Emissão: {new Date(venda.dataVenda).toLocaleString('pt-BR')}</div>
              {venda.protocoloNfe && (
                <div>Protocolo de Autorização: {venda.protocoloNfe}</div>
              )}
              <div className="pt-1">
                <span className="font-bold block text-[9px] text-slate-600">CHAVE DE ACESSO:</span>
                <span className="text-[9px] break-all tracking-wider text-slate-800">
                  {chaveFormatada}
                </span>
              </div>
            </div>

            {/* Consumidor */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px]">
              <span className="font-bold">CONSUMIDOR: </span>
              {venda.cpfCnpjCliente ? (
                <span>
                  {venda.nomeCliente || 'Não informado'} - CPF/CNPJ: {venda.cpfCnpjCliente}
                </span>
              ) : (
                <span>CONSUMIDOR NÃO IDENTIFICADO</span>
              )}
            </div>

            {/* QR Code Simulado para Consulta SEFAZ */}
            <div className="py-3 text-center space-y-1">
              <div className="text-[9px] text-slate-600">Consulte pela Chave de Acesso no portal SEFAZ</div>
              <div className="flex justify-center my-2">
                <div className="w-24 h-24 bg-slate-900 flex items-center justify-center p-1.5 rounded-sm">
                  {/* SVG Minimalist QR Code representation */}
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                    <rect x="0" y="0" width="30" height="30" />
                    <rect x="5" y="5" width="20" height="20" fill="black" />
                    <rect x="10" y="10" width="10" height="10" fill="white" />
                    <rect x="70" y="0" width="30" height="30" />
                    <rect x="75" y="5" width="20" height="20" fill="black" />
                    <rect x="80" y="10" width="10" height="10" fill="white" />
                    <rect x="0" y="70" width="30" height="30" />
                    <rect x="5" y="75" width="20" height="20" fill="black" />
                    <rect x="10" y="80" width="10" height="10" fill="white" />
                    <rect x="40" y="10" width="10" height="10" />
                    <rect x="55" y="15" width="10" height="10" />
                    <rect x="35" y="45" width="30" height="10" />
                    <rect x="45" y="35" width="10" height="30" />
                    <rect x="75" y="45" width="15" height="15" />
                    <rect x="40" y="75" width="20" height="15" />
                    <rect x="70" y="75" width="15" height="20" />
                  </svg>
                </div>
              </div>
              <div className="text-[8px] text-slate-600">Tributos incidentes (Lei Federal 12.741/2012)</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Fechar (Esc)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir Cupom 80mm
          </button>
        </div>
      </div>
    </div>
  );
};
