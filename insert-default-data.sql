-- Insert default categories
INSERT INTO categories (id, name, type, icon, color) VALUES
-- Income categories
('cat-sal', 'Salário', 'income', '💼', '#10b981'),
('cat-free', 'Freelance', 'income', '💻', '#6366f1'),
('cat-venda', 'Venda', 'income', '🛒', '#f59e0b'),
('cat-invest', 'Investimentos', 'income', '📈', '#3b82f6'),
('cat-outros-in', 'Outros', 'income', '💰', '#8b5cf6'),
-- Expense categories
('cat-alim', 'Alimentação', 'expense', '🍔', '#ef4444'),
('cat-farm', 'Farmácia', 'expense', '💊', '#ec4899'),
('cat-comb', 'Combustível', 'expense', '⛽', '#f97316'),
('cat-ener', 'Energia', 'expense', '⚡', '#eab308'),
('cat-agua', 'Água', 'expense', '💧', '#06b6d4'),
('cat-inter', 'Internet', 'expense', '🌐', '#8b5cf6'),
('cat-alug', 'Aluguel', 'expense', '🏠', '#6366f1'),
('cat-esc', 'Escola', 'expense', '📚', '#3b82f6'),
('cat-saude', 'Saúde', 'expense', '🏥', '#10b981'),
('cat-lazer', 'Lazer', 'expense', '🎮', '#f59e0b'),
('cat-cart', 'Cartão de Crédito', 'expense', '💳', '#64748b'),
('cat-outros-ex', 'Outros', 'expense', '📦', '#94a3b8')
ON CONFLICT (id) DO NOTHING;

-- Insert default users
INSERT INTO users (id, name, role, password, avatar, color) VALUES
('user-husband', 'Marido', 'husband', '1234', '👨', '#3b82f6'),
('user-wife', 'Esposa', 'wife', '1234', '👩', '#ec4899')
ON CONFLICT (id) DO NOTHING;
