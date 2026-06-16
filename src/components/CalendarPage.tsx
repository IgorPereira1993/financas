import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, isOverdue, isDueSoon } from '../utils/formatters';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function CalendarPage() {
  const { expenses, incomes, categories, settings } = useStore();
  const dark = settings.darkMode;

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;

  const monthExpenses = useMemo(() => expenses.filter(e => e.dueDate.startsWith(monthKey)), [expenses, monthKey]);
  const monthIncomes = useMemo(() => incomes.filter(i => i.date.startsWith(monthKey)), [incomes, monthKey]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const getDayEvents = (day: number) => {
    const dayStr = `${monthKey}-${String(day).padStart(2, '0')}`;
    const dayExpenses = expenses.filter(e => e.dueDate === dayStr);
    const dayIncomes = incomes.filter(i => i.date === dayStr);
    return { expenses: dayExpenses, incomes: dayIncomes };
  };

  const hasDayEvents = (day: number) => {
    const ev = getDayEvents(day);
    return ev.expenses.length > 0 || ev.incomes.length > 0;
  };

  const getDayColor = (day: number) => {
    const dayStr = `${monthKey}-${String(day).padStart(2, '0')}`;
    const dayExpenses = expenses.filter(e => e.dueDate === dayStr && e.status === 'pending');
    if (dayExpenses.some(e => isOverdue(e.dueDate))) return 'red';
    if (dayExpenses.some(e => isDueSoon(e.dueDate))) return 'yellow';
    const hasIncome = incomes.some(i => i.date === dayStr);
    if (hasIncome && dayExpenses.length === 0) return 'green';
    if (dayExpenses.length > 0) return 'blue';
    return null;
  };

  const selectedEvents = selectedDay ? getDayEvents(selectedDay) : null;

  const monthTotal = {
    income: monthIncomes.reduce((s, i) => s + i.value, 0),
    expense: monthExpenses.reduce((s, e) => s + e.value, 0),
    paid: monthExpenses.filter(e => e.status === 'paid').reduce((s, e) => s + e.value, 0),
    pending: monthExpenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.value, 0),
  };

  const card = `rounded-2xl ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border shadow-sm`;
  const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`${card} p-4`}>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Receitas do Mês</p>
          <p className="text-xl font-bold text-green-500 mt-1">{formatCurrency(monthTotal.income)}</p>
        </div>
        <div className={`${card} p-4`}>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Despesas do Mês</p>
          <p className="text-xl font-bold text-red-500 mt-1">{formatCurrency(monthTotal.expense)}</p>
        </div>
        <div className={`${card} p-4`}>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Pago</p>
          <p className="text-xl font-bold text-blue-500 mt-1">{formatCurrency(monthTotal.paid)}</p>
        </div>
        <div className={`${card} p-4`}>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Pendente</p>
          <p className="text-xl font-bold text-yellow-500 mt-1">{formatCurrency(monthTotal.pending)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className={`lg:col-span-2 ${card} p-5`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className={`p-2 rounded-xl cursor-pointer ${dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ChevronLeft size={20} />
            </button>
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button onClick={nextMonth} className={`p-2 rounded-xl cursor-pointer ${dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className={`text-center text-xs font-medium py-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
              const isSelected = selectedDay === day;
              const hasEvents = hasDayEvents(day);
              const dayColor = getDayColor(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-500 text-white scale-105 shadow-md'
                      : isToday
                      ? dark ? 'bg-blue-900/40 text-blue-300 ring-2 ring-blue-500' : 'bg-blue-50 text-blue-600 ring-2 ring-blue-400'
                      : dark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {day}
                  {hasEvents && !isSelected && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayColor === 'red' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                      {dayColor === 'yellow' && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                      {dayColor === 'green' && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                      {dayColor === 'blue' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Vencido</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>A vencer</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Despesas</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Receitas</span></div>
          </div>
        </div>

        {/* Day detail */}
        <div className={`${card} p-5`}>
          {selectedDay ? (
            <div>
              <h3 className={`font-bold text-lg mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>
                {selectedDay} de {MONTHS[viewMonth]}
              </h3>
              {selectedEvents && selectedEvents.incomes.length === 0 && selectedEvents.expenses.length === 0 ? (
                <p className={`text-sm text-center py-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Sem movimentações</p>
              ) : (
                <div className="space-y-4">
                  {selectedEvents && selectedEvents.incomes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-2">Receitas</p>
                      <div className="space-y-2">
                        {selectedEvents.incomes.map(i => {
                          const cat = categories.find(c => c.id === i.categoryId);
                          return (
                            <div key={i.id} className={`flex items-center justify-between p-3 rounded-xl ${dark ? 'bg-gray-800' : 'bg-green-50'}`}>
                              <div className="flex items-center gap-2">
                                <span>{cat?.icon}</span>
                                <span className={`text-sm truncate ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{i.description}</span>
                              </div>
                              <span className="text-sm font-bold text-green-500 ml-2">{formatCurrency(i.value)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {selectedEvents && selectedEvents.expenses.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Despesas</p>
                      <div className="space-y-2">
                        {selectedEvents.expenses.map(e => {
                          const cat = categories.find(c => c.id === e.categoryId);
                          const overdue = e.status === 'pending' && isOverdue(e.dueDate);
                          return (
                            <div key={e.id} className={`flex items-center justify-between p-3 rounded-xl ${dark ? 'bg-gray-800' : overdue ? 'bg-red-50' : 'bg-gray-50'}`}>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span>{cat?.icon}</span>
                                <div className="min-w-0">
                                  <p className={`text-sm truncate ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{e.description}</p>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    {e.status === 'paid' ? <CheckCircle size={10} className="text-green-500" /> : overdue ? <AlertCircle size={10} className="text-red-500" /> : <Clock size={10} className="text-yellow-500" />}
                                    <span className={`text-xs ${e.status === 'paid' ? 'text-green-500' : overdue ? 'text-red-500' : 'text-yellow-500'}`}>
                                      {e.status === 'paid' ? 'Pago' : overdue ? 'Vencido' : 'Pendente'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className={`text-sm font-bold ml-2 shrink-0 ${e.status === 'paid' ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(e.value)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={`text-3xl mb-3`}>📅</p>
              <p className={`font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Clique em um dia</p>
              <p className={`text-sm mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>para ver as movimentações</p>
            </div>
          )}
        </div>
      </div>

      {/* Month events list */}
      <div className={`${card} p-5`}>
        <h3 className={`font-semibold text-sm mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Vencimentos do Mês</h3>
        {monthExpenses.length === 0 ? (
          <p className={`text-center text-sm py-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Nenhuma despesa para este mês</p>
        ) : (
          <div className={`divide-y ${dark ? 'divide-gray-800' : 'divide-gray-50'}`}>
            {monthExpenses.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(e => {
              const cat = categories.find(c => c.id === e.categoryId);
              const overdue = e.status === 'pending' && isOverdue(e.dueDate);
              const soon = e.status === 'pending' && isDueSoon(e.dueDate);
              return (
                <div key={e.id} className="flex items-center gap-3 py-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: cat?.color + '20' }}>
                    {cat?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${dark ? 'text-white' : 'text-gray-800'}`}>{e.description}</p>
                    <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Vence: {e.dueDate.split('-').reverse().join('/')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className={`text-sm font-bold ${overdue ? 'text-red-500' : dark ? 'text-white' : 'text-gray-800'}`}>{formatCurrency(e.value)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${e.status === 'paid' ? 'bg-green-100 text-green-700' : overdue ? 'bg-red-100 text-red-700' : soon ? 'bg-yellow-100 text-yellow-700' : dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                      {e.status === 'paid' ? 'Pago' : overdue ? 'Vencido' : soon ? 'Vence em breve' : 'Pendente'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
