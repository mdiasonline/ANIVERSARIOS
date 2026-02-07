import React from 'react';
import { useAppContext } from '../App';
import { Birthday } from '../types';
import { getDaysRemaining, getDayMonth, getMonthName, getDayNumber } from '../utils';
import BirthdayListItem from '../components/BirthdayListItem';
import { supabase } from '../supabase';

const Home: React.FC = () => {
  const { user, setCurrentView, birthdays, setSelectedBirthday } = useAppContext();
  const [viewingDate, setViewingDate] = React.useState(new Date());

  const goToNextMonth = () => {
    setViewingDate(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + 1);
      return next;
    });
  };

  const goToPrevMonth = () => {
    setViewingDate(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() - 1);
      return next;
    });
  };

  const sortedBirthdays = [...birthdays].sort((a, b) => getDaysRemaining(a.date) - getDaysRemaining(b.date));

  // Filter birthdays for the month and year currently being viewed
  const thisMonthBirthdays = sortedBirthdays.filter(b => {
    const birthDate = new Date(b.date);
    // Add timezone offset to avoid being off-by-one
    const userTimezoneOffset = birthDate.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(birthDate.getTime() + userTimezoneOffset);
    return adjustedDate.getMonth() === viewingDate.getMonth();
  });

  const upcomingBirthdays = sortedBirthdays.slice(0, 5); // Show first 5 closest

  /* Drag to Scroll Logic */
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [hasMoved, setHasMoved] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Determine if it was a significant move to block clicks if needed
    // handled by onClick check
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast factor
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark pb-6">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-100 dark:border-gray-800 relative">
        <div className="flex items-center gap-2 ml-1 z-10 w-10">
          {/* Spacer or Back button if needed, otherwise empty to balance layout */}
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
          <img src="/assets/cake_slice.svg" alt="Bolo" className="h-14 w-auto object-contain pb-2" />
          <h2 className="text-[#1a1a1a] dark:text-white text-3xl font-black leading-none tracking-tight uppercase">
            ANIVERSÁRIOS
          </h2>
        </div>
        <div className="flex gap-2 items-center justify-end">
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 bg-transparent text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            title="Sair"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
          <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 bg-transparent text-[#1a1a1a] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </div>

      <main className="flex flex-col">
        {/* Welcome */}
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-[#1a1a1a] dark:text-white tracking-tight text-[32px] font-extrabold leading-tight">
            Olá, {user?.name || 'Visitante'}! 👋
          </h1>
          <p className="text-[#6b7280] dark:text-gray-400 text-base font-medium mt-1">
            Não esqueça de celebrar hoje.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-stretch py-4">
          <div className="flex flex-1 gap-3 px-4 justify-between">
            <button
              onClick={() => setCurrentView('ADD')}
              className="flex flex-1 min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-xl h-14 bg-primary text-white text-base font-bold transition-transform active:scale-95 shadow-lg shadow-primary/20 hover:bg-primary-hover"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              <span className="truncate">Cadastrar</span>
            </button>
            <button
              onClick={() => setCurrentView('LIST')}
              className="flex flex-1 min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-xl h-14 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary text-base font-bold transition-transform active:scale-95 border border-primary/10 hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-xl">calendar_month</span>
              <span className="truncate">Ver Todos</span>
            </button>
          </div>
        </div>

        {/* Horizontal Scroll */}
        <div className="flex items-center justify-between px-4 pt-6 pb-3">
          <h2 className="text-[#1a1a1a] dark:text-white text-[20px] font-bold leading-tight tracking-tight">
            Aniversários de {viewingDate.toLocaleString('pt-BR', { month: 'long' })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevMonth}
              className="size-8 flex items-center justify-center text-primary rounded-full hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button
              onClick={goToNextMonth}
              className="size-8 flex items-center justify-center text-primary rounded-full hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`overflow-x-auto flex gap-4 px-4 pb-8 hide-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {thisMonthBirthdays.map((birthday) => (
            <div
              key={birthday.id}
              onClick={(e) => {
                if (hasMoved) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                setSelectedBirthday(birthday);
                setCurrentView('DETAILS');
              }}
              draggable={false} // Prevent native drag
              className="min-w-[140px] flex-shrink-0 bg-white dark:bg-[#2a2a2a] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center text-center hover:shadow-md transition-shadow select-none"
            >
              <div className="relative mb-3">
                {birthday.photo_url ? (
                  <div
                    className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-primary/10"
                    style={{ backgroundImage: `url("${birthday.photo_url}")` }}
                  ></div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center border-2 border-primary/10">
                    <span className="text-primary font-bold text-xl">{birthday.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                {getDaysRemaining(birthday.date) === 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 border-2 border-white dark:border-[#2a2a2a]">
                    <span className="material-symbols-outlined text-[12px] block font-bold">cake</span>
                  </div>
                )}
              </div>
              <h3 className="text-[#1a1a1a] dark:text-white font-bold text-sm truncate w-full">
                {birthday.name}
              </h3>
              <p className="text-primary font-bold text-xs mt-1">{getDayMonth(birthday.date)}</p>
              <p className="text-gray-400 text-[10px] uppercase font-bold mt-1">
                {getDaysRemaining(birthday.date) === 0 ? "Hoje!" : `Faltam ${getDaysRemaining(birthday.date)} dias`}
              </p>
            </div>
          ))}
          {thisMonthBirthdays.length === 0 && (
            <div className="w-full text-center text-gray-400 py-4 text-sm">
              Nenhum aniversário próximo.
            </div>
          )}
        </div>

        {/* Vertical List */}
        <div className="px-4 pt-4">
          <h2 className="text-[#1a1a1a] dark:text-white text-[18px] font-bold leading-tight mb-4">
            Próximos em breve
          </h2>
          <div className="space-y-3 pb-24">
            {upcomingBirthdays.map((birthday) => (
              <BirthdayListItem
                key={birthday.id}
                birthday={birthday}
                variant="home"
                onClick={() => {
                  setSelectedBirthday(birthday);
                  setCurrentView('DETAILS');
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;