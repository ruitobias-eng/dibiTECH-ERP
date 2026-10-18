import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import { Empresa, CrtEmpresa } from '../../../types';
import {
  SEED_UFS, SEED_MUNICIPIOS, SEED_BANCOS, SEED_AGENCIAS,
  SEED_CONTAS_CAIXA, SEED_SERIES_FISCAIS
} from '../../../data/seedData';
import { Building2, ShieldCheck, Key, MapPin, Landmark, Check } from 'lucide-react';

export const EmpresaView: React.FC = () => {
  const store = useAppStore();
  const empresa = store.getEmpresa();
  const [formData, setFormData] = useState<Empresa>(empresa);
  const [saved, setSaved] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'empresa' | 'series' | 'tabelas_apoio'>('empresa');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateEmpresa(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header com Tabs de Configuração */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Configurações da Empresa &amp; Dados Fiscais
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Gestão do emitente, regime tributário (CRT 1 Simples / CRT 3 Normal), séries fiscais e credenciais ACBr.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('empresa')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'empresa'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dados da Empresa &amp; ACBr
          </button>
          <button
            onClick={() => setActiveTab('series')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'series'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Séries Fiscais ({SEED_SERIES_FISCAIS.length})
          </button>
          <button
            onClick={() => setActiveTab('tabelas_apoio')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'tabelas_apoio'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tabelas de Apoio (UF/Bancos)
          </button>
        </div>
      </div>

      {activeTab === 'empresa' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card: Identificação Fiscal & CRT */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Identificação Cadastral &amp; Regime Tributário</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Razão Social</label>
                <input
                  type="text"
                  required
                  value={formData.razaoSocial}
                  onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  required
                  value={formData.nomeFantasia}
                  onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ</label>
                <input
                  type="text"
                  required
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inscrição Estadual (IE)</label>
                <input
                  type="text"
                  required
                  value={formData.inscricaoEstadual}
                  onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inscrição Municipal (IM)</label>
                <input
                  type="text"
                  value={formData.inscricaoMunicipal}
                  onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CNAE Principal</label>
                <input
                  type="text"
                  value={formData.cnae}
                  onChange={(e) => setFormData({ ...formData, cnae: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            {/* CRT - Código de Regime Tributário */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                CRT - Código de Regime Tributário (Impacta cálculo de ICMS e exigência de CSOSN/CST)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { crt: 1 as CrtEmpresa, label: '1 - Simples Nacional', desc: 'Exige CSOSN nos produtos e desonera ICMS por alíquota unificada DAS' },
                  { crt: 2 as CrtEmpresa, label: '2 - Simples c/ Excesso de Sublimite', desc: 'Recolhimento de ICMS/ISS pelo regime normal' },
                  { crt: 3 as CrtEmpresa, label: '3 - Regime Normal (Lucro Presumido/Real)', desc: 'Exige CST ICMS com destaque de alíquota e base integral' },
                ].map((item) => (
                  <button
                    key={item.crt}
                    type="button"
                    onClick={() => setFormData({ ...formData, crt: item.crt })}
                    className={`p-3 text-left rounded-lg border text-xs transition-colors cursor-pointer ${
                      formData.crt === item.crt
                        ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{item.label}</div>
                    <div className="text-slate-600 text-[11px] mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Endereço & Localização */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">Endereço da Matriz &amp; Códigos IBGE</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Logradouro</label>
                <input
                  type="text"
                  required
                  value={formData.logradouro}
                  onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Número</label>
                <input
                  type="text"
                  required
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro</label>
                <input
                  type="text"
                  required
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade</label>
                <input
                  type="text"
                  required
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">UF</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={formData.uf}
                  onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Código IBGE Município</label>
                <input
                  type="text"
                  required
                  maxLength={7}
                  value={formData.codigoIbgeCidade}
                  onChange={(e) => setFormData({ ...formData, codigoIbgeCidade: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Código IBGE UF</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={formData.codigoIbgeUf}
                  onChange={(e) => setFormData({ ...formData, codigoIbgeUf: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Card: Configuração ACBr & Certificado Digital A1 */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Key className="w-5 h-5 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-800">
                Integração Projeto ACBr (ACBrLib-Nodejs) &amp; SEFAZ
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ambiente de Emissão SEFAZ</label>
                <select
                  value={formData.ambienteSefaz}
                  onChange={(e) => setFormData({ ...formData, ambienteSefaz: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="homologacao">Homologação (Ambiente de Testes SEFAZ)</option>
                  <option value="producao">Produção (Com validade jurídica real)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ID Token CSC (NFC-e)</label>
                <input
                  type="text"
                  value={formData.idCscNfce}
                  onChange={(e) => setFormData({ ...formData, idCscNfce: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  placeholder="000001"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Código CSC (Código de Segurança)</label>
                <input
                  type="text"
                  value={formData.codigoCscNfce}
                  onChange={(e) => setFormData({ ...formData, codigoCscNfce: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  placeholder="ABCD1234EFGH5678IJKL9012"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Arquivo Certificado Digital A1 (.pfx)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    disabled
                    value={formData.certificadoNome}
                    className="flex-1 px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-mono text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => alert('Certificado A1 válido e carregado no emulador ACBrLib.')}
                    className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer border border-slate-200"
                  >
                    Testar Validade
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Validade do Certificado</label>
                <input
                  type="text"
                  disabled
                  value={formData.certificadoValidade}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-mono text-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <Check className="w-4 h-4" /> Alterações salvas com sucesso!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Salvar Alterações Fiscais
            </button>
          </div>
        </form>
      )}

      {activeTab === 'series' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Séries Fiscais Cadastradas
            </span>
          </div>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-4 font-semibold">Série</th>
                <th className="py-2.5 px-4 font-semibold">Modelo</th>
                <th className="py-2.5 px-4 font-semibold">Descrição</th>
                <th className="py-2.5 px-4 font-semibold text-right">Último Número Emitido</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SEED_SERIES_FISCAIS.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold font-mono text-slate-800">{s.serie}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">Modelo {s.modelo}</span>
                    <span className="text-slate-600 ml-1">
                      {s.modelo === '65' ? '(NFC-e Varejo)' : s.modelo === '55' ? '(NF-e Faturamento)' : '(SAT-CF-e)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{s.descricao}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 tabular-nums">
                    {s.ultimoNumero}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-emerald-700 font-semibold text-xs">Ativa</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tabelas_apoio' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* UFs */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
              Tabela de UFs &amp; Alíquotas Internas ICMS (Seed Somente Leitura)
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Sigla</th>
                    <th className="py-2 px-3">Nome</th>
                    <th className="py-2 px-3">IBGE</th>
                    <th className="py-2 px-3 text-right">ICMS Interno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SEED_UFS.map((u) => (
                    <tr key={u.sigla}>
                      <td className="py-1.5 px-3 font-bold font-mono">{u.sigla}</td>
                      <td className="py-1.5 px-3">{u.nome}</td>
                      <td className="py-1.5 px-3 font-mono text-slate-400">{u.codigoIbge}</td>
                      <td className="py-1.5 px-3 text-right font-mono tabular-nums">{u.aliquotaInternaIcms}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bancos & Contas */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
              Bancos Homologados &amp; Contas Caixa
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Cód</th>
                    <th className="py-2 px-3">Instituição Bancária</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SEED_BANCOS.map((b) => (
                    <tr key={b.codigo}>
                      <td className="py-1.5 px-3 font-mono font-bold">{b.codigo}</td>
                      <td className="py-1.5 px-3">{b.nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
