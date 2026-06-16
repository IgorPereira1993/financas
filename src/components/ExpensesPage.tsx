import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, getCurrentMonth, isOverdue, isDueSoon, paymentMethodLabel } from '../utils/formatters';
import { Plus, Search, Edit2, Trash2, TrendingDown, X, CheckCircle, Clock, AlertCircle, Repeat } from 'lucide-react';
import type { Expense, PaymentMethod } from '../types';

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'money', label: 'Dinheiro' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
  { value: 'pix', label: 'PIX' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'check', label: 'Cheque' },
];

const EMPTY_FORM = {
  purchaseDate: new Date().toISOString().split('T')[0],
  dueDate: new Date().toISOString().split('T')[0],
  value: '',
  description: '',
  categoryId: 'cat-alim',
  paymentMethod: 'pix' as PaymentMethod,
  userId: '',
  status: 'pending' as 'paid' | 'pending',
  notes: '',
  isInstallment: false,
  installments: '1',
  cardId: '',
};

export default function ExpensesPage() {
  const { expenses, categories, users, cards, currentUser, addExpense, addInstallments, updateExpense, deleteExpense, toggleExpenseStatus, settings } = useStore();
  const dark = settings.darkMode;
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, userId: currentUser?.id || '' });
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [filterUser, setFilterUser] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const matchMonth = filterMonth === 'all' || e.purchaseDate.startsWith(filterMonth);
      const matchUser = filterUser === 'all' || e.userId === filterUser;
      const matchStatus = filterStatus === 'all' || e.status === filterStatus;
      const matchCat = filterCategory === 'all' || e.categoryId === filterCategory;
      const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase());
      return matchMonth && matchUser && matchStatus && matchCat && matchSearch;
    }).sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
  }, [expenses, filterMonth, filterUser, filterStatus, filterCategory, search]);

  const totalFiltered = filtered.reduce((s, e) => s + e.value, 0);
  const paidTotal = filtered.filter(e => e.status === 'paid').reduce((s, e) => s + e.value, 0);
  const pendingTotal = filtered.filter(e => e.status === 'pending').reduce((s, e) => s + e.value, 0);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, userId: currentUser?.id || '' });
    setShowModal(true);
  };

  const openEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setForm({
      purchaseDate: expense.purchaseDate, dueDate: expense.dueDate,
      value: String(expense.value), description: expense.description,
      categoryId: expense.categoryId, paymentMethod: expense.paymentMethod,
      userId: expense.userId, status: expense.status, notes: expense.notes || '',
      isInstallment: false, installments: '1', cardId: expense.cardId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.description || !form.value || !form.purchaseDate) return;
    if (form.isInstallment && !editingId) {
      const numInstallments = parseInt(form.installments) || 1;
      const totalValue = parseFloat(form.value);
      addInstallments({
        description: form.description, totalValue, totalInstallments: numInstallments,
        installmentValue: parseFloat((totalValue / numInstallments).toFixed(2)),
        categoryId: form.categoryId, paymentMethod: form.paymentMethod,
        userId: form.userId || currentUser?.id || '',
        cardId: form.cardId || undefined,
        startDate: form.dueDate,
      }, form.dueDate);
    } else {
      const data = {
        purchaseDate: form.purchaseDate, dueDate: form.dueDate, value: parseFloat(form.value),
        description: form.description, categoryId: form.categoryId, paymentMethod: form.paymentMethod,
        userId: form.userId || currentUser?.id || '', status: form.status, notes: form.notes,
        cardId: form.cardId || undefined,
      };
      if (editingId) updateExpense(editingId, data);
      else addExpense(data);
    }
    setShowModal(false);
  };

  const card = `rounded-2xl ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border shadow-sm`;

  const StatusBadge = ({ e }: { e: Expense }) => {
    const overdue = e.status === 'pending' && isOverdue(e.dueDate);
    const soon = e.status === 'pending' && isDueSoon(e.dueDate);
    if (e.status === 'paid') return <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700"><CheckCircle size={10} /> Pago</span>;
    if (overdue) return <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700"><AlertCircle size={10} /> Vencido</span>;
    if (soon) return <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700"><Clock size={10} /> Vence em breve</span>;
    return <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"><Clock size={10} /> Pendente</span>;
  };

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`${card} p-4`}>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
          <p className="text-xl font-bold text-red-500 mt-1">{formatCurrency(totalFiltered)}</p>
        </div>
        <div className={`${card} p-4`}>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Pago</p>
          <p className="text-xl font-bold text-green-500 mt-1">{formatCurrency(paidTotal)}</p>
        </div>
        <div className={`${card} p-4`}>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Pendente</p>
          <p className="text-xl font-bold text-yellow-500 mt-1">{formatCurrency(pendingTotal)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`${card} p-4`}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar despesa..."
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
            </div>
            <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
              className={`px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shrink-0 cursor-pointer">
              <Plus size={16} /> Nova Despesa
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
              <option value="all">Todos</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.avatar} {u.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
              <option value="all">Todos status</option>
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
              <option value="all">Todas categorias</option>
              {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className={card}>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <TrendingDown size={48} className={`mx-auto mb-3 ${dark ? 'text-gray-700' : 'text-gray-200'}`} />
            <p className={`${dark ? 'text-gray-500' : 'text-gray-400'}`}>Nenhuma despesa encontrada</p>
          </div>
        ) : (
          <div className={`divide-y ${dark ? 'divide-gray-800' : 'divide-gray-50'}`}>
            {filtered.map(expense => {
              const cat = categories.find(c => c.id === expense.categoryId);
              const user = users.find(u => u.id === expense.userId);
              const overdue = expense.status === 'pending' && isOverdue(expense.dueDate);
              return (
                <div key={expense.id} className={`flex items-center gap-3 p-4 hover:${dark ? 'bg-gray-800' : 'bg-gray-50'} transition-colors group ${overdue ? dark ? 'bg-red-900/10' : 'bg-red-50/50' : ''}`}>
                  <button onClick={() => toggleExpenseStatus(expense.id)} className="shrink-0 cursor-pointer">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${expense.status === 'paid' ? 'border-green-500 bg-green-500' : overdue ? 'border-red-400' : 'border-gray-300'}`}>
                      {expense.status === 'paid' && <CheckCircle size={14} className="text-white" />}
                    </div>
                  </button>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: cat?.color + '20' }}>
                    {cat?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium text-sm truncate ${dark ? 'text-white' : 'text-gray-800'} ${expense.status === 'paid' ? 'line-through opacity-50' : ''}`}>{expense.description}</p>
                      {expense.totalInstallments && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-md ${dark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                          {expense.installmentNumber}/{expense.totalInstallments}x
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{cat?.name}</span>
                      <span className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                      <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Vence: {formatDate(expense.dueDate)}</span>
                      <span className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                      <span className="text-xs" style={{ color: user?.color }}>{user?.avatar} {user?.name}</span>
                      <span className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                      <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{paymentMethodLabel(expense.paymentMethod)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className={`text-base font-bold ${expense.status === 'paid' ? 'text-green-500' : overdue ? 'text-red-500' : dark ? 'text-white' : 'text-gray-800'}`}>
                      {formatCurrency(expense.value)}
                    </p>
                    <StatusBadge e={expense} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(expense)} className={`p-1.5 rounded-lg cursor-pointer ${dark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Edit2 size={14} /></button>
                    <button onClick={() => deleteExpense(expense.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 cursor-pointer"><Trash2 size={14} /></button>
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
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] ${dark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-5 border-b ${dark ? 'border-gray-800' : 'border-gray-100'} sticky top-0 ${dark ? 'bg-gray-900' : 'bg-white'} z-10`}>
              <h2 className={`font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{editingId ? 'Editar Despesa' : 'Nova Despesa'}</h2>
              <button onClick={() => setShowModal(false)} className={`p-2 rounded-xl cursor-pointer ${dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {!editingId && (
                <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${dark ? 'bg-gray-800' : 'bg-gray-50'}`} onClick={() => setForm({ ...form, isInstallment: !form.isInstallment })}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${form.isInstallment ? 'border-purple-500 bg-purple-500' : dark ? 'border-gray-600' : 'border-gray-300'}`}>
                    {form.isInstallment && <span className="text-white text-xs">✓</span>}
                  </div>
                  <Repeat size={16} className={dark ? 'text-purple-400' : 'text-purple-600'} />
                  <p className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Compra parcelada</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Data da Compra *</label>
                  <input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{form.isInstallment ? 'Venc. 1ª Parcela' : 'Data de Vencimento'} *</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{form.isInstallment ? 'Valor Total (R$)' : 'Valor (R$)'} *</label>
                  <input type="number" min="0" step="0.01" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="0,00"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
                </div>
                {form.isInstallment && (
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Nº de Parcelas</label>
                    <input type="number" min="2" max="60" value={form.installments} onChange={e => setForm({ ...form, installments: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                    {form.value && parseInt(form.installments) > 1 && (
                      <p className={`text-xs mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {form.installments}x de {formatCurrency(parseFloat(form.value) / parseInt(form.installments))}
                      </p>
                    )}
                  </div>
                )}
                {!form.isInstallment && (
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Situação</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Descrição *</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex: Conta de Luz, Supermercado..."
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Categoria</label>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                    {categories.filter(c => c.type === 'expense').map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Forma de Pagamento</label>
                  <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Responsável</label>
                  <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                    {users.map(u => <option key={u.id} value={u.id}>{u.avatar} {u.name}</option>)}
                  </select>
                </div>
                {cards.length > 0 && (
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Cartão</label>
                    <select value={form.cardId} onChange={e => setForm({ ...form, cardId: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                      <option value="">Nenhum</option>
                      {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Observações</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Observações opcionais..."
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
              </div>
            </div>
            <div className={`flex gap-3 p-5 border-t ${dark ? 'border-gray-800' : 'border-gray-100'} sticky bottom-0 ${dark ? 'bg-gray-900' : 'bg-white'}`}>
              <button onClick={() => setShowModal(false)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium cursor-pointer ${dark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                Cancelar
              </button>
              <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors cursor-pointer">
                {editingId ? 'Salvar' : form.isInstallment ? 'Parcelar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
