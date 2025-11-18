
export interface TaskStep {
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface ActivityLog {
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error';
}
