import React, { useState } from 'react';
import { Caixa } from '../../types';
import { useAppStore } from '../../services/store';
import { X, DollarSign, ArrowUpRight, ArrowDownLeft, Lock, Unlock } from 'lucide-react';

export type CaixaModalMode = 'abertura' | 'fechamento' | 'sangria' | 'suprimento';

interface CaixaModalProps {
  isOpen: boolean;
  mode: CaixaModalMode;
  caixaAberto?: Caixa;
  onClose: () => void;
}

export const CaixaModal: React.FC<CaixaModalProps> = ({ isOpen, mode, caixaAberto, onClose }) => {
  const store = useAppStore();
  const usuario = store.getUsuarioLogado();

  const [valor, setValor] = useState<string>('150.00');
  const [motivo, setMotivo] = useState<string>('');

  // Fechamento states
  const [dinheiroContado, setDinheiroContado] = useState<string>('0.00');
  const [cartaoContado, setCartaoContado] = useState<string>('0.00');
  const [pixContado, setPixContado] = useState<string>('0.00');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValor = parseFloat(valor) || 0;

    if (mode === 'abertura') {
      store.abrirCaixa(numValor, usuario.nome);
      onClose();
    } else if (mode === 'sangria') {
      if (!motivo) return alert('Por favor, informe a justificativa da sangria.');
      store.registrarMovimentoCaixa('SANGRIA', numValor, motivo);
      onClose();
    } else if (mode === 'suprimento') {
      if (!motivo) return alert('Por favor, informe a justificativa do suprimento.');
      store.registrarMovimentoCaixa('SUPRIMENTO', numValor, motivo);
      onClose();
    } else if (mode === 'fechamento' && caixaAberto) {
      store.fecharCaixa(caixaAberto.id, {
        dinheiro: parseFloat(dinheiroContado) || 0,
        cartao: parseFloat(cartaoContado) || 0,
        pix: parseFloat(pixContado) || 0,
      });
      onClose();
    }
  };

  const titles: Record<CaixaModalMode, { title: string; icon: React.ElementType; color: string }> = {
    abertura: { title: 'Abertura de Caixa (Fundo de Troco)', icon: Unlock, color: 'text-emerald-600' },
    fechamento: { title: 'Fechamento & Conferência Cega de Caixa', icon: Lock, color: 'text-slate-800' },
    sangria: { title: 'Sangria de Caixa (Retirada de Valores)', icon: ArrowUpRight, color: 'text-rose-600' },
    suprimento: { title: 'Suprimento de Caixa (Entrada de Troco)', icon: ArrowDownLeft, color: 'text-blue-600' },
  };

  const config = titles[mode];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Icon className={`w-5 h-5 ${config.color}`} />
            <h3 className="font-semibold text-slate-800 text-sm">{config.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'abertura' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                Operador: <span className="font-semibold">{usuario.nome}</span> · Data: {new Date().toLocaleDateString('pt-BR')}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor Inicial (Fundo de Troco R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-600">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          {(mode === 'sangria' || mode === 'suprimento') && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor do Movimento (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-600">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo / Justificativa
                </label>
                <input
                  type="text"
                  required
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder={mode === 'sangria' ? 'Ex: Recolhimento de excesso para cofre' : 'Ex: Reforço de moedas para troco'}
                />
              </div>
            </div>
          )}

          {mode === 'fechamento' && caixaAberto && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Operador do Caixa:</span>
                  <span className="font-semibold text-slate-800">{caixaAberto.nomeOperador}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Abertura:</span>
                  <span className="tabular-nums font-mono">{new Date(caixaAberto.dataAbertura).toLocaleTimeString('pt-BR')} (R$ {caixaAberto.valorAbertura.toFixed(2)})</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t border-slate-200">
                  <span>Total Vendas Registradas:</span>
                  <span className="tabular-nums font-mono text-emerald-700">R$ {caixaAberto.totalVendas.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Contagem Física na Gaveta
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">Dinheiro em Espécie (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dinheiroContado}
                    onChange={(e) => setDinheiroContado(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">Total Comprovantes de Cartão (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cartaoContado}
                    onChange={(e) => setCartaoContado(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">Total PIX Recebido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pixContado}
                    onChange={(e) => setPixContado(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              {mode === 'abertura' && 'Confirmar Abertura'}
              {mode === 'fechamento' && 'Encerrar Caixa & Emitir Fechamento'}
              {mode === 'sangria' && 'Efetuar Sangria'}
              {mode === 'suprimento' && 'Efetuar Suprimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
