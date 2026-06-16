-- Desabilitar RLS em TODAS as tabelas
-- Execute isto no SQL Editor do Supabase

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all access" ON users;
DROP POLICY IF EXISTS "Enable all access" ON categories;
DROP POLICY IF EXISTS "Enable all access" ON credit_cards;
DROP POLICY IF EXISTS "Enable all access" ON incomes;
DROP POLICY IF EXISTS "Enable all access" ON expenses;
DROP POLICY IF EXISTS "Enable all access" ON installment_groups;
DROP POLICY IF EXISTS "Enable all access" ON installments;
DROP POLICY IF EXISTS "Enable all access" ON financial_goals;

-- Desabilitar RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE incomes DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE installment_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE installments DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS foi desabilitado
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'categories', 'credit_cards', 'incomes', 'expenses', 'installment_groups', 'installments', 'financial_goals');
