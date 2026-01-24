
import { Patient } from '../../types';

const STORAGE_KEY = 'odontoflow_patients';

export const savePatients = (patients: Patient[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
};

export const loadPatients = (): Patient[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};
