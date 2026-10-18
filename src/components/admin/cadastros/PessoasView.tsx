import React, { useState } from 'react';
import { useAppStore } from '../../../services/store';
import { Pessoa, TipoPessoa, Endereco, Telefone } from '../../../types';
import { Users, Plus, Search, Trash2, Edit2, Check, X, Phone, MapPin } from 'lucide-react';

export const PessoasView: React.FC = () => {
  const store = useAppStore();
  const pessoas = store.getPessoas();

  const [busca, setBusca] = useState<string>('');
  const [filtroPapel, setFiltroPapel] = useState<'TODOS' | 'CLIENTE' | 'FORNECEDOR' | 'TRANSPORTADORA'>('TODOS');
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [pessoaEmEdicao, setPessoaEmEdicao] = useState<Pessoa | null>(null);

  // Form State
  const [tipo, setTipo] = useState<TipoPessoa>('F');
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [site, setSite] = useState<string>('');
  const [ehCliente, setEhCliente] = useState<'S' | 'N'>('S');
  const [ehFornecedor, setEhFornecedor] = useState<'S' | 'N'>('N');
  const [ehColaborador, setEhColaborador] = useState<'S' | 'N'>('N');
  const [ehTransportadora, setEhTransportadora] = useState<'S' | 'N'>('N');
  const [limiteCredito, setLimiteCredito] = useState<string>('1500.00');

  // Campos PF
  const [cpf, setCpf] = useState<string>('');
  const [rg, setRg] = useState<string>('');
  const [dataNascimento, setDataNascimento] = useState<string>('1990-01-01');
  const [sexo, setSexo] = useState<'M' | 'F' | 'O'>('M');

  // Campos PJ
  const [cnpj, setCnpj] = useState<string>('');
  const [nomeFantasia, setNomeFantasia] = useState<string>('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState<string>('');
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState<string>('');
  const [dataConstituicao, setDataConstituicao] = useState<string>('2015-01-01');
  const [crt, setCrt] = useState<'1' | '2' | '3'>('1');

  // Endereços & Telefones
  const [enderecos, setEnderecos] = useState<Endereco[]>([
    {
      logradouro: 'Rua das Flores',
      numero: '100',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01001000',
      municipioIbge: '3550308',
      principal: 'S',
      entrega: 'S',
      cobranca: 'S',
      correspondencia: 'S',
    },
  ]);
  const [telefones, setTelefones] = useState<Telefone[]>([
    { tipo: '0', numero: '11988887777', contato: 'Principal' },
  ]);

  const abrirNovo = () => {
    setPessoaEmEdicao(null);
    setTipo('F');
    setNome('');
    setEmail('');
    setCpf('');
    setRg('');
    setCnpj('');
    setNomeFantasia('');
    setEhCliente('S');
    setEhFornecedor('N');
    setEhTransportadora('N');
    setEnderecos([
      {
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01001000',
        municipioIbge: '3550308',
        principal: 'S',
        entrega: 'N',
        cobranca: 'N',
        correspondencia: 'N',
      },
    ]);
    setTelefones([{ tipo: '0', numero: '', contato: '' }]);
    setModalAberto(true);
  };

  const abrirEdicao = (p: Pessoa) => {
    setPessoaEmEdicao(p);
    setTipo(p.tipo);
    setNome(p.nome);
    setEmail(p.email || '');
    setEhCliente(p.ehCliente);
    setEhFornecedor(p.ehFornecedor);
    setEhColaborador(p.ehColaborador);
    setEhTransportadora(p.ehTransportadora);
    setLimiteCredito(p.limiteCredito?.toString() || '0.00');

    if (p.tipo === 'F') {
      setCpf(p.cpf || '');
      setRg(p.rg || '');
      setDataNascimento(p.dataNascimento || '1990-01-01');
      setSexo(p.sexo || 'M');
    } else {
      setCnpj(p.cnpj || '');
      setNomeFantasia(p.nomeFantasia || '');
      setInscricaoEstadual(p.inscricaoEstadual || '');
      setInscricaoMunicipal(p.inscricaoMunicipal || '');
      setDataConstituicao(p.dataConstituicao || '2015-01-01');
      setCrt(p.crt || '1');
    }

    setEnderecos(p.enderecos && p.enderecos.length > 0 ? p.enderecos : []);
    setTelefones(p.telefones && p.telefones.length > 0 ? p.telefones : []);
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();

    if (tipo === 'F' && cpf.replace(/\D/g, '').length !== 11) {
      return alert('O CPF deve conter exatamente 11 dígitos numéricos.');
    }
    if (tipo === 'J' && cnpj.replace(/\D/g, '').length !== 14) {
      return alert('O CNPJ deve conter exatamente 14 dígitos numéricos.');
    }

    const novaPessoa: Pessoa = {
      id: pessoaEmEdicao ? pessoaEmEdicao.id : Date.now(),
      tipo,
      nome,
      email: email || undefined,
      ehCliente,
      ehFornecedor,
      ehColaborador,
      ehTransportadora,
      limiteCredito: parseFloat(limiteCredito) || 0,
      enderecos,
      telefones,
      ...(tipo === 'F'
        ? {
            cpf: cpf.replace(/\D/g, ''),
            rg,
            dataNascimento,
            sexo,
          }
        : {
            cnpj: cnpj.replace(/\D/g, ''),
            nomeFantasia,
            inscricaoEstadual,
            inscricaoMunicipal,
            dataConstituicao,
            crt,
          }),
    };

    store.savePessoa(novaPessoa);
    setModalAberto(false);
  };

  const pessoasFiltradas = pessoas.filter((p) => {
    const matchBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.cpf && p.cpf.includes(busca)) ||
      (p.cnpj && p.cnpj.includes(busca));

    if (!matchBusca) return false;
    if (filtroPapel === 'CLIENTE') return p.ehCliente === 'S';
    if (filtroPapel === 'FORNECEDOR') return p.ehFornecedor === 'S';
    if (filtroPapel === 'TRANSPORTADORA') return p.ehTransportadora === 'S';
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Cadastro Unificado de Pessoas (PF / PJ)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Gestão com discriminante Zod (F/J), endereços, contatos, papéis comerciais e limites.
          </p>
        </div>

        <button
          onClick={abrirNovo}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Pessoa
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, razão social, CPF ou CNPJ..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          {(['TODOS', 'CLIENTE', 'FORNECEDOR', 'TRANSPORTADORA'] as const).map((papel) => (
            <button
              key={papel}
              onClick={() => setFiltroPapel(papel)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filtroPapel === papel ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {papel === 'TODOS' ? 'Todos' : papel.charAt(0) + papel.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Listagem */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
              <th className="py-2.5 px-4 font-semibold">Tipo</th>
              <th className="py-2.5 px-4 font-semibold">Nome / Razão Social</th>
              <th className="py-2.5 px-4 font-semibold">Documento</th>
              <th className="py-2.5 px-4 font-semibold">Papéis</th>
              <th className="py-2.5 px-4 font-semibold">Cidade / UF</th>
              <th className="py-2.5 px-4 font-semibold text-right">Limite Crédito</th>
              <th className="py-2.5 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pessoasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Nenhuma pessoa cadastrada com os critérios informados.
                </td>
              </tr>
            ) : (
              pessoasFiltradas.map((p) => {
                const endPrincipal = p.enderecos?.find((e) => e.principal === 'S') || p.enderecos?.[0];
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-600 font-bold">
                        {p.tipo === 'F' ? 'PF' : 'PJ'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{p.nome}</div>
                      {p.nomeFantasia && <div className="text-[11px] text-slate-600">{p.nomeFantasia}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {p.tipo === 'F' ? p.cpf || '—' : p.cnpj || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        {p.ehCliente === 'S' && <span>Cliente</span>}
                        {p.ehFornecedor === 'S' && <span>· Fornecedor</span>}
                        {p.ehTransportadora === 'S' && <span>· Transportadora</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {endPrincipal ? `${endPrincipal.cidade}/${endPrincipal.uf}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-800">
                      {p.limiteCredito ? `R$ ${p.limiteCredito.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirEdicao(p)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir "${p.nome}"?`)) {
                              store.deletePessoa(p.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Formulário Completo */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
              <h3 className="font-semibold text-slate-800 text-sm">
                {pessoaEmEdicao ? `Editar Pessoa: ${pessoaEmEdicao.nome}` : 'Cadastrar Nova Pessoa'}
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-6">
              {/* Alternância PF / PJ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                  Tipo de Pessoa
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTipo('F')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      tipo === 'F' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Pessoa Física (PF)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('J')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      tipo === 'J' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Pessoa Jurídica (PJ)
                  </button>
                </div>
              </div>

              {/* Dados Principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {tipo === 'F' ? 'Nome Completo' : 'Razão Social'}
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                {tipo === 'F' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CPF (11 dígitos)</label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                        placeholder="12345678901"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">RG</label>
                      <input
                        type="text"
                        value={rg}
                        onChange={(e) => setRg(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ (14 dígitos)</label>
                      <input
                        type="text"
                        required
                        maxLength={14}
                        value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                        placeholder="12345678000190"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia</label>
                      <input
                        type="text"
                        value={nomeFantasia}
                        onChange={(e) => setNomeFantasia(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Inscrição Estadual</label>
                      <input
                        type="text"
                        value={inscricaoEstadual}
                        onChange={(e) => setInscricaoEstadual(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CRT</label>
                      <select
                        value={crt}
                        onChange={(e) => setCrt(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      >
                        <option value="1">1 - Simples Nacional</option>
                        <option value="2">2 - Simples c/ excesso</option>
                        <option value="3">3 - Regime Normal</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Limite de Crédito (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={limiteCredito}
                    onChange={(e) => setLimiteCredito(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              {/* Papéis Comerciais */}
              <div className="pt-4 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                  Papéis e Vínculos
                </label>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ehCliente === 'S'}
                      onChange={(e) => setEhCliente(e.target.checked ? 'S' : 'N')}
                    />
                    <span>É Cliente</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ehFornecedor === 'S'}
                      onChange={(e) => setEhFornecedor(e.target.checked ? 'S' : 'N')}
                    />
                    <span>É Fornecedor</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ehTransportadora === 'S'}
                      onChange={(e) => setEhTransportadora(e.target.checked ? 'S' : 'N')}
                    />
                    <span>É Transportadora</span>
                  </label>
                </div>
              </div>

              {/* Endereço Principal */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Endereço Principal
                  </label>
                </div>
                {enderecos.map((end, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-600 mb-0.5">Logradouro</label>
                      <input
                        type="text"
                        value={end.logradouro}
                        onChange={(e) => {
                          const copy = [...enderecos];
                          copy[idx].logradouro = e.target.value;
                          setEnderecos(copy);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Número</label>
                      <input
                        type="text"
                        value={end.numero}
                        onChange={(e) => {
                          const copy = [...enderecos];
                          copy[idx].numero = e.target.value;
                          setEnderecos(copy);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Bairro</label>
                      <input
                        type="text"
                        value={end.bairro}
                        onChange={(e) => {
                          const copy = [...enderecos];
                          copy[idx].bairro = e.target.value;
                          setEnderecos(copy);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-600 mb-0.5">Cidade</label>
                      <input
                        type="text"
                        value={end.cidade}
                        onChange={(e) => {
                          const copy = [...enderecos];
                          copy[idx].cidade = e.target.value;
                          setEnderecos(copy);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">UF</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={end.uf}
                        onChange={(e) => {
                          const copy = [...enderecos];
                          copy[idx].uf = e.target.value.toUpperCase();
                          setEnderecos(copy);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">CEP</label>
                      <input
                        type="text"
                        maxLength={8}
                        value={end.cep}
                        onChange={(e) => {
                          const copy = [...enderecos];
                          copy[idx].cep = e.target.value;
                          setEnderecos(copy);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Salvar Pessoa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
