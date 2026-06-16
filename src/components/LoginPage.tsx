import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'husband' | 'wife' | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const login = useStore(s => s.login);
  const settings = useStore(s => s.settings);
  const dark = settings.darkMode;

  const handleLogin = () => {
    if (!selectedRole) { setError('Selecione um usuário'); return; }
    const ok = login(selectedRole, password);
    if (!ok) { setError('Senha incorreta. Tente novamente.'); }
  };

  const handleSelect = (role: 'husband' | 'wife') => {
    setSelectedRole(role);
    setPassword('');
    setError('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${dark ? 'bg-gray-950' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${dark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-white/20 rounded-2xl p-3">
              <TrendingUp className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">FinançasFamília</h1>
          <p className="text-blue-200 text-sm mt-1">Controle financeiro familiar</p>
        </div>

        <div className="p-8">
          <p className={`text-center text-sm font-medium mb-6 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            Quem está acessando?
          </p>

          {/* User Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleSelect('husband')}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                selectedRole === 'husband'
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                  : dark
                  ? 'border-gray-700 bg-gray-800 hover:border-blue-400'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <span className="text-5xl">👨</span>
              <div>
                <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>Marido</p>
                <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Usuário 1</p>
              </div>
              {selectedRole === 'husband' && (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>

            <button
              onClick={() => handleSelect('wife')}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                selectedRole === 'wife'
                  ? 'border-pink-500 bg-pink-50 shadow-md scale-105'
                  : dark
                  ? 'border-gray-700 bg-gray-800 hover:border-pink-400'
                  : 'border-gray-200 bg-gray-50 hover:border-pink-300 hover:bg-pink-50'
              }`}
            >
              <span className="text-5xl">👩</span>
              <div>
                <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>Esposa</p>
                <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Usuário 2</p>
              </div>
              {selectedRole === 'wife' && (
                <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          </div>

          {/* Password */}
          {selectedRole && (
            <div className="mb-4 animate-in fade-in duration-200">
              <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Digite sua senha"
                  className={`w-full px-4 py-3 rounded-xl border pr-12 outline-none transition-all ${
                    dark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={!selectedRole}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-200"
          >
            Entrar
          </button>

          <p className={`text-center text-xs mt-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            Senha padrão: <strong>1234</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
