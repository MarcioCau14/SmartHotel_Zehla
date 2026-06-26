export interface AIAgent {
  id: string;
  icon: string;
  status: 'active' | 'sleeping' | 'error';
  name: string;
  role: string;
  tasksCompleted: number;
  tasksFailed: number;
  successRate: number;
  avgLatencyMs: number;
  modelUsed: string;
  uptimeHours: number;
}

export interface Property {
  id: string;
  name: string;
  city: string;
  state: string;
  rooms: number;
  status: string;
  trialDaysLeft: number;
  googleRating: number;
}

export { getBrainHealth, intentStats } from './brain-health';
