import { supabase } from '../lib/supabase';
import type { Expense, Income, CreditCard, FinancialGoal } from '../types';

const normalizeExpense = (row: any): Expense => ({
  id: row.id,
  purchaseDate: row.purchase_date ?? '',
  dueDate: row.due_date ?? '',
  value: Number(row.value ?? 0),
  description: row.description ?? '',
  categoryId: row.category_id ?? '',
  paymentMethod: row.payment_method ?? 'money',
  userId: row.user_id ?? '',
  status: row.status === 'paid' ? 'paid' : 'pending',
  notes: row.notes ?? '',
  installmentGroupId: row.installment_group_id ?? undefined,
  installmentNumber: row.installment_number ?? undefined,
  totalInstallments: row.total_installments ?? undefined,
  cardId: row.card_id ?? undefined,
  createdAt: row.created_at ?? new Date().toISOString(),
});

const normalizeIncome = (row: any): Income => ({
  id: row.id,
  date: row.date ?? '',
  value: Number(row.value ?? 0),
  description: row.description ?? '',
  categoryId: row.category_id ?? '',
  userId: row.user_id ?? '',
  notes: row.notes ?? '',
  createdAt: row.created_at ?? new Date().toISOString(),
});

const normalizeCard = (row: any): CreditCard => ({
  id: row.id,
  name: row.name ?? '',
  limit: Number(row.credit_limit ?? 0),
  closingDay: Number(row.closing_day ?? 0),
  dueDay: Number(row.due_day ?? 0),
  color: row.color ?? '#8b5cf6',
  userId: row.user_id ?? '',
  createdAt: row.created_at ?? new Date().toISOString(),
});

const normalizeGoal = (row: any): FinancialGoal => ({
  id: row.id,
  name: row.name ?? '',
  targetValue: Number(row.target_value ?? 0),
  currentValue: Number(row.current_value ?? 0),
  targetDate: row.target_date ?? '',
  description: row.description ?? '',
  icon: row.icon ?? '🎯',
  color: row.color ?? '#3b82f6',
  userId: row.user_id ?? '',
  createdAt: row.created_at ?? new Date().toISOString(),
});

export async function fetchExpenses(userId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map(normalizeExpense);
}

export async function addExpenseToSupabase(expense: Omit<Expense, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      purchase_date: expense.purchaseDate,
      due_date: expense.dueDate,
      value: expense.value,
      description: expense.description,
      category_id: expense.categoryId,
      payment_method: expense.paymentMethod,
      user_id: expense.userId,
      status: expense.status,
      notes: expense.notes,
      installment_group_id: expense.installmentGroupId,
      installment_number: expense.installmentNumber,
      total_installments: expense.totalInstallments,
      card_id: expense.cardId,
    }])
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function fetchIncomes(userId: string): Promise<Income[]> {
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map(normalizeIncome);
}

export async function addIncomeToSupabase(income: Omit<Income, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('incomes')
    .insert([{
      date: income.date,
      value: income.value,
      description: income.description,
      category_id: income.categoryId,
      user_id: income.userId,
      notes: income.notes,
    }])
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function fetchCards(userId: string): Promise<CreditCard[]> {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map(normalizeCard);
}

export async function fetchGoals(userId: string): Promise<FinancialGoal[]> {
  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map(normalizeGoal);
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) throw error;
  return data || [];
}
