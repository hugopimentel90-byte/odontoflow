import { supabase } from './supabase';
import { Patient } from '../types';

export const getPatients = async (): Promise<Patient[]> => {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching patients:', error);
        throw error;
    }

    return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        classification: p.classification,
        procedures: p.procedures,
        notes: p.notes,
        createdAt: p.created_at
    }));
};

export const addPatient = async (patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> => {
    const { data, error } = await supabase
        .from('patients')
        .insert([
            {
                name: patient.name,
                classification: patient.classification,
                procedures: patient.procedures,
                notes: patient.notes
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('Error adding patient:', error);
        throw error;
    }

    return {
        id: data.id,
        name: data.name,
        classification: data.classification,
        procedures: data.procedures,
        notes: data.notes,
        createdAt: data.created_at
    };
};

export const updatePatient = async (id: string, patient: Partial<Omit<Patient, 'id' | 'createdAt'>>): Promise<Patient> => {
    const { data, error } = await supabase
        .from('patients')
        .update({
            ...(patient.name && { name: patient.name }),
            ...(patient.classification && { classification: patient.classification }),
            ...(patient.procedures && { procedures: patient.procedures }),
            ...(patient.notes !== undefined && { notes: patient.notes })
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating patient:', error);
        throw error;
    }

    return {
        id: data.id,
        name: data.name,
        classification: data.classification,
        procedures: data.procedures,
        notes: data.notes,
        createdAt: data.created_at
    };
};

export const deletePatient = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting patient:', error);
        throw error;
    }
};
