import { supabase } from '../lib/supabase';
import type { Expense, Income, CreditCard, FinancialGoal, User } from '../types';

// Exemplo de funções para usar Supabase no store

export async function fetchExpenses(userId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
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
  return data || [];
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
  return data || [];
}

export async function fetchGoals(userId: string): Promise<FinancialGoal[]> {
  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) throw error;
  return data || [];
}
