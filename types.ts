
export enum AppView {
  WELCOME = 'WELCOME',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  DASHBOARD = 'DASHBOARD',
  ASSISTANT = 'ASSISTANT',
  CALCULATOR = 'CALCULATOR',
  TAX_RESULT = 'TAX_RESULT',
  SETTINGS = 'SETTINGS',
  TRANSACTION_HISTORY = 'TRANSACTION_HISTORY',
  HELP_CENTER = 'HELP_CENTER',
  TERMS_OF_USE = 'TERMS_OF_USE'
}

export interface UserProfile {
  name: string;
  mst: string;
  type: string;
  avatarUrl?: string;
  businessCategoryId: string;
  vatRate: number;
  pitRate: number;
}

export interface TaxRecord {
  id: string;
  month: string;
  revenue: number;
  taxAmount: number;
  status: 'paid' | 'pending';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type TaxPeriod = 'quarter' | 'year';

export interface TaxCalculationData {
  revenue: number;
  expenses: number;
  categoryLabel: string;
  vatRate: number;
  pitRate: number;
  period: TaxPeriod;
  pitMethod: 'threshold' | 'expense';
}
