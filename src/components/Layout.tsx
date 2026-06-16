import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  LayoutDashboard, TrendingUp, TrendingDown, CreditCard,
  Target, BarChart3, LogOut, Menu, X, Sun, Moon, Bell, Settings, Calendar
} from 'lucide-react';

export type Page = 'dashboard' | 'incomes' | 'expenses' | 'cards' | 'goals' | 'reports' | 'settings' | 'calendar';

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
  alerts: { type: string; message: string }[];
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'incomes', label: 'Receitas', icon: <TrendingUp size={20} /> },
  { id: 'expenses', label: 'Despesas', icon: <TrendingDown size={20} /> },
  { id: 'cards', label: 'Cartões', icon: <CreditCard size={20} /> },
  { id: 'goals', label: 'Metas', icon: <Target size={20} /> },
  { id: 'calendar', label: 'Calendário', icon: <Calendar size={20} /> },
  { id: 'reports', label: 'Relatórios', icon: <BarChart3 size={20} /> },
  { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
];

export default function Layout({ currentPage, onNavigate, children, alerts }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const { currentUser, logout, settings, toggleDarkMode } = useStore();
  const dark = settings.darkMode;

  const handleNav = (page: Page) => {
    onNavigate(page);
    setSidebarOpen(false);
  };

  const totalAlerts = alerts.length;

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${dark ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-gray-200'}`}>
        {/* Logo */}
        <div className={`p-5 border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>FinançasFamília</h1>
              <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Controle Financeiro</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className={`px-4 py-3 border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
              style={{ background: currentUser?.color + '20' }}>
              {currentUser?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm truncate ${dark ? 'text-white' : 'text-gray-800'}`}>{currentUser?.name}</p>
              <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`} style={{ color: currentUser?.color }}>
                {currentUser?.role === 'husband' ? 'Marido' : 'Esposa'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : dark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className={`p-3 border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              dark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'
            }`}
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`flex items-center justify-between px-4 py-3 border-b ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`lg:hidden p-2 rounded-lg ${dark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className={`font-semibold text-base ${dark ? 'text-white' : 'text-gray-800'}`}>
              {navItems.find(n => n.id === currentPage)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Alerts */}
            <div className="relative">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className={`p-2 rounded-lg relative cursor-pointer ${dark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <Bell size={20} />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    {totalAlerts > 9 ? '9+' : totalAlerts}
                  </span>
                )}
              </button>
              {showAlerts && (
                <div className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 border overflow-hidden ${dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                  <div className={`p-4 border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <h3 className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>Alertas</h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-3 space-y-2">
                    {alerts.length === 0 ? (
                      <p className={`text-center text-sm py-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Nenhum alerta 🎉</p>
                    ) : (
                      alerts.map((a, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${
                          a.type === 'overdue'
                            ? dark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'
                            : dark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          <span>{a.type === 'overdue' ? '🔴' : '🟡'}</span>
                          <p className="text-xs">{a.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg cursor-pointer ${dark ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User avatar */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl cursor-pointer" style={{ background: currentUser?.color + '20' }}>
              {currentUser?.avatar}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
