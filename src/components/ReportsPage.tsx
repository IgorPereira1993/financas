import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, getLast6Months, paymentMethodLabel } from '../utils/formatters';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import { BarChart3, Download, TrendingUp, TrendingDown } from 'lucide-react';

export default function ReportsPage() {
  const { incomes, expenses, categories, users, settings } = useStore();
  const dark = settings.darkMode;

  const [filterUser, setFilterUser] = useState('all');
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 3);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const filteredIncomes = useMemo(() => incomes.filter(i => {
    const month = i.date.substring(0, 7);
    const matchUser = filterUser === 'all' || i.userId === filterUser;
    return month >= periodStart && month <= periodEnd && matchUser;
  }), [incomes, filterUser, periodStart, periodEnd]);

  const filteredExpenses = useMemo(() => expenses.filter(e => {
    const month = e.purchaseDate.substring(0, 7);
    const matchUser = filterUser === 'all' || e.userId === filterUser;
    return month >= periodStart && month <= periodEnd && matchUser;
  }), [expenses, filterUser, periodStart, periodEnd]);

  const totalIncome = filteredIncomes.reduce((s, i) => s + i.value, 0);
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.value, 0);
  const balance = totalIncome - totalExpense;

  // Monthly comparison
  const monthlyData = useMemo(() => {
    const months = getLast6Months();
    return months.map(month => {
      const inc = filteredIncomes.filter(i => i.date.startsWith(month)).reduce((s, i) => s + i.value, 0);
      const exp = filteredExpenses.filter(e => e.purchaseDate.startsWith(month)).reduce((s, e) => s + e.value, 0);
      const [y, m] = month.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1, 1);
      return { name: date.toLocaleDateString('pt-BR', { month: 'short' }), Receitas: inc, Despesas: exp, Saldo: inc - exp };
    });
  }, [filteredIncomes, filteredExpenses]);

  // By category
  const byCat = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => { map[e.categoryId] = (map[e.categoryId] || 0) + e.value; });
    return Object.entries(map).map(([id, value]) => {
      const cat = categories.find(c => c.id === id);
      return { name: cat?.name || id, value, color: cat?.color || '#999', icon: cat?.icon || '📦', pct: (value / totalExpense * 100).toFixed(1) };
    }).sort((a, b) => b.value - a.value);
  }, [filteredExpenses, categories, totalExpense]);

  // By payment method
  const byMethod = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => { map[e.paymentMethod] = (map[e.paymentMethod] || 0) + e.value; });
    return Object.entries(map).map(([method, value]) => ({
      name: paymentMethodLabel(method), value,
      color: { money: '#10b981', debit: '#3b82f6', credit: '#8b5cf6', pix: '#06b6d4', transfer: '#f59e0b', check: '#94a3b8' }[method] || '#999',
    })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // By user
  const byUser = useMemo(() => {
    return users.map(u => ({
      name: u.name, avatar: u.avatar, color: u.color,
      income: filteredIncomes.filter(i => i.userId === u.id).reduce((s, i) => s + i.value, 0),
      expense: filteredExpenses.filter(e => e.userId === u.id).reduce((s, e) => s + e.value, 0),
    }));
  }, [users, filteredIncomes, filteredExpenses]);

  const card = `rounded-2xl ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border shadow-sm p-5`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-xl shadow-lg border text-xs ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color || p.fill }}>{p.name}: {formatCurrency(p.value)}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExportCSV = () => {
    const rows = [
      ['Tipo', 'Data', 'Descrição', 'Categoria', 'Valor', 'Usuário'],
      ...filteredIncomes.map(i => {
        const cat = categories.find(c => c.id === i.categoryId);
        const user = users.find(u => u.id === i.userId);
        return ['Receita', i.date, i.description, cat?.name || '', i.value, user?.name || ''];
      }),
      ...filteredExpenses.map(e => {
        const cat = categories.find(c => c.id === e.categoryId);
        const user = users.find(u => u.id === e.userId);
        return ['Despesa', e.purchaseDate, e.description, cat?.name || '', e.value, user?.name || ''];
      }),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'financas-familia.csv'; a.click();
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className={`${card}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Período Início</label>
            <input type="month" value={periodStart} onChange={e => setPeriodStart(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
          </div>
          <div className="flex-1">
            <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Período Fim</label>
            <input type="month" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
          </div>
          <div className="flex-1">
            <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Usuário</label>
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
              <option value="all">Todos</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.avatar} {u.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap">
              <Download size={16} /> Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`${card.replace('p-5', 'p-4')}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-500" />
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Receitas</p>
          </div>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</p>
        </div>
        <div className={`${card.replace('p-5', 'p-4')}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-red-500" />
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Despesas</p>
          </div>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
        </div>
        <div className={`${card.replace('p-5', 'p-4')}`}>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className={balance >= 0 ? 'text-blue-500' : 'text-orange-500'} />
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Saldo</p>
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className={card}>
        <h3 className={`font-semibold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Comparativo Mensal</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Saldo trend */}
      <div className={card}>
        <h3 className={`font-semibold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Evolução do Saldo</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: dark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* By category */}
        <div className={card}>
          <h3 className={`font-semibold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Gastos por Categoria</h3>
          {byCat.length === 0 ? (
            <p className={`text-center text-sm py-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Sem dados</p>
          ) : (
            <div className="space-y-3">
              {byCat.map((cat, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{cat.icon} {cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{cat.pct}%</span>
                      <span className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>{formatCurrency(cat.value)}</span>
                    </div>
                  </div>
                  <div className={`h-2 rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="h-2 rounded-full" style={{ width: `${cat.pct}%`, background: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By payment method */}
        <div className={card}>
          <h3 className={`font-semibold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Forma de Pagamento</h3>
          {byMethod.length === 0 ? (
            <p className={`text-center text-sm py-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Sem dados</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={byMethod} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} dataKey="value">
                    {byMethod.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {byMethod.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                      <span className={dark ? 'text-gray-300' : 'text-gray-600'}>{m.name}</span>
                    </div>
                    <span className={`font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{formatCurrency(m.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* By user */}
      <div className={card}>
        <h3 className={`font-semibold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Resumo por Usuário</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {byUser.map(u => (
            <div key={u.name} className={`p-4 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{u.avatar}</span>
                <div>
                  <p className={`font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>{u.name}</p>
                  <p className="text-xs" style={{ color: u.color }}>Saldo: {formatCurrency(u.income - u.expense)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className={`p-2.5 rounded-lg ${dark ? 'bg-gray-700' : 'bg-white'}`}>
                  <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Receitas</p>
                  <p className="text-sm font-bold text-green-500">{formatCurrency(u.income)}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${dark ? 'bg-gray-700' : 'bg-white'}`}>
                  <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Despesas</p>
                  <p className="text-sm font-bold text-red-500">{formatCurrency(u.expense)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
