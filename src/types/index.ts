export interface Task {
  id: string;
  url: string;
  interval: number;
  description: string;
  status: 'active' | 'paused' | 'error';
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}