import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Eye, EyeOff, User, Shield, Moon, Sun, Trash2, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { users, currentUser, updateUser, toggleDarkMode, settings: { darkMode } } = useStore();
  const dark = darkMode;

  const [passwords, setPasswords] = useState<Record<string, { current: string; new1: string; new2: string; show: boolean }>>({
    'user-husband': { current: '', new1: '', new2: '', show: false },
    'user-wife': { current: '', new1: '', new2: '', show: false },
  });
  const [names, setNames] = useState<Record<string, string>>({
    'user-husband': users.find(u => u.id === 'user-husband')?.name || 'Marido',
    'user-wife': users.find(u => u.id === 'user-wife')?.name || 'Esposa',
  });
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [showReset, setShowReset] = useState(false);

  const showFeedback = (id: string, msg: string) => {
    setFeedback(f => ({ ...f, [id]: msg }));
    setTimeout(() => setFeedback(f => ({ ...f, [id]: '' })), 3000);
  };

  const handleSaveName = (userId: string) => {
    const name = names[userId].trim();
    if (!name) return;
    updateUser(userId, { name });
    showFeedback(userId + '-name', 'Nome atualizado!');
  };

  const handleChangePassword = (userId: string) => {
    const { current, new1, new2 } = passwords[userId];
    const user = users.find(u => u.id === userId);
    if (!user) return;
    if (user.password !== current) { showFeedback(userId, 'Senha atual incorreta'); return; }
    if (new1.length < 4) { showFeedback(userId, 'Nova senha deve ter ao menos 4 caracteres'); return; }
    if (new1 !== new2) { showFeedback(userId, 'As senhas não coincidem'); return; }
    updateUser(userId, { password: new1 });
    setPasswords(p => ({ ...p, [userId]: { current: '', new1: '', new2: '', show: false } }));
    showFeedback(userId, 'Senha alterada com sucesso! ✓');
  };

  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const card = `rounded-2xl ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border shadow-sm p-5`;

  const PasswordInput = ({ value, onChange, placeholder, userId }: { value: string; onChange: (v: string) => void; placeholder: string; userId: string }) => (
    <div className="relative">
      <input
        type={passwords[userId]?.show ? 'text' : 'password'}
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none pr-10 ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`}
      />
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Appearance */}
      <div className={card}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            {dark ? <Moon size={18} className="text-yellow-400" /> : <Sun size={18} className="text-orange-500" />}
          </div>
          <h2 className={`font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Aparência</h2>
        </div>
        <div className={`flex items-center justify-between p-4 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div>
            <p className={`font-medium text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>Tema Escuro</p>
            <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{dark ? 'Tema escuro ativado' : 'Tema claro ativado'}</p>
          </div>
          <button onClick={toggleDarkMode} className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${dark ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${dark ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* User profiles */}
      {users.map(user => (
        <div key={user.id} className={card}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: user.color + '20' }}>
              {user.avatar}
            </div>
            <div>
              <h2 className={`font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{user.name}</h2>
              <p className="text-xs" style={{ color: user.color }}>{user.role === 'husband' ? 'Marido' : 'Esposa'}</p>
            </div>
            {currentUser?.id === user.id && (
              <span className={`ml-auto text-xs px-2 py-1 rounded-full ${dark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                Você
              </span>
            )}
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <User size={12} className="inline mr-1" /> Nome de Exibição
            </label>
            <div className="flex gap-2">
              <input
                type="text" value={names[user.id]} onChange={e => setNames(n => ({ ...n, [user.id]: e.target.value }))}
                className={`flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
              />
              <button onClick={() => handleSaveName(user.id)} className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors cursor-pointer">
                Salvar
              </button>
            </div>
            {feedback[user.id + '-name'] && (
              <p className="text-green-500 text-xs mt-1">{feedback[user.id + '-name']}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-xs font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Shield size={12} className="inline mr-1" /> Alterar Senha
              </label>
              <button onClick={() => setPasswords(p => ({ ...p, [user.id]: { ...p[user.id], show: !p[user.id].show } }))}
                className={`text-xs cursor-pointer ${dark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                {passwords[user.id]?.show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="space-y-2">
              <PasswordInput value={passwords[user.id]?.current || ''} onChange={v => setPasswords(p => ({ ...p, [user.id]: { ...p[user.id], current: v } }))} placeholder="Senha atual" userId={user.id} />
              <PasswordInput value={passwords[user.id]?.new1 || ''} onChange={v => setPasswords(p => ({ ...p, [user.id]: { ...p[user.id], new1: v } }))} placeholder="Nova senha" userId={user.id} />
              <PasswordInput value={passwords[user.id]?.new2 || ''} onChange={v => setPasswords(p => ({ ...p, [user.id]: { ...p[user.id], new2: v } }))} placeholder="Confirmar nova senha" userId={user.id} />
            </div>
            <button onClick={() => handleChangePassword(user.id)} className={`mt-2 w-full py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${dark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
              Alterar Senha
            </button>
            {feedback[user.id] && (
              <p className={`text-xs mt-1 ${feedback[user.id].includes('✓') ? 'text-green-500' : 'text-red-500'}`}>{feedback[user.id]}</p>
            )}
          </div>
        </div>
      ))}

      {/* Danger zone */}
      <div className={`rounded-2xl border ${dark ? 'bg-gray-900 border-red-900' : 'bg-white border-red-200'} shadow-sm p-5`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-100">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <h2 className={`font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Zona de Perigo</h2>
        </div>
        <p className={`text-sm mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          Esta ação irá apagar todos os dados salvos (receitas, despesas, cartões, metas) e restaurar os dados de demonstração. Esta ação não pode ser desfeita.
        </p>
        {!showReset ? (
          <button onClick={() => setShowReset(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors cursor-pointer">
            <Trash2 size={16} /> Resetar Todos os Dados
          </button>
        ) : (
          <div className={`p-4 rounded-xl ${dark ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-3">Tem certeza? Esta ação é irreversível!</p>
            <div className="flex gap-3">
              <button onClick={handleResetData} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors cursor-pointer">
                Sim, Resetar
              </button>
              <button onClick={() => setShowReset(false)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium cursor-pointer ${dark ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`${card} text-center`}>
        <div className="text-3xl mb-2">💰</div>
        <p className={`font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>FinançasFamília</p>
        <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Versão 1.0.0 • Controle Financeiro Familiar</p>
        <p className={`text-xs mt-1 ${dark ? 'text-gray-600' : 'text-gray-300'}`}>Dados salvos localmente no navegador</p>
      </div>
    </div>
  );
}
