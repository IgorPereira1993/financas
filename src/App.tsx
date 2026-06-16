import { useState, useMemo, useEffect } from 'react';
import { useStore } from './store/useStore';
import { isOverdue, isDueSoon } from './utils/formatters';
import LoginPage from './components/LoginPage';
import Layout, { type Page } from './components/Layout';
import Dashboard from './components/Dashboard';
import IncomesPage from './components/IncomesPage';
import ExpensesPage from './components/ExpensesPage';
import CardsPage from './components/CardsPage';
import GoalsPage from './components/GoalsPage';
import ReportsPage from './components/ReportsPage';
import CalendarPage from './components/CalendarPage';
import SettingsPage from './components/SettingsPage';

export default function App() {
  const { currentUser, expenses, cards, goals, settings } = useStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const dark = settings.darkMode;

  // Apply dark mode to document
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.body.style.background = '#030712';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.background = '';
    }
  }, [dark]);

  // Generate alerts
  const alerts = useMemo(() => {
    const list: { type: string; message: string }[] = [];
    
    // Overdue expenses
    expenses.filter(e => e.status === 'pending' && isOverdue(e.dueDate)).forEach(e => {
      list.push({ type: 'overdue', message: `Conta vencida: ${e.description} — R$ ${e.value.toFixed(2)}` });
    });

    // Due soon expenses
    expenses.filter(e => e.status === 'pending' && isDueSoon(e.dueDate, 3) && !isOverdue(e.dueDate)).forEach(e => {
      list.push({ type: 'warning', message: `A vencer: ${e.description} — R$ ${e.value.toFixed(2)}` });
    });

    // Cards near limit
    cards.forEach(card => {
      const cardExpenses = expenses.filter(ex => ex.cardId === card.id);
      const usedTotal = cardExpenses.reduce((s, ex) => s + ex.value, 0);
      const pct = (usedTotal / card.limit) * 100;
      if (pct >= 80) {
        list.push({ type: 'warning', message: `Cartão ${card.name} com ${pct.toFixed(0)}% do limite utilizado` });
      }
    });

    // Goals completed
    goals.filter(g => g.currentValue >= g.targetValue).forEach(g => {
      list.push({ type: 'success', message: `Meta atingida: ${g.name} 🎉` });
    });

    return list;
  }, [expenses, cards, goals]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'incomes': return <IncomesPage />;
      case 'expenses': return <ExpensesPage />;
      case 'cards': return <CardsPage />;
      case 'goals': return <GoalsPage />;
      case 'reports': return <ReportsPage />;
      case 'calendar': return <CalendarPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage} alerts={alerts}>
      {renderPage()}
    </Layout>
  );
}
