-- Corrigir tipo de user_id de uuid para text
-- Execute este script no SQL Editor do Supabase

-- Modificar tabelas para aceitar user_id como text
ALTER TABLE incomes DROP CONSTRAINT incomes_user_id_fkey;
ALTER TABLE incomes ALTER COLUMN user_id TYPE text;
ALTER TABLE incomes ADD CONSTRAINT incomes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE expenses DROP CONSTRAINT expenses_user_id_fkey;
ALTER TABLE expenses ALTER COLUMN user_id TYPE text;
ALTER TABLE expenses ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE credit_cards DROP CONSTRAINT credit_cards_user_id_fkey;
ALTER TABLE credit_cards ALTER COLUMN user_id TYPE text;
ALTER TABLE credit_cards ADD CONSTRAINT credit_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE financial_goals DROP CONSTRAINT financial_goals_user_id_fkey;
ALTER TABLE financial_goals ALTER COLUMN user_id TYPE text;
ALTER TABLE financial_goals ADD CONSTRAINT financial_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE installment_groups DROP CONSTRAINT installment_groups_user_id_fkey;
ALTER TABLE installment_groups ALTER COLUMN user_id TYPE text;
ALTER TABLE installment_groups ADD CONSTRAINT installment_groups_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Mudar users id também para text
ALTER TABLE users ALTER COLUMN id TYPE text;
