import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import type {
  User, Income, Expense, CreditCard, FinancialGoal,
  Category, InstallmentGroup, AppSettings
} from '../types';

const DEFAULT_CATEGORIES: Category[] = [
  // Income
  { id: 'cat-sal', name: 'Salário', type: 'income', icon: '💼', color: '#10b981' },
  { id: 'cat-free', name: 'Freelance', type: 'income', icon: '💻', color: '#6366f1' },
  { id: 'cat-venda', name: 'Venda', type: 'income', icon: '🛒', color: '#f59e0b' },
  { id: 'cat-invest', name: 'Investimentos', type: 'income', icon: '📈', color: '#3b82f6' },
  { id: 'cat-outros-in', name: 'Outros', type: 'income', icon: '💰', color: '#8b5cf6' },
  // Expense
  { id: 'cat-alim', name: 'Alimentação', type: 'expense', icon: '🍔', color: '#ef4444' },
  { id: 'cat-farm', name: 'Farmácia', type: 'expense', icon: '💊', color: '#ec4899' },
  { id: 'cat-comb', name: 'Combustível', type: 'expense', icon: '⛽', color: '#f97316' },
  { id: 'cat-ener', name: 'Energia', type: 'expense', icon: '⚡', color: '#eab308' },
  { id: 'cat-agua', name: 'Água', type: 'expense', icon: '💧', color: '#06b6d4' },
  { id: 'cat-inter', name: 'Internet', type: 'expense', icon: '🌐', color: '#8b5cf6' },
  { id: 'cat-alug', name: 'Aluguel', type: 'expense', icon: '🏠', color: '#6366f1' },
  { id: 'cat-esc', name: 'Escola', type: 'expense', icon: '📚', color: '#3b82f6' },
  { id: 'cat-saude', name: 'Saúde', type: 'expense', icon: '🏥', color: '#10b981' },
  { id: 'cat-lazer', name: 'Lazer', type: 'expense', icon: '🎮', color: '#f59e0b' },
  { id: 'cat-cart', name: 'Cartão de Crédito', type: 'expense', icon: '💳', color: '#64748b' },
  { id: 'cat-outros-ex', name: 'Outros', type: 'expense', icon: '📦', color: '#94a3b8' },
];

const DEFAULT_USERS: User[] = [
  { id: 'user-husband', name: 'Marido', role: 'husband', password: '1234', avatar: '👨', color: '#3b82f6' },
  { id: 'user-wife', name: 'Esposa', role: 'wife', password: '1234', avatar: '👩', color: '#ec4899' },
];

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

interface StoreState {
  // Auth
  currentUser: User | null;
  users: User[];
  login: (role: 'husband' | 'wife', password: string) => boolean;
  logout: () => void;
  updateUser: (id: string, data: Partial<User>) => void;

  // Data
  categories: Category[];
  incomes: Income[];
  expenses: Expense[];
  cards: CreditCard[];
  goals: FinancialGoal[];
  installmentGroups: InstallmentGroup[];

  // Settings
  settings: AppSettings;
  toggleDarkMode: () => void;

  // Income actions
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void;
  updateIncome: (id: string, income: Partial<Income>) => void;
  deleteIncome: (id: string) => void;

  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  addInstallments: (group: Omit<InstallmentGroup, 'id' | 'createdAt'>, startDate: string) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  toggleExpenseStatus: (id: string) => void;

  // Card actions
  addCard: (card: Omit<CreditCard, 'id' | 'createdAt'>) => void;
  updateCard: (id: string, card: Partial<CreditCard>) => void;
  deleteCard: (id: string) => void;

  // Goal actions
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  currentUser: null,
  users: loadFromStorage('users', DEFAULT_USERS),
  categories: DEFAULT_CATEGORIES,
  incomes: loadFromStorage('incomes', []),
  expenses: loadFromStorage('expenses', []),
  cards: loadFromStorage('cards', []),
  goals: loadFromStorage('goals', []),
  installmentGroups: loadFromStorage('installmentGroups', []),
  settings: loadFromStorage('settings', { darkMode: false, currency: 'BRL', language: 'pt-BR' }),

  login: (role, password) => {
    const { users } = get();
    const user = users.find(u => u.role === role && u.password === password);
    if (user) {
      set({ currentUser: user });
      return true;
    }
    return false;
  },

  logout: () => set({ currentUser: null }),

  updateUser: async (id, data) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: data.name,
          avatar: data.avatar,
          color: data.color,
          password: data.password,
        })
        .eq('id', id);

      if (error) throw error;

      set(state => {
        const users = state.users.map(u => u.id === id ? { ...u, ...data } : u);
        saveToStorage('users', users);
        return { users, currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...data } : state.currentUser };
      });
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      set(state => {
        const users = state.users.map(u => u.id === id ? { ...u, ...data } : u);
        saveToStorage('users', users);
        return { users, currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...data } : state.currentUser };
      });
    }
  },

  toggleDarkMode: () => {
    set(state => {
      const settings = { ...state.settings, darkMode: !state.settings.darkMode };
      saveToStorage('settings', settings);
      return { settings };
    });
  },

  addIncome: async (income) => {
    const newIncome: Income = { ...income, id: uuidv4(), createdAt: new Date().toISOString() };
    
    try {
      const { error } = await supabase
        .from('incomes')
        .insert([{
          id: newIncome.id,
          date: newIncome.date,
          value: newIncome.value,
          description: newIncome.description,
          category_id: newIncome.categoryId,
          user_id: newIncome.userId,
          notes: newIncome.notes,
          created_at: newIncome.createdAt,
        }]);

      if (error) {
        console.error('❌ Erro ao adicionar renda no Supabase:', error.message);
        console.error('Detalhes:', error);
        throw error;
      } else {
        console.log('✅ Renda adicionada com sucesso ao Supabase');
      }
    } catch (err) {
      console.error('Erro ao adicionar renda no Supabase, usando apenas localStorage:', err);
    }

    set(state => {
      const incomes = [...state.incomes, newIncome];
      saveToStorage('incomes', incomes);
      return { incomes };
    });
  },

  updateIncome: async (id, income) => {
    try {
      const { error } = await supabase
        .from('incomes')
        .update({
          date: income.date,
          value: income.value,
          description: income.description,
          category_id: income.categoryId,
          notes: income.notes,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao atualizar renda:', err);
    }

    set(state => {
      const incomes = state.incomes.map(i => i.id === id ? { ...i, ...income } : i);
      saveToStorage('incomes', incomes);
      return { incomes };
    });
  },

  deleteIncome: async (id) => {
    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao deletar renda:', err);
    }

    set(state => {
      const incomes = state.incomes.filter(i => i.id !== id);
      saveToStorage('incomes', incomes);
      return { incomes };
    });
  },

  addExpense: async (expense) => {
    const newExpense: Expense = { ...expense, id: uuidv4(), createdAt: new Date().toISOString() };
    
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          id: newExpense.id,
          purchase_date: newExpense.purchaseDate,
          due_date: newExpense.dueDate,
          value: newExpense.value,
          description: newExpense.description,
          category_id: newExpense.categoryId,
          payment_method: newExpense.paymentMethod,
          user_id: newExpense.userId,
          status: newExpense.status,
          notes: newExpense.notes,
          installment_group_id: newExpense.installmentGroupId,
          installment_number: newExpense.installmentNumber,
          total_installments: newExpense.totalInstallments,
          card_id: newExpense.cardId,
          created_at: newExpense.createdAt,
        }]);

      if (error) {
        console.error('❌ Erro ao adicionar despesa no Supabase:', error.message);
        console.error('Detalhes:', error);
        throw error;
      } else {
        console.log('✅ Despesa adicionada com sucesso ao Supabase');
      }
    } catch (err) {
      console.error('Erro ao adicionar despesa no Supabase, usando apenas localStorage:', err);
    }

    set(state => {
      const expenses = [...state.expenses, newExpense];
      saveToStorage('expenses', expenses);
      return { expenses };
    });
  },

  addInstallments: async (group, startDate) => {
    const groupId = uuidv4();
    const fullGroup: InstallmentGroup = { ...group, id: groupId, createdAt: new Date().toISOString() };
    const newExpenses: Expense[] = [];
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    for (let i = 0; i < group.totalInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      newExpenses.push({
        id: uuidv4(),
        purchaseDate: startDate,
        dueDate: fmt(dueDate),
        value: group.installmentValue,
        description: `${group.description} (${i + 1}/${group.totalInstallments})`,
        categoryId: group.categoryId,
        paymentMethod: group.paymentMethod,
        userId: group.userId,
        status: 'pending',
        installmentGroupId: groupId,
        installmentNumber: i + 1,
        totalInstallments: group.totalInstallments,
        cardId: group.cardId,
        createdAt: new Date().toISOString(),
      });
    }

    try {
      const { error: groupError } = await supabase
        .from('installment_groups')
        .insert([{
          id: fullGroup.id,
          description: fullGroup.description,
          total_value: fullGroup.totalValue,
          total_installments: fullGroup.totalInstallments,
          installment_value: fullGroup.installmentValue,
          category_id: fullGroup.categoryId,
          payment_method: fullGroup.paymentMethod,
          user_id: fullGroup.userId,
          card_id: fullGroup.cardId,
          start_date: fullGroup.startDate,
          created_at: fullGroup.createdAt,
        }]);

      if (groupError) throw groupError;

      const { error: expenseError } = await supabase
        .from('expenses')
        .insert(newExpenses.map(exp => ({
          id: exp.id,
          purchase_date: exp.purchaseDate,
          due_date: exp.dueDate,
          value: exp.value,
          description: exp.description,
          category_id: exp.categoryId,
          payment_method: exp.paymentMethod,
          user_id: exp.userId,
          status: exp.status,
          notes: exp.notes,
          installment_group_id: exp.installmentGroupId,
          installment_number: exp.installmentNumber,
          total_installments: exp.totalInstallments,
          card_id: exp.cardId,
          created_at: exp.createdAt,
        })));

      if (expenseError) throw expenseError;
    } catch (err) {
      console.error('Erro ao adicionar parcelado:', err);
    }

    set(state => {
      const expenses = [...state.expenses, ...newExpenses];
      const installmentGroups = [...state.installmentGroups, fullGroup];
      saveToStorage('expenses', expenses);
      saveToStorage('installmentGroups', installmentGroups);
      return { expenses, installmentGroups };
    });
  },

  updateExpense: async (id, expense) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          purchase_date: expense.purchaseDate,
          due_date: expense.dueDate,
          value: expense.value,
          description: expense.description,
          category_id: expense.categoryId,
          payment_method: expense.paymentMethod,
          status: expense.status,
          notes: expense.notes,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao atualizar despesa:', err);
    }

    set(state => {
      const expenses = state.expenses.map(e => e.id === id ? { ...e, ...expense } : e);
      saveToStorage('expenses', expenses);
      return { expenses };
    });
  },

  deleteExpense: async (id) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao deletar despesa:', err);
    }

    set(state => {
      const expenses = state.expenses.filter(e => e.id !== id);
      saveToStorage('expenses', expenses);
      return { expenses };
    });
  },

  toggleExpenseStatus: async (id) => {
    const state = get();
    const expense = state.expenses.find(e => e.id === id);
    if (!expense) return;

    const newStatus = expense.status === 'paid' ? 'pending' : 'paid';

    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }

    set(state => {
      const expenses = state.expenses.map(e =>
        e.id === id ? { ...e, status: newStatus } : e
      );
      saveToStorage('expenses', expenses);
      return { expenses };
    });
  },

  addCard: async (card) => {
    const newCard: CreditCard = { ...card, id: uuidv4(), createdAt: new Date().toISOString() };
    
    try {
      const { error } = await supabase
        .from('credit_cards')
        .insert([{
          id: newCard.id,
          name: newCard.name,
          credit_limit: newCard.limit,
          closing_day: newCard.closingDay,
          due_day: newCard.dueDay,
          color: newCard.color,
          user_id: newCard.userId,
          created_at: newCard.createdAt,
        }]);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao adicionar cartão:', err);
    }

    set(state => {
      const cards = [...state.cards, newCard];
      saveToStorage('cards', cards);
      return { cards };
    });
  },

  updateCard: async (id, card) => {
    try {
      const { error } = await supabase
        .from('credit_cards')
        .update({
          name: card.name,
          credit_limit: card.limit,
          closing_day: card.closingDay,
          due_day: card.dueDay,
          color: card.color,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao atualizar cartão:', err);
    }

    set(state => {
      const cards = state.cards.map(c => c.id === id ? { ...c, ...card } : c);
      saveToStorage('cards', cards);
      return { cards };
    });
  },

  deleteCard: async (id) => {
    try {
      const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao deletar cartão:', err);
    }

    set(state => {
      const cards = state.cards.filter(c => c.id !== id);
      saveToStorage('cards', cards);
      return { cards };
    });
  },

  addGoal: async (goal) => {
    const newGoal: FinancialGoal = { ...goal, id: uuidv4(), createdAt: new Date().toISOString() };
    
    try {
      const { error } = await supabase
        .from('financial_goals')
        .insert([{
          id: newGoal.id,
          name: newGoal.name,
          target_value: newGoal.targetValue,
          current_value: newGoal.currentValue,
          target_date: newGoal.targetDate,
          description: newGoal.description,
          icon: newGoal.icon,
          color: newGoal.color,
          user_id: newGoal.userId,
          created_at: newGoal.createdAt,
        }]);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao adicionar meta:', err);
    }

    set(state => {
      const goals = [...state.goals, newGoal];
      saveToStorage('goals', goals);
      return { goals };
    });
  },

  updateGoal: async (id, goal) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .update({
          name: goal.name,
          target_value: goal.targetValue,
          current_value: goal.currentValue,
          target_date: goal.targetDate,
          description: goal.description,
          icon: goal.icon,
          color: goal.color,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao atualizar meta:', err);
    }

    set(state => {
      const goals = state.goals.map(g => g.id === id ? { ...g, ...goal } : g);
      saveToStorage('goals', goals);
      return { goals };
    });
  },

  deleteGoal: async (id) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao deletar meta:', err);
    }

    set(state => {
      const goals = state.goals.filter(g => g.id !== id);
      saveToStorage('goals', goals);
      return { goals };
    });
  },

  contributeToGoal: async (id, amount) => {
    const state = get();
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return;

    const newValue = Math.min(goal.currentValue + amount, goal.targetValue);

    try {
      const { error } = await supabase
        .from('financial_goals')
        .update({ current_value: newValue })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao contribuir à meta:', err);
    }

    set(state => {
      const goals = state.goals.map(g => g.id === id ? { ...g, currentValue: newValue } : g);
      saveToStorage('goals', goals);
      return { goals };
    });
  },
}));
