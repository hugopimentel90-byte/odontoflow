
import React, { useState, useEffect } from 'react';
import { LayoutGrid, PlusCircle, LogOut, Bell, Settings, UserCircle } from 'lucide-react';
import PatientForm from './components/PatientForm';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { Patient } from '../types';
import { loadPatients, savePatients } from './services/storage';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      setPatients(loadPatients());
    }
  }, [session]);

  const handleAddPatient = (data: Omit<Patient, 'id' | 'createdAt'>, id?: string) => {
    let updated: Patient[];

    if (id) {
      // Edit existing
      updated = patients.map(p =>
        p.id === id
          ? { ...p, ...data }
          : p
      );
    } else {
      // Add new
      const newPatient: Patient = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      updated = [...patients, newPatient];
    }

    setPatients(updated);
    savePatients(updated);
    setEditingPatient(null);
    setView('dashboard');
  };

  const handleEditInitiate = (patient: Patient) => {
    setEditingPatient(patient);
    setView('form');
  };

  const handleDeletePatient = (id: string) => {
    const updated = patients.filter(p => p.id !== id);
    setPatients(updated);
    savePatients(updated);
  };

  const handleCancelForm = () => {
    setEditingPatient(null);
    setView('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 text-blue-600 font-bold text-2xl">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              O
            </div>
            OdontoFlow
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => { setView('dashboard'); setEditingPatient(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <LayoutGrid className="w-5 h-5" /> Dashboard
          </button>
          <button
            onClick={() => { setView('form'); setEditingPatient(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === 'form' && !editingPatient ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <PlusCircle className="w-5 h-5" /> Cadastrar Paciente
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">
            O
          </div>
          OdontoFlow
        </div>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-gray-400" />
          <UserCircle className="w-6 h-6 text-gray-400" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {view === 'dashboard' ? 'Visão Geral' : (editingPatient ? 'Editar Registro' : 'Novo Cadastro')}
            </h1>
            <p className="text-gray-500 mt-1">
              {view === 'dashboard'
                ? 'Monitore os principais indicadores da sua clínica.'
                : (editingPatient ? 'Atualize as informações do paciente.' : 'Registre os atendimentos realizados hoje.')}
            </p>
          </div>
          <div className="hidden md:flex gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {view === 'dashboard' ? (
          <Dashboard patients={patients} onEdit={handleEditInitiate} onDelete={handleDeletePatient} />
        ) : (
          <PatientForm onAddPatient={handleAddPatient} onCancel={handleCancelForm} initialData={editingPatient} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-around items-center z-50 shadow-2xl">
        <button
          onClick={() => { setView('dashboard'); setEditingPatient(null); }}
          className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>
        <div className="relative -top-6">
          <button
            onClick={() => { setView('form'); setEditingPatient(null); }}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transform transition-transform active:scale-90 ${view === 'form' ? 'bg-blue-700 text-white rotate-45' : 'bg-blue-600 text-white'
              }`}
          >
            <PlusCircle className="w-8 h-8" />
          </button>
        </div>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold">Ajustes</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
