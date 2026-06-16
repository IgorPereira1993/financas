import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, getCurrentMonth } from '../utils/formatters';
import { Plus, Search, Edit2, Trash2, TrendingUp, X } from 'lucide-react';
import type { Income } from '../types';

const EMPTY_FORM = {
  date: new Date().toISOString().split('T')[0],
  value: '',
  description: '',
  categoryId: 'cat-sal',
  userId: '',
  notes: '',
};

export default function IncomesPage() {
  const { incomes, categories, users, currentUser, addIncome, updateIncome, deleteIncome, settings } = useStore();
  const dark = settings.darkMode;

  const incomeCategories = categories.filter(c => c.type === 'income');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, userId: currentUser?.id || '' });
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [filterUser, setFilterUser] = useState('all');

  const filtered = useMemo(() => {
    return incomes.filter(i => {
      const matchMonth = filterMonth === 'all' || i.date.startsWith(filterMonth);
      const matchUser = filterUser === 'all' || i.userId === filterUser;
      const matchSearch = !search || i.description.toLowerCase().includes(search.toLowerCase());
      return matchMonth && matchUser && matchSearch;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [incomes, filterMonth, filterUser, search]);

  const totalFiltered = filtered.reduce((s, i) => s + i.value, 0);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, userId: currentUser?.id || '' });
    setShowModal(true);
  };

  const openEdit = (income: Income) => {
    setEditingId(income.id);
    setForm({ date: income.date, value: String(income.value), description: income.description, categoryId: income.categoryId, userId: income.userId, notes: income.notes || '' });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.description || !form.value || !form.date) return;
    const data = { date: form.date, value: parseFloat(form.value), description: form.description, categoryId: form.categoryId, userId: form.userId || currentUser?.id || '', notes: form.notes };
    if (editingId) updateIncome(editingId, data);
    else addIncome(data);
    setShowModal(false);
  };

  const card = `rounded-2xl ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border shadow-sm`;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Total de Receitas</p>
            <p className="text-3xl font-bold text-green-500 mt-1">{formatCurrency(totalFiltered)}</p>
            <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{filtered.length} lançamento(s)</p>
          </div>
          <div className="p-4 rounded-2xl bg-green-100">
            <TrendingUp size={28} className="text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters + Add */}
      <div className={`${card} p-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100'}`}
            />
          </div>
          <input
            type="month"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className={`px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-blue-400'}`}
          />
          <select
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
            className={`px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
          >
            <option value="all">Todos</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.avatar} {u.name}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors shrink-0 cursor-pointer">
            <Plus size={16} /> Nova Receita
          </button>
        </div>
      </div>

      {/* List */}
      <div className={card}>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp size={48} className={`mx-auto mb-3 ${dark ? 'text-gray-700' : 'text-gray-200'}`} />
            <p className={`${dark ? 'text-gray-500' : 'text-gray-400'}`}>Nenhuma receita encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map(income => {
              const cat = categories.find(c => c.id === income.categoryId);
              const user = users.find(u => u.id === income.userId);
              return (
                <div key={income.id} className={`flex items-center gap-4 p-4 hover:${dark ? 'bg-gray-800' : 'bg-gray-50'} transition-colors group`}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: cat?.color + '20' }}>
                    {cat?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>{income.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{cat?.name}</span>
                      <span className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                      <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(income.date)}</span>
                      <span className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                      <span className="text-xs" style={{ color: user?.color }}>{user?.avatar} {user?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-base font-bold text-green-500">+{formatCurrency(income.value)}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(income)} className={`p-1.5 rounded-lg cursor-pointer ${dark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Edit2 size={14} /></button>
                      <button onClick={() => deleteIncome(income.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 cursor-pointer"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl ${dark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-5 border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              <h2 className={`font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{editingId ? 'Editar Receita' : 'Nova Receita'}</h2>
              <button onClick={() => setShowModal(false)} className={`p-2 rounded-xl cursor-pointer ${dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Data *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Valor (R$) *</label>
                  <input type="number" min="0" step="0.01" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
                    placeholder="0,00" className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Descrição *</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Salário, Freelance..." className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Categoria</label>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                    {incomeCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Responsável</label>
                  <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                    {users.map(u => <option key={u.id} value={u.id}>{u.avatar} {u.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Observações</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                  placeholder="Observações opcionais..." className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
              </div>
            </div>
            <div className={`flex gap-3 p-5 border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              <button onClick={() => setShowModal(false)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium cursor-pointer ${dark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                Cancelar
              </button>
              <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors cursor-pointer">
                {editingId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
