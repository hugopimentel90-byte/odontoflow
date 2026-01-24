
import React, { useState, useEffect } from 'react';
import { PROCEDURES, CLASSIFICATIONS } from '../constants';
import { Patient, Classification } from '../types';
import { CheckCircle, Search, User, ClipboardList, Activity, XCircle, FileText } from 'lucide-react';

interface PatientFormProps {
  onAddPatient: (patient: Omit<Patient, 'id' | 'createdAt'>, id?: string) => void;
  onCancel: () => void;
  initialData?: Patient | null;
}

const PatientForm: React.FC<PatientFormProps> = ({ onAddPatient, onCancel, initialData }) => {
  const [name, setName] = useState('');
  const [classification, setClassification] = useState<Classification | ''>('');
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setClassification(initialData.classification);
      setSelectedProcedures(initialData.procedures);
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  const toggleProcedure = (procedure: string) => {
    setSelectedProcedures(prev =>
      prev.includes(procedure)
        ? prev.filter(p => p !== procedure)
        : [...prev, procedure]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !classification || selectedProcedures.length === 0) {
      alert('Por favor, preencha todos os campos e selecione pelo menos um procedimento.');
      return;
    }

    onAddPatient({
      name,
      classification: classification as Classification,
      procedures: selectedProcedures,
      notes,
    }, initialData?.id);

    // Reset form
    setName('');
    setClassification('');
    setSelectedProcedures([]);
    setNotes('');
    setSearchTerm('');
  };

  const filteredProcedures = PROCEDURES.filter(p =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <User className="w-8 h-8" />
          {initialData ? 'Editar Paciente' : 'Cadastro de Paciente'}
        </h2>
        <p className="text-blue-100 mt-2">
          {initialData ? 'Altere os dados conforme necessário.' : 'Insira os dados para registrar um novo atendimento.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" /> Nome do Paciente
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Silva"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> Classificação
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CLASSIFICATIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setClassification(c)}
                className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  classification === c
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-500" /> Procedimentos Realizados
          </label>
          
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar procedimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto pr-2 space-y-2 border border-gray-100 rounded-xl p-2 bg-gray-50/50 custom-scrollbar">
            {filteredProcedures.map((proc) => (
              <button
                key={proc}
                type="button"
                onClick={() => toggleProcedure(proc)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left text-sm transition-all ${
                  selectedProcedures.includes(proc)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-blue-50'
                }`}
              >
                <span>{proc}</span>
                {selectedProcedures.includes(proc) && <CheckCircle className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" /> Notas / Observações Adicionais
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Alergias, histórico relevante, observações clínicas..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none min-h-[120px] resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {initialData ? 'Atualizar Cadastro' : 'Finalizar Cadastro'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-4 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" /> Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
