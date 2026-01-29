
import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { Users, User, ClipboardCheck, TrendingUp, Calendar, Search, Filter, X, ChevronDown, Edit2, Trash2, Info, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Patient, Classification } from '../types';
import { CLASSIFICATIONS, PROCEDURES } from '../constants';

interface DashboardProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC<DashboardProps> = ({ patients, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<Classification | ''>('');
  const [filterProcedures, setFilterProcedures] = useState<string[]>([]);
  const [procedureSearchTerm, setProcedureSearchTerm] = useState('');
  const [isProcedureDropdownOpen, setIsProcedureDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // State for the advanced deletion confirmation
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [confirmName, setConfirmName] = useState('');

  // Filtered dataset for the entire dashboard
  const filteredPatients = useMemo(() => {
    let result = [...patients];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.classification.toLowerCase().includes(term)
      );
    }

    if (filterClass) {
      result = result.filter(p => p.classification === filterClass);
    }

    if (filterProcedures.length > 0) {
      result = result.filter(p =>
        p.procedures.some(proc => filterProcedures.includes(proc.trim()))
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter(p => new Date(p.createdAt).getTime() >= start.getTime());
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(p => new Date(p.createdAt).getTime() <= end.getTime());
    }

    return result;
  }, [patients, searchTerm, filterClass, filterProcedures, startDate, endDate]);

  // Statistics
  const procedureCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredPatients.forEach(p => {
      p.procedures.forEach(proc => {
        const trimmedProc = proc.trim();
        // Se houver filtro de procedimentos, conta apenas os que estão no filtro
        if (filterProcedures.length === 0 || filterProcedures.includes(trimmedProc)) {
          counts[trimmedProc] = (counts[trimmedProc] || 0) + 1;
        }
      });
    });
    return counts;
  }, [filteredPatients, filterProcedures]);

  const classificationData = useMemo(() => CLASSIFICATIONS.map(cls => ({
    name: cls,
    value: filteredPatients.filter(p => p.classification === cls).length
  })).filter(item => item.value > 0), [filteredPatients]);

  const procedureData = useMemo(() => Object.entries(procedureCounts)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 5), [procedureCounts]);

  const stats = [
    { label: 'Pacientes Filtrados', value: filteredPatients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Procedimentos Realizados', value: Object.values(procedureCounts).reduce((a: number, b: number) => a + b, 0), icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Atendimentos Hoje', value: filteredPatients.filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString()).length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Percentual do Total', value: patients.length ? `${Math.round((filteredPatients.length / patients.length) * 100)}%` : '0%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  const resetFilters = () => {
    setSearchTerm('');
    setFilterClass('');
    setFilterProcedures([]);
    setProcedureSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  const isFiltered = searchTerm || filterClass || filterProcedures.length > 0 || startDate || endDate;

  const handleConfirmDelete = () => {
    if (patientToDelete && confirmName === patientToDelete.name) {
      onDelete(patientToDelete.id);
      setPatientToDelete(null);
      setConfirmName('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Search and Main Filter Toggle */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por nome ou procedimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showFilters || isFiltered
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {isFiltered && <span className="w-2 h-2 bg-white rounded-full ml-1 animate-pulse"></span>}
          </button>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
              title="Limpar filtros"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-300">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Classificação</label>
            <div className="relative">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value as Classification)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm appearance-none focus:ring-4 focus:ring-blue-100 outline-none pr-10"
              >
                <option value="">Todas</option>
                {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Procedimentos</label>
            <div className="relative">
              <button
                onClick={() => setIsProcedureDropdownOpen(!isProcedureDropdownOpen)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm flex justify-between items-center hover:bg-white hover:border-blue-400 transition-all focus:ring-4 focus:ring-blue-100 outline-none"
              >
                <span className="truncate">
                  {filterProcedures.length === 0
                    ? 'Todos os procedimentos'
                    : `${filterProcedures.length} selecionado${filterProcedures.length > 1 ? 's' : ''}`}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProcedureDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProcedureDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProcedureDropdownOpen(false)}
                  ></div>
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 w-[280px] md:w-[320px]">
                    <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar procedimento..."
                          value={procedureSearchTerm}
                          onChange={(e) => setProcedureSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        />
                      </div>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto p-2 custom-scrollbar">
                      {PROCEDURES.filter(p => p.toLowerCase().includes(procedureSearchTerm.toLowerCase())).map(p => (
                        <button
                          key={p}
                          onClick={() => {
                            setFilterProcedures(prev =>
                              prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                            );
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all mb-1 ${filterProcedures.includes(p)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${filterProcedures.includes(p)
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-300'
                            }`}>
                            {filterProcedures.includes(p) && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <span className="truncate">{p}</span>
                        </button>
                      ))}
                    </div>
                    {filterProcedures.length > 0 && (
                      <div className="p-2 border-t border-gray-50 bg-gray-50/30">
                        <button
                          onClick={() => setFilterProcedures([])}
                          className="w-full py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all uppercase tracking-wider"
                        >
                          Limpar Seleção
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-blue-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
            </div>
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Distribuição por Classificação</h3>
          <div className="h-[280px] w-full">
            {classificationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classificationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {classificationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
                Sem dados para exibir
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Top 5 Procedimentos</h3>
          <div className="h-[280px] w-full">
            {procedureData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={procedureData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} fontSize={10} tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
                Sem dados para exibir
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Registros Localizados</h3>
            <p className="text-sm text-gray-500 mt-1">Clique no nome para ver detalhes e notas.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-8 py-4">Nome</th>
                <th className="px-8 py-4">Classe</th>
                <th className="px-8 py-4">Procedimentos</th>
                <th className="px-8 py-4 text-right">Data</th>
                <th className="px-8 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.slice().reverse().map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-4 text-sm font-semibold text-gray-900">
                    <button
                      onClick={() => setSelectedPatient(p)}
                      className="hover:text-blue-600 hover:underline flex items-center gap-2 text-left"
                    >
                      {p.name}
                      {p.notes && <FileText className="w-3 h-3 text-blue-400" />}
                    </button>
                  </td>
                  <td className="px-8 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {p.classification}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-500 max-w-[200px]">
                    <div className="truncate group-hover:whitespace-normal transition-all" title={p.procedures.join(', ')}>
                      {p.procedures.join(', ')}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-500 text-right font-medium">
                    {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-8 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(p)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-all"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setPatientToDelete(p); setConfirmName(''); }}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="w-8 h-8 text-gray-300" />
                      <p className="text-gray-500 font-bold">Nenhum paciente encontrado</p>
                      <button onClick={resetFilters} className="text-sm text-blue-600 font-semibold hover:underline">Limpar filtros</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{selectedPatient.name}</h3>
                  <p className="text-blue-100 text-xs">Registrado em {new Date(selectedPatient.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Classificação</p>
                  <p className="text-blue-700 font-bold text-lg">{selectedPatient.classification}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">ID Interno</p>
                  <p className="text-slate-700 font-mono text-sm">#{selectedPatient.id}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-wider flex items-center gap-2">
                  <ClipboardCheck className="w-3 h-3" /> Procedimentos Realizados
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.procedures.map((proc, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                      {proc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                <p className="text-[10px] uppercase font-bold text-amber-600 mb-3 tracking-wider flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Notas e Observações
                </p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedPatient.notes || "Nenhuma nota adicional registrada para este paciente."}
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => { onEdit(selectedPatient); setSelectedPatient(null); }}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Editar Cadastro
              </button>
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Deletion Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-red-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-red-100">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto text-red-600">
                <AlertTriangle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Confirmar Exclusão</h3>
                <p className="text-gray-500 text-sm">
                  Esta ação é <strong>permanente</strong> e não pode ser desfeita. Para confirmar a exclusão do registro de <span className="text-red-600 font-bold">{patientToDelete.name}</span>, digite o nome dele exatamente como aparece abaixo:
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 py-3 rounded-xl border border-gray-100 font-mono text-lg font-bold text-gray-700 select-none">
                  {patientToDelete.name}
                </div>

                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder="Digite o nome para confirmar"
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none text-center font-medium"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleConfirmDelete}
                  disabled={confirmName !== patientToDelete.name}
                  className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] ${confirmName === patientToDelete.name
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                    : 'bg-gray-300 cursor-not-allowed shadow-none'
                    }`}
                >
                  Excluir Permanentemente
                </button>
                <button
                  onClick={() => { setPatientToDelete(null); setConfirmName(''); }}
                  className="w-full py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
