import { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Target, Plus, Edit2, Trash2, X, PlusCircle } from 'lucide-react';

const GOAL_ICONS = ['🚗', '✈️', '🏠', '💍', '🎓', '💻', '🏖️', '🎁', '🏋️', '📱', '🎮', '🌟'];
const GOAL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const EMPTY_FORM = {
  name: '', targetValue: '', currentValue: '0', targetDate: '', description: '', icon: '🌟', color: '#3b82f6', userId: '',
};

export default function GoalsPage() {
  const { goals, users, currentUser, addGoal, updateGoal, deleteGoal, contributeToGoal, settings } = useStore();
  const dark = settings.darkMode;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, userId: currentUser?.id || '' });
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, userId: currentUser?.id || '' });
    setShowModal(true);
  };

  const openEdit = (goal: typeof goals[0]) => {
    setEditingId(goal.id);
    setForm({ name: goal.name, targetValue: String(goal.targetValue), currentValue: String(goal.currentValue), targetDate: goal.targetDate, description: goal.description || '', icon: goal.icon, color: goal.color, userId: goal.userId });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.targetValue) return;
    const data = { name: form.name, targetValue: parseFloat(form.targetValue), currentValue: parseFloat(form.currentValue || '0'), targetDate: form.targetDate, description: form.description, icon: form.icon, color: form.color, userId: form.userId || currentUser?.id || '' };
    if (editingId) updateGoal(editingId, data);
    else addGoal(data);
    setShowModal(false);
  };

  const handleContribute = (goalId: string) => {
    const amount = parseFloat(contributeAmount);
    if (!amount || amount <= 0) return;
    contributeToGoal(goalId, amount);
    setShowContribute(null);
    setContributeAmount('');
  };

  const card = `rounded-2xl ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border shadow-sm`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-800'}`}>Metas Financeiras</h2>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{goals.length} meta(s) criada(s)</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors cursor-pointer">
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`${card} p-4 text-center`}>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Total Metas</p>
          <p className={`text-xl font-bold mt-1 ${dark ? 'text-white' : 'text-gray-800'}`}>{formatCurrency(goals.reduce((s, g) => s + g.targetValue, 0))}</p>
        </div>
        <div className={`${card} p-4 text-center`}>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Conquistado</p>
          <p className="text-xl font-bold mt-1 text-green-500">{formatCurrency(goals.reduce((s, g) => s + g.currentValue, 0))}</p>
        </div>
        <div className={`${card} p-4 text-center`}>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Restante</p>
          <p className="text-xl font-bold mt-1 text-yellow-500">{formatCurrency(goals.reduce((s, g) => s + Math.max(0, g.targetValue - g.currentValue), 0))}</p>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className={`${card} text-center py-16`}>
          <Target size={52} className={`mx-auto mb-3 ${dark ? 'text-gray-700' : 'text-gray-200'}`} />
          <p className={`font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Nenhuma meta cadastrada</p>
          <p className={`text-sm mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Crie suas metas financeiras</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map(goal => {
            const pct = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
            const remaining = goal.targetValue - goal.currentValue;
            const user = users.find(u => u.id === goal.userId);
            const completed = pct >= 100;
            const daysLeft = goal.targetDate ? Math.ceil((new Date(goal.targetDate + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <div key={goal.id} className={`${card} p-5 relative overflow-hidden`}>
                {completed && (
                  <div className="absolute top-3 right-3">
                    <span className="text-2xl">🎉</span>
                  </div>
                )}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: goal.color + '20' }}>
                    {goal.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold ${dark ? 'text-white' : 'text-gray-800'} truncate`}>{goal.name}</h3>
                    {goal.description && <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>{goal.description}</p>}
                    {user && <p className="text-xs mt-1" style={{ color: user.color }}>{user.avatar} {user.name}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Progresso</span>
                      <span className="text-xs font-bold" style={{ color: goal.color }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className={`h-3 rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-100'} overflow-hidden`}>
                      <div className="h-3 rounded-full transition-all duration-700 relative" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${goal.color}, ${goal.color}cc)` }}>
                        {pct > 15 && <div className="absolute inset-0 bg-white/20 rounded-full" />}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2.5 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Conquistado</p>
                      <p className="text-sm font-bold text-green-500 mt-0.5">{formatCurrency(goal.currentValue)}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{completed ? 'Meta' : 'Restante'}</p>
                      <p className={`text-sm font-bold mt-0.5 ${completed ? dark ? 'text-white' : 'text-gray-700' : 'text-yellow-500'}`}>
                        {completed ? formatCurrency(goal.targetValue) : formatCurrency(remaining)}
                      </p>
                    </div>
                  </div>

                  {goal.targetDate && (
                    <div className={`flex items-center justify-between text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>📅 {formatDate(goal.targetDate)}</span>
                      {daysLeft !== null && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${daysLeft < 0 ? 'bg-red-100 text-red-600' : daysLeft < 30 ? 'bg-yellow-100 text-yellow-600' : dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                          {daysLeft < 0 ? 'Vencido' : `${daysLeft} dias`}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className={`flex gap-2 mt-4 pt-4 border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
                  {!completed && (
                    <button onClick={() => { setShowContribute(goal.id); setContributeAmount(''); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors cursor-pointer">
                      <PlusCircle size={14} /> Contribuir
                    </button>
                  )}
                  <button onClick={() => openEdit(goal)}
                    className={`p-2 rounded-xl cursor-pointer ${dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Edit2 size={14} /></button>
                  <button onClick={() => deleteGoal(goal.id)}
                    className="p-2 rounded-xl hover:bg-red-100 text-red-500 cursor-pointer"><Trash2 size={14} /></button>
                </div>

                {showContribute === goal.id && (
                  <div className="mt-3 flex gap-2">
                    <input type="number" min="0" step="0.01" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)}
                      placeholder="Valor (R$)" className={`flex-1 px-3 py-2 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
                    <button onClick={() => handleContribute(goal.id)} className="px-3 py-2 rounded-xl bg-green-500 text-white text-sm cursor-pointer">✓</button>
                    <button onClick={() => setShowContribute(null)} className={`px-3 py-2 rounded-xl text-sm cursor-pointer ${dark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>✕</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] ${dark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-5 border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              <h2 className={`font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{editingId ? 'Editar Meta' : 'Nova Meta'}</h2>
              <button onClick={() => setShowModal(false)} className={`p-2 rounded-xl cursor-pointer ${dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Nome da Meta *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Comprar Carro, Viagem..."
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Valor Desejado (R$) *</label>
                  <input type="number" min="0" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} placeholder="0,00"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Valor Atual (R$)</label>
                  <input type="number" min="0" value={form.currentValue} onChange={e => setForm({ ...form, currentValue: e.target.value })} placeholder="0,00"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Data Prevista</label>
                  <input type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
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
                <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICONS.map(icon => (
                    <button key={icon} onClick={() => setForm({ ...form, icon })}
                      className={`w-10 h-10 rounded-xl text-xl border-2 cursor-pointer transition-all ${form.icon === icon ? 'border-blue-500 scale-110' : dark ? 'border-gray-700 hover:border-gray-500' : 'border-gray-100 hover:border-gray-300'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Cor</label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_COLORS.map(col => (
                    <button key={col} onClick={() => setForm({ ...form, color: col })}
                      className={`w-8 h-8 rounded-full border-4 cursor-pointer transition-all ${form.color === col ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                      style={{ background: col }} />
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Descrição</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Descrição da meta..."
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
              </div>
            </div>
            <div className={`flex gap-3 p-5 border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              <button onClick={() => setShowModal(false)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium cursor-pointer ${dark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Cancelar</button>
              <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors cursor-pointer">
                {editingId ? 'Salvar' : 'Criar Meta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
