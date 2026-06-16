import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

export const useSyncOnline = () => {
  const store = useStore();

  useEffect(() => {
    const handleOnline = async () => {
      console.log('Internet restaurada, sincronizando dados...');

      try {
        // Sincronizar receitas
        for (const income of store.incomes) {
          try {
            const { data, error } = await supabase
              .from('incomes')
              .select('id')
              .eq('id', income.id)
              .single();

            if (!data && !error) {
              // Não existe no Supabase, inserir
              await supabase.from('incomes').insert([{
                id: income.id,
                date: income.date,
                value: income.value,
                description: income.description,
                category_id: income.categoryId,
                user_id: income.userId,
                notes: income.notes,
                created_at: income.createdAt,
              }]);
            } else if (!error) {
              // Existe, atualizar
              await supabase.from('incomes').update({
                date: income.date,
                value: income.value,
                description: income.description,
                category_id: income.categoryId,
                notes: income.notes,
              }).eq('id', income.id);
            }
          } catch (err) {
            console.error(`Erro ao sincronizar receita ${income.id}:`, err);
          }
        }

        // Sincronizar despesas
        for (const expense of store.expenses) {
          try {
            const { data, error } = await supabase
              .from('expenses')
              .select('id')
              .eq('id', expense.id)
              .single();

            if (!data && !error) {
              // Não existe no Supabase, inserir
              await supabase.from('expenses').insert([{
                id: expense.id,
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
                created_at: expense.createdAt,
              }]);
            } else if (!error) {
              // Existe, atualizar
              await supabase.from('expenses').update({
                purchase_date: expense.purchaseDate,
                due_date: expense.dueDate,
                value: expense.value,
                description: expense.description,
                category_id: expense.categoryId,
                payment_method: expense.paymentMethod,
                status: expense.status,
                notes: expense.notes,
                card_id: expense.cardId,
              }).eq('id', expense.id);
            }
          } catch (err) {
            console.error(`Erro ao sincronizar despesa ${expense.id}:`, err);
          }
        }

        // Sincronizar cartões
        for (const card of store.cards) {
          try {
            const { data, error } = await supabase
              .from('credit_cards')
              .select('id')
              .eq('id', card.id)
              .single();

            if (!data && !error) {
              await supabase.from('credit_cards').insert([{
                id: card.id,
                name: card.name,
                credit_limit: card.limit,
                closing_day: card.closingDay,
                due_day: card.dueDay,
                color: card.color,
                user_id: card.userId,
                created_at: card.createdAt,
              }]);
            } else if (!error) {
              await supabase.from('credit_cards').update({
                name: card.name,
                credit_limit: card.limit,
                closing_day: card.closingDay,
                due_day: card.dueDay,
                color: card.color,
              }).eq('id', card.id);
            }
          } catch (err) {
            console.error(`Erro ao sincronizar cartão ${card.id}:`, err);
          }
        }

        // Sincronizar objetivos
        for (const goal of store.goals) {
          try {
            const { data, error } = await supabase
              .from('financial_goals')
              .select('id')
              .eq('id', goal.id)
              .single();

            if (!data && !error) {
              await supabase.from('financial_goals').insert([{
                id: goal.id,
                name: goal.name,
                target_value: goal.targetValue,
                current_value: goal.currentValue,
                target_date: goal.targetDate,
                description: goal.description,
                icon: goal.icon,
                color: goal.color,
                user_id: goal.userId,
                created_at: goal.createdAt,
              }]);
            } else if (!error) {
              await supabase.from('financial_goals').update({
                name: goal.name,
                target_value: goal.targetValue,
                current_value: goal.currentValue,
                target_date: goal.targetDate,
                description: goal.description,
              }).eq('id', goal.id);
            }
          } catch (err) {
            console.error(`Erro ao sincronizar objetivo ${goal.id}:`, err);
          }
        }

        console.log('Sincronização concluída com sucesso!');
      } catch (err) {
        console.error('Erro geral durante sincronização:', err);
      }
    };

    const handleOffline = () => {
      console.log('Sem internet, dados salvos localmente');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [store.incomes, store.expenses, store.cards, store.goals]);
};
