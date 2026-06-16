-- Desabilitar RLS para permitir inserção de dados sem autenticação
-- Execute este script no SQL Editor do Supabase

-- Desabilitar RLS nas tabelas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE incomes DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE installment_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE installments DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals DISABLE ROW LEVEL SECURITY;

-- Verificar status
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
