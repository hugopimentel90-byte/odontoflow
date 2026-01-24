
export type Classification = 'MA' | 'MI' | 'DD' | 'FAB/EB';

export interface Patient {
  id: string;
  name: string;
  classification: Classification;
  procedures: string[];
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  classificationStats: { name: string; value: number }[];
  procedureStats: { name: string; count: number }[];
  recentPatients: Patient[];
}
