import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, getCurrentMonth, getMonthName, getLast6Months, isOverdue, isDueSoon } from '../utils/formatters';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Clock, ChevronRight } from 'lucide-react';

export default function Dashboard({ onNavigate }: { onNavigate: (p: any) => void }) {
  const { incomes, expenses, categories, users, settings } = useStore();
  const dark = settings.darkMode;
  const currentMonth = getCurrentMonth();

  const monthIncomes = useMemo(() => incomes.filter(i => i.date.startsWith(currentMonth)), [incomes, currentMonth]);
  const monthExpenses = useMemo(() => expenses.filter(e => e.dueDate.startsWith(currentMonth)), [expenses, currentMonth]);

  const totalIncome = useMemo(() => monthIncomes.reduce((s, i) => s + i.value, 0), [monthIncomes]);
  const totalExpense = useMemo(() => monthExpenses.reduce((s, e) => s + e.value, 0), [monthExpenses]);
  const balance = totalIncome - totalExpense;

  const overdueExpenses = useMemo(() => expenses.filter(e => e.status === 'pending' && isOverdue(e.dueDate)), [expenses]);
  const dueSoonExpenses = useMemo(() => expenses.filter(e => e.status === 'pending' && isDueSoon(e.dueDate) && !isOverdue(e.dueDate)), [expenses]);

  // 6-month chart data
  const last6 = getLast6Months();
  const chartData = useMemo(() => last6.map(month => {
    const inc = incomes.filter(i => i.date.startsWith(month)).reduce((s, i) => s + i.value, 0);
    const exp = expenses.filter(e => e.dueDate.startsWith(month)).reduce((s, e) => s + e.value, 0);
    const [y, m] = month.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return {
      name: date.toLocaleDateString('pt-BR', { month: 'short' }),
      Receitas: inc,
      Despesas: exp,
    };
  }), [incomes, expenses, last6]);

  // Expense by category pie
  const expByCat = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach(e => {
      map[e.categoryId] = (map[e.categoryId] || 0) + e.value;
    });
    return Object.entries(map)
      .map(([catId, value]) => {
        const cat = categories.find(c => c.id === catId);
        return { name: cat?.name || catId, value, color: cat?.color || '#999', icon: cat?.icon || '📦' };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [monthExpenses, categories]);

  // Expenses by user
  const expByUser = useMemo(() => {
    return users.map(u => ({
      name: u.name,
      value: monthExpenses.filter(e => e.userId === u.id).reduce((s, e) => s + e.value, 0),
      color: u.color,
      avatar: u.avatar,
    }));
  }, [users, monthExpenses]);

  const statCardClass = `rounded-2xl p-5 ${dark ? 'bg-gray-900' : 'bg-white'} shadow-sm border ${dark ? 'border-gray-800' : 'border-gray-100'}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-xl shadow-lg border text-xs ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>
            {getMonthName(currentMonth).charAt(0).toUpperCase() + getMonthName(currentMonth).slice(1)}
          </h2>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Visão geral das finanças</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${statCardClass} col-span-2 lg:col-span-1`}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-blue-100">
              <Wallet size={20} className="text-blue-600" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${balance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {balance >= 0 ? '+' : ''}{((balance / (totalIncome || 1)) * 100).toFixed(0)}%
            </span>
          </div>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Saldo do Mês</p>
          <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(balance)}
          </p>
        </div>

        <div className={statCardClass}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-green-100">
              <TrendingUp size={20} className="text-green-600" />
            </div>
          </div>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Receitas</p>
          <p className="text-2xl font-bold mt-1 text-green-500">{formatCurrency(totalIncome)}</p>
        </div>

        <div className={statCardClass}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-red-100">
              <TrendingDown size={20} className="text-red-600" />
            </div>
          </div>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Despesas</p>
          <p className="text-2xl font-bold mt-1 text-red-500">{formatCurrency(totalExpense)}</p>
        </div>

        <div className={statCardClass}>
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-yellow-100">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
          </div>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Vencidas</p>
          <p className="text-2xl font-bold mt-1 text-yellow-500">{overdueExpenses.length}</p>
          <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            {formatCurrency(overdueExpenses.reduce((s, e) => s + e.value, 0))}
          </p>
        </div>
      </div>

      {/* Alerts row */}
      {(overdueExpenses.length > 0 || dueSoonExpenses.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {overdueExpenses.length > 0 && (
            <div className={`rounded-2xl p-4 border ${dark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={18} className="text-red-500" />
                <h3 className={`font-semibold text-sm ${dark ? 'text-red-300' : 'text-red-700'}`}>
                  {overdueExpenses.length} conta(s) vencida(s)
                </h3>
              </div>
              <div className="space-y-2">
                {overdueExpenses.slice(0, 3).map(e => (
                  <div key={e.id} className={`flex items-center justify-between text-xs ${dark ? 'text-red-300' : 'text-red-700'}`}>
                    <span className="truncate">{e.description}</span>
                    <span className="font-semibold ml-2 shrink-0">{formatCurrency(e.value)}</span>
                  </div>
                ))}
                {overdueExpenses.length > 3 && (
                  <button onClick={() => onNavigate('expenses')} className={`text-xs underline ${dark ? 'text-red-400' : 'text-red-600'}`}>
                    Ver todas ({overdueExpenses.length})
                  </button>
                )}
              </div>
            </div>
          )}
          {dueSoonExpenses.length > 0 && (
            <div className={`rounded-2xl p-4 border ${dark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={18} className="text-yellow-500" />
                <h3 className={`font-semibold text-sm ${dark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  {dueSoonExpenses.length} conta(s) a vencer em breve
                </h3>
              </div>
              <div className="space-y-2">
                {dueSoonExpenses.slice(0, 3).map(e => (
                  <div key={e.id} className={`flex items-center justify-between text-xs ${dark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    <span className="truncate">{e.description}</span>
                    <span className="font-semibold ml-2 shrink-0">{formatCurrency(e.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className={`lg:col-span-2 ${statCardClass}`}>
          <h3 className={`font-semibold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Receitas vs Despesas (6 meses)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Receitas" stroke="#10b981" fill="url(#colorInc)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Despesas" stroke="#ef4444" fill="url(#colorExp)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense by user */}
        <div className={statCardClass}>
          <h3 className={`font-semibold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Gastos por Pessoa</h3>
          <div className="space-y-4 mt-2">
            {expByUser.map(u => (
              <div key={u.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span>{u.avatar}</span>
                    <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{u.name}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: u.color }}>{formatCurrency(u.value)}</span>
                </div>
                <div className={`h-2 rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${totalExpense ? (u.value / totalExpense) * 100 : 0}%`, background: u.color }}
                  />
                </div>
                <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {totalExpense ? ((u.value / totalExpense) * 100).toFixed(1) : 0}% do total
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pie + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie */}
        <div className={statCardClass}>
          <h3 className={`font-semibold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Gastos por Categoria</h3>
          {expByCat.length === 0 ? (
            <p className={`text-center text-sm py-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Nenhuma despesa este mês</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={expByCat} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {expByCat.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {expByCat.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className={`text-xs truncate max-w-20 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{cat.icon} {cat.name}</span>
                    </div>
                    <span className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className={statCardClass}>
          <h3 className={`font-semibold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Ranking de Gastos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={expByCat} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {expByCat.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className={statCardClass}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>Últimas Movimentações</h3>
          <button onClick={() => onNavigate('expenses')} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 cursor-pointer">
            Ver todas <ChevronRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {[...monthExpenses.slice(-5).reverse()].map(e => {
            const cat = categories.find(c => c.id === e.categoryId);
            return (
              <div key={e.id} className={`flex items-center gap-3 p-3 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: cat?.color + '20' }}>
                  {cat?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${dark ? 'text-white' : 'text-gray-800'}`}>{e.description}</p>
                  <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{cat?.name} • {e.purchaseDate.split('-').reverse().join('/')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-red-500">-{formatCurrency(e.value)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${e.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {e.status === 'paid' ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              </div>
            );
          })}
          {monthExpenses.length === 0 && (
            <p className={`text-center text-sm py-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Nenhuma despesa este mês</p>
          )}
        </div>
      </div>
    </div>
  );
}
