import { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, getCurrentMonth } from '../utils/formatters';
import { CreditCard, Plus, Edit2, Trash2, X } from 'lucide-react';

const CARD_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#ec4899', '#ef4444', '#eab308', '#06b6d4'];

const EMPTY_FORM = {
  name: '', limit: '', closingDay: '15', dueDay: '22', color: '#8b5cf6', userId: '',
};

export default function CardsPage() {
  const { cards, expenses, users, currentUser, addCard, updateCard, deleteCard, settings } = useStore();
  const dark = settings.darkMode;
  const currentMonth = getCurrentMonth();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, userId: currentUser?.id || '' });

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, userId: currentUser?.id || '' });
    setShowModal(true);
  };

  const openEdit = (card: typeof cards[0]) => {
    setEditingId(card.id);
    setForm({ name: card.name, limit: String(card.limit), closingDay: String(card.closingDay), dueDay: String(card.dueDay), color: card.color, userId: card.userId });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.limit) return;
    const data = { name: form.name, limit: parseFloat(form.limit), closingDay: parseInt(form.closingDay), dueDay: parseInt(form.dueDay), color: form.color, userId: form.userId || currentUser?.id || '' };
    if (editingId) updateCard(editingId, data);
    else addCard(data);
    setShowModal(false);
  };

  const getCardStats = (cardId: string) => {
    const cardExpenses = expenses.filter(e => e.cardId === cardId);
    const currentMonthExpenses = cardExpenses.filter(e => e.purchaseDate.startsWith(currentMonth));
    const used = currentMonthExpenses.reduce((s, e) => s + e.value, 0);
    const pending = cardExpenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.value, 0);
    return { used, pending, monthExpenses: currentMonthExpenses };
  };

  const card = `rounded-2xl ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border shadow-sm`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-800'}`}>Cartões de Crédito</h2>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{cards.length} cartão(ões) cadastrado(s)</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors cursor-pointer">
          <Plus size={16} /> Novo Cartão
        </button>
      </div>

      {cards.length === 0 ? (
        <div className={`${card} text-center py-16`}>
          <CreditCard size={52} className={`mx-auto mb-3 ${dark ? 'text-gray-700' : 'text-gray-200'}`} />
          <p className={`font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Nenhum cartão cadastrado</p>
          <p className={`text-sm mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Adicione seus cartões de crédito</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map(c => {
            const stats = getCardStats(c.id);
            const usedPct = (stats.used / c.limit) * 100;
            const user = users.find(u => u.id === c.userId);
            return (
              <div key={c.id} className="space-y-4">
                {/* Card visual */}
                <div className="relative rounded-2xl p-6 text-white overflow-hidden shadow-lg" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}bb)` }}>
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 translate-x-10 -translate-y-10" style={{ background: 'white' }} />
                  <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 -translate-x-8 translate-y-8" style={{ background: 'white' }} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-white/70 text-xs">Cartão de Crédito</p>
                        <h3 className="text-xl font-bold mt-1">{c.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"><Edit2 size={14} /></button>
                        <button onClick={() => deleteCard(c.id)} className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500/50 transition-colors cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white/70 text-xs">Limite Total</p>
                        <p className="text-2xl font-bold">{formatCurrency(c.limit)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-xs">Fecha dia {c.closingDay} • Vence dia {c.dueDay}</p>
                        {user && <p className="text-white/90 text-sm mt-1">{user.avatar} {user.name}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className={`${card} p-4 space-y-4`}>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Usado (mês)</p>
                      <p className="font-bold text-sm text-red-500 mt-1">{formatCurrency(stats.used)}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Disponível</p>
                      <p className="font-bold text-sm text-green-500 mt-1">{formatCurrency(c.limit - stats.used)}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Total Pend.</p>
                      <p className="font-bold text-sm text-yellow-500 mt-1">{formatCurrency(stats.pending)}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Utilização do Limite</p>
                      <p className={`text-xs font-medium ${usedPct > 80 ? 'text-red-500' : usedPct > 60 ? 'text-yellow-500' : 'text-green-500'}`}>{usedPct.toFixed(1)}%</p>
                    </div>
                    <div className={`h-2.5 rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(usedPct, 100)}%`, background: usedPct > 80 ? '#ef4444' : usedPct > 60 ? '#f59e0b' : c.color }} />
                    </div>
                  </div>
                  {stats.monthExpenses.length > 0 && (
                    <div>
                      <p className={`text-xs font-medium mb-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Compras do mês</p>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {stats.monthExpenses.map(e => (
                          <div key={e.id} className={`flex items-center justify-between text-xs p-2 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <span className={`truncate ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{e.description}</span>
                            <span className={`ml-2 font-medium shrink-0 ${e.status === 'paid' ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(e.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl ${dark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-5 border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              <h2 className={`font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{editingId ? 'Editar Cartão' : 'Novo Cartão'}</h2>
              <button onClick={() => setShowModal(false)} className={`p-2 rounded-xl cursor-pointer ${dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Nome do Cartão *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Nubank, Itaú..."
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Limite (R$) *</label>
                <input type="number" min="0" value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} placeholder="0,00"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Dia de Fechamento</label>
                  <input type="number" min="1" max="31" value={form.closingDay} onChange={e => setForm({ ...form, closingDay: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Dia de Vencimento</label>
                  <input type="number" min="1" max="31" value={form.dueDay} onChange={e => setForm({ ...form, dueDay: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Responsável</label>
                <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                  {users.map(u => <option key={u.id} value={u.id}>{u.avatar} {u.name}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Cor</label>
                <div className="flex flex-wrap gap-2">
                  {CARD_COLORS.map(col => (
                    <button key={col} onClick={() => setForm({ ...form, color: col })}
                      className={`w-8 h-8 rounded-full border-4 cursor-pointer transition-all ${form.color === col ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                      style={{ background: col }} />
                  ))}
                </div>
              </div>
            </div>
            <div className={`flex gap-3 p-5 border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              <button onClick={() => setShowModal(false)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium cursor-pointer ${dark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Cancelar</button>
              <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors cursor-pointer">
                {editingId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
