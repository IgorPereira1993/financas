export type UserRole = 'husband' | 'wife';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  password: string;
  avatar: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export type PaymentMethod = 'money' | 'debit' | 'credit' | 'pix' | 'transfer' | 'check';

export interface Income {
  id: string;
  date: string;
  value: number;
  description: string;
  categoryId: string;
  userId: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  purchaseDate: string;
  dueDate: string;
  value: number;
  description: string;
  categoryId: string;
  paymentMethod: PaymentMethod;
  userId: string;
  status: 'paid' | 'pending';
  notes?: string;
  installmentGroupId?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  cardId?: string;
  createdAt: string;
}

export interface InstallmentGroup {
  id: string;
  description: string;
  totalValue: number;
  totalInstallments: number;
  installmentValue: number;
  categoryId: string;
  paymentMethod: PaymentMethod;
  userId: string;
  cardId?: string;
  startDate: string;
  createdAt: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  userId: string;
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  targetDate: string;
  description?: string;
  icon: string;
  color: string;
  userId: string;
  createdAt: string;
}

export interface AppSettings {
  darkMode: boolean;
  currency: string;
  language: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  date: string;
  value: number;
  description: string;
  categoryId: string;
  userId: string;
}
