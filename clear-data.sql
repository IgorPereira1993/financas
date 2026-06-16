-- Script para limpar todos os dados fictícios das tabelas
-- Execute este script no SQL Editor do Supabase

-- Limpar dados em ordem (cuidar com constraints de chave estrangeira)
DELETE FROM expenses;
DELETE FROM incomes;
DELETE FROM installment_groups;
DELETE FROM installments;
DELETE FROM credit_cards;
DELETE FROM categories;
DELETE FROM users;

-- Resetar sequências de IDs (se usar)
-- TRUNCATE TABLE expenses RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE incomes RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE installment_groups RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE installments RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE credit_cards RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE categories RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE users RESTART IDENTITY CASCADE;
