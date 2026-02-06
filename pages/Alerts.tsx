import React from 'react';
import { useAppContext } from '../App';
import { Birthday } from '../types';
import { getDaysRemaining, getDayMonth } from '../utils';

const Alerts: React.FC = () => {
    const { birthdays, setCurrentView, setSelectedBirthday, showShareModal } = useAppContext();

    // Sort birthdays by days remaining
    const sortedBirthdays = [...birthdays].sort((a, b) => getDaysRemaining(a.date) - getDaysRemaining(b.date));

    // Group birthdays by time period
    const today = sortedBirthdays.filter(b => getDaysRemaining(b.date) === 0);
    const thisWeek = sortedBirthdays.filter(b => {
        const days = getDaysRemaining(b.date);
        return days > 0 && days <= 7;
    });
    const thisMonth = sortedBirthdays.filter(b => {
        const days = getDaysRemaining(b.date);
        return days > 7 && days <= 30;
    });
    const nextMonth = sortedBirthdays.filter(b => {
        const days = getDaysRemaining(b.date);
        return days > 30 && days <= 60;
    });

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

    const handleCall = (phone?: string) => {
        if (phone) {
            window.location.href = `tel:${phone.replace(/\D/g, '')}`;
        }
    };

    const handleWhatsApp = (birthday: Birthday) => {
        if (!birthday.phone) return;

        const days = getDaysRemaining(birthday.date);

        if (days === 0) {
            showShareModal(birthday);
        } else {
            const cleanPhone = birthday.phone.replace(/\D/g, '');
            window.open(`https://wa.me/55${cleanPhone}`, '_blank');
        }
    };

    const handleViewDetails = (birthday: Birthday) => {
        setSelectedBirthday(birthday);
        setCurrentView('DETAILS');
    };

    const renderBirthdayCard = (birthday: Birthday) => {
        const daysRemaining = getDaysRemaining(birthday.date);
        const isToday = daysRemaining === 0;

        return (
            <div
                key={birthday.id}
                className="bg-white dark:bg-[#2a2a2a] rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow"
            >
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {birthday.photo_url ? (
                            <div
                                className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-primary/20"
                                style={{ backgroundImage: `url("${birthday.photo_url}")` }}
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center border-2 border-primary/20">
                                <span className="text-primary font-bold text-lg">
                                    {birthday.name.substring(0, 2).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[#1a1a1a] dark:text-white font-bold text-base truncate">
                            {birthday.name}
                        </h3>
                        <p className="text-primary font-semibold text-sm mt-0.5">
                            {getDayMonth(birthday.date)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            {isToday ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                                    <span className="material-symbols-outlined text-sm">cake</span>
                                    Hoje!
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-full text-xs font-bold">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    {daysRemaining === 1 ? 'Amanhã' : `${daysRemaining} dias`}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        {birthday.phone && (
                            <>
                                <button
                                    onClick={() => handleCall(birthday.phone)}
                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                                    title="Ligar"
                                >
                                    <span className="material-symbols-outlined text-lg">call</span>
                                </button>
                                <button
                                    onClick={() => handleWhatsApp(birthday)}
                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                                    title="WhatsApp"
                                >
                                    <span className="material-symbols-outlined text-lg">chat</span>
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => handleViewDetails(birthday)}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            title="Ver detalhes"
                        >
                            <span className="material-symbols-outlined text-lg">info</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSection = (title: string, birthdays: Birthday[], icon: string) => {
        if (birthdays.length === 0) return null;

        return (
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 px-4">
                    <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
                    <h2 className="text-[#1a1a1a] dark:text-white text-lg font-bold">
                        {title}
                    </h2>
                    <span className="ml-auto text-gray-400 dark:text-gray-500 text-sm font-bold">
                        {birthdays.length}
                    </span>
                </div>
                <div className="space-y-3 px-4">
                    {birthdays.map(renderBirthdayCard)}
                </div>
            </div>
        );
    };

    /* Filter Logic */
    const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null);

    // If a month is selected, filter birthdays for that month
    // Otherwise, use the time-period groups
    const selectedMonthBirthdays = selectedMonth !== null
        ? sortedBirthdays.filter(b => {
            const [_, month] = b.date.split('-').map(Number);
            return (month - 1) === selectedMonth;
        }).sort((a, b) => {
            // Sort by day in the selected month
            const dayA = parseInt(a.date.split('-')[2]);
            const dayB = parseInt(b.date.split('-')[2]);
            return dayA - dayB;
        })
        : [];

    const handleMonthClick = (index: number) => {
        if (hasMoved) return; // Prevent click if dragging
        if (selectedMonth === index) {
            setSelectedMonth(null); // Deselect
        } else {
            setSelectedMonth(index); // Select
        }
    };

    const totalUpcoming = today.length + thisWeek.length + thisMonth.length + nextMonth.length;

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark font-display">
            {/* Header */}
            <header className="flex-none bg-primary text-white shadow-md z-50">
                <div className="flex items-center p-4 h-16 max-w-lg mx-auto">
                    <button onClick={() => setCurrentView('HOME')} className="flex-none text-white/80 hover:text-white">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <h1 className="flex-1 text-center text-lg font-bold tracking-tight">Próximos Aniversários</h1>
                    <div className="flex-none w-6"></div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto pb-24">
                {/* Monthly Summary */}
                <div className="pt-6 px-4 mb-2">
                    <h2 className="text-[#1a1a1a] dark:text-white text-lg font-bold mb-3">
                        Total por Mês 📊
                    </h2>
                    <div
                        ref={scrollContainerRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className={`flex gap-3 overflow-x-auto pb-4 hide-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                        {Array.from({ length: 12 }).map((_, index) => {
                            const count = birthdays.filter(b => {
                                const [_, month] = b.date.split('-').map(Number);
                                return (month - 1) === index;
                            }).length;

                            if (count === 0) return null;

                            const dateForMonth = new Date();
                            dateForMonth.setMonth(index);
                            const monthName = dateForMonth.toLocaleString('pt-BR', { month: 'long' });
                            const isSelected = selectedMonth === index;

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleMonthClick(index)}
                                    className={`
                                        flex-shrink-0 border rounded-xl p-2 min-w-[70px] flex flex-col items-center justify-center shadow-sm select-none transition-all cursor-pointer
                                        ${isSelected
                                            ? 'bg-primary border-primary text-white transform scale-105 shadow-md'
                                            : 'bg-white dark:bg-[#2a2a2a] border-gray-100 dark:border-white/5 hover:border-primary/50'
                                        }
                                    `}
                                >
                                    <span className={`text-lg font-black ${isSelected ? 'text-white' : 'text-primary'}`}>{count}</span>
                                    <span className={`text-[9px] font-bold uppercase ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{monthName.substring(0, 3)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {selectedMonth !== null ? (
                    // Filtered View
                    <div className="animate-fade-in">
                        {renderSection(
                            `Aniversariantes de ${new Date(0, selectedMonth).toLocaleString('pt-BR', { month: 'long' })}`,
                            selectedMonthBirthdays,
                            'filter_alt'
                        )}
                        {selectedMonthBirthdays.length === 0 && (
                            <div className="text-center text-gray-400 py-10">
                                Nenhum aniversariante encontrado neste filtro.
                            </div>
                        )}
                    </div>
                ) : (
                    // Default View
                    <>
                        {totalUpcoming === 0 ? (
                            <div className="flex flex-col items-center justify-center pt-10 px-4 text-center pb-20">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-primary text-4xl">notifications_off</span>
                                </div>
                                <h3 className="text-[#1a1a1a] dark:text-white text-xl font-bold mb-2">
                                    Nenhum alerta próximo
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                                    Você não tem aniversários próximos nos próximos 60 dias.
                                </p>
                            </div>
                        ) : (
                            <div>
                                {renderSection('Hoje 🎉', today, 'cake')}
                                {renderSection('Esta Semana', thisWeek, 'calendar_today')}
                                {renderSection('Este Mês', thisMonth, 'calendar_month')}
                                {renderSection('Próximo Mês', nextMonth, 'event')}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Alerts;
