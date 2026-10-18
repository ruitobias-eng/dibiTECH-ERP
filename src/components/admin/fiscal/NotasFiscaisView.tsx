import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import { NotaFiscal } from '../../../types';
import { FileText, Code2, CheckCircle, Clock, Ban, Copy, Check, Search } from 'lucide-react';

export const NotasFiscaisView: React.FC = () => {
  const store = useAppStore();
  const notas = store.getNotasFiscais();

  const [busca, setBusca] = useState<string>('');
  const [notaSelecionadaXml, setNotaSelecionadaXml] = useState<NotaFiscal | null>(null);
  const [copiado, setCopiado] = useState<boolean>(false);

  const copiarXml = () => {
    if (!notaSelecionadaXml?.xmlEnviado) return;
    navigator.clipboard.writeText(notaSelecionadaXml.xmlEnviado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const notasFiltradas = notas.filter(
    (n) =>
      n.chaveAcesso.includes(busca) ||
      n.numero.toString().includes(busca) ||
      n.destinatario.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Documentos Fiscais Emitidos (NFC-e Modelo 65 / NF-e Modelo 55)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Status SEFAZ, chave de acesso de 44 dígitos, protocolo de autorização e inspeção de XML oficial.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por chave de acesso, número da nota ou destinatário..."
          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white"
        />
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
              <th className="py-2.5 px-4 font-semibold">Modelo / Número</th>
              <th className="py-2.5 px-4 font-semibold">Emissão</th>
              <th className="py-2.5 px-4 font-semibold">Chave de Acesso</th>
              <th className="py-2.5 px-4 font-semibold">Destinatário</th>
              <th className="py-2.5 px-4 font-semibold text-right">Valor Total</th>
              <th className="py-2.5 px-4 font-semibold text-center">Status SEFAZ</th>
              <th className="py-2.5 px-4 text-center">XML</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Nenhuma nota fiscal emitida ainda. Realize vendas no PDV para gerar emissões.
                </td>
              </tr>
            ) : (
              notasFiltradas.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900">
                      Nº {n.numero} (Mod {n.modelo})
                    </span>
                    <span className="text-slate-600 ml-1 font-mono">Série {n.serie}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {new Date(n.dataEmissao).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                    {n.chaveAcesso}
                  </td>
                  <td className="py-3 px-4 text-slate-800">{n.destinatario}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                    R$ {n.valorTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-xs ${
                        n.status === 'AUTORIZADA'
                          ? 'text-emerald-700'
                          : n.status === 'PENDENTE'
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {n.status === 'AUTORIZADA' && <CheckCircle className="w-3.5 h-3.5" />}
                      {n.status === 'PENDENTE' && <Clock className="w-3.5 h-3.5" />}
                      {n.status === 'CANCELADA' && <Ban className="w-3.5 h-3.5" />}
                      {n.status}
                    </span>
                    {n.protocoloAutorizacao && (
                      <div className="text-[10px] text-slate-600 font-mono">
                        Prot: {n.protocoloAutorizacao}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setNotaSelecionadaXml(n)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Inspecionar XML"
                    >
                      <Code2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Visualizador de XML */}
      {notaSelecionadaXml && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-800 text-sm">
                  XML da NFC-e Nº {notaSelecionadaXml.numero} · Chave: {notaSelecionadaXml.chaveAcesso}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copiarXml}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiado ? 'Copiado!' : 'Copiar XML'}
                </button>
                <button
                  onClick={() => setNotaSelecionadaXml(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto bg-slate-900">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                {notaSelecionadaXml.xmlEnviado || 'XML não disponível'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
