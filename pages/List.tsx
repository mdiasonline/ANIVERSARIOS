import React from 'react';
import { useAppContext } from '../App';
import { getDaysRemaining, getDayMonth } from '../utils';
import BirthdayListItem from '../components/BirthdayListItem';

const List: React.FC = () => {
  const { birthdays, searchTerm, setSearchTerm, setCurrentView, user } = useAppContext();


  const filteredBirthdays = birthdays
    .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => getDaysRemaining(a.date) - getDaysRemaining(b.date));

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark font-display">
      {/* Header */}
      <header className="flex-none bg-primary text-white shadow-md z-50">
        <div className="flex items-center p-4 h-16 max-w-lg mx-auto">
          <button onClick={() => setCurrentView('HOME')} className="flex-none text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold tracking-tight">Lista de Aniversariantes</h1>
          <div className="flex-none w-6"></div>
        </div>
      </header>

      {/* Search */}
      <div className="flex-none px-4 py-4 bg-background-light dark:bg-background-dark z-40">
        <label className="relative flex items-center w-full max-w-lg mx-auto">
          <span className="absolute left-4 text-primary material-symbols-outlined">search</span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-zinc-800 border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/50 text-base placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            placeholder="Buscar aniversariante..."
            type="text"
          />
        </label>
      </div>

      {/* Scrollable List */}
      <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full pb-24">
        <div className="px-4 space-y-4 pt-4">
          {filteredBirthdays.map((person) => (
            <BirthdayListItem key={person.id} birthday={person} variant="list" />
          ))}

          {filteredBirthdays.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              Nenhum aniversariante encontrado.
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setCurrentView('ADD')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50 hover:bg-primary-hover"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};

export default List;