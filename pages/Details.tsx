import React from 'react';
import { useAppContext } from '../App';
import { getDayMonth, getDaysRemaining, getMonthName, getDayNumber, calculateAge, formatPhone } from '../utils';

const Details: React.FC = () => {
    const { selectedBirthday, setCurrentView, deleteBirthday, showConfirm, user, showShareModal } = useAppContext();

    if (!selectedBirthday) {
        setCurrentView('HOME');
        return null;
    }

    const days = getDaysRemaining(selectedBirthday.date);

    const formatPhoneForLink = (phone: string) => {
        return phone.replace(/\D/g, '');
    };

    const handleCall = () => {
        window.location.href = `tel:${formatPhoneForLink(selectedBirthday.phone)}`;
    };

    const handleWhatsApp = () => {
        if (days === 0) {
            showShareModal(selectedBirthday);
        } else {
            window.location.href = `https://wa.me/${formatPhoneForLink(selectedBirthday.phone)}`;
        }
    };

    const handleDelete = () => {
        showConfirm({
            title: 'Excluir Aniversário?',
            message: `Tem certeza que deseja remover ${selectedBirthday.name} da sua agenda? Esta ação não pode ser desfeita.`,
            confirmLabel: 'Sim, Excluir',
            cancelLabel: 'Não, Manter',
            variant: 'danger',
            onConfirm: () => {
                deleteBirthday(selectedBirthday.id);
                setCurrentView('LIST');
            }
        });
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark overflow-x-hidden pb-20">
            {/* Header */}
            <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
                <div
                    onClick={() => setCurrentView('HOME')}
                    className="text-primary cursor-pointer flex size-12 shrink-0 items-center justify-start hover:text-primary-hover"
                >
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </div>
                <h2 className="text-[#1a1a1a] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
                    Detalhes
                </h2>
            </header>

            <main className="flex-1 flex flex-col">
                {/* Profile Card */}
                <div className="px-4 pt-6 flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-1">
                            <div className="w-full h-full rounded-full bg-white dark:bg-[#2a2a2a] flex items-center justify-center overflow-hidden border border-gray-100 dark:border-white/5 shadow-inner">
                                {selectedBirthday.photo_url ? (
                                    <img src={selectedBirthday.photo_url} alt={selectedBirthday.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-6xl text-primary/30">person</span>
                                )}
                            </div>
                        </div>
                        {days === 0 && (
                            <div className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2 border-4 border-white dark:border-background-dark">
                                <span className="material-symbols-outlined text-sm block font-bold">cake</span>
                            </div>
                        )}
                    </div>

                    <h1 className="text-[#1a1a1a] dark:text-white text-2xl font-extrabold text-center">
                        {selectedBirthday.name}
                    </h1>
                    <p className="text-primary font-bold mt-1 uppercase tracking-widest text-xs">
                        {calculateAge(selectedBirthday.date)} anos
                    </p>
                </div>

                {/* Counter Info */}
                <div className="px-4 mt-8">
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 flex items-center justify-between border border-primary/10">
                        <div className="flex flex-col">
                            <span className="text-[#1a1a1a]/40 dark:text-white/40 text-[10px] font-bold uppercase tracking-widest">Faltam</span>
                            <span className="text-primary text-4xl font-black">{days}</span>
                            <span className="text-[#1a1a1a]/40 dark:text-white/40 text-[10px] font-bold uppercase tracking-widest">Dias</span>
                        </div>
                        <div className="w-px h-12 bg-primary/20"></div>
                        <div className="flex flex-col text-right">
                            <span className="text-[#1a1a1a]/40 dark:text-white/40 text-[10px] font-bold uppercase tracking-widest">Data</span>
                            <span className="text-[#1a1a1a] dark:text-white text-xl font-bold">{getDayMonth(selectedBirthday.date)}</span>
                            <span className="text-[#1a1a1a]/40 dark:text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">de {getMonthName(selectedBirthday.date)}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Contact Actions */}
                {selectedBirthday.phone && (
                    <div className="px-4 mt-6 grid grid-cols-2 gap-3">
                        <button
                            onClick={handleCall}
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-white text-3xl">call</span>
                            <span className="text-white text-xs font-bold uppercase">Ligar</span>
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-[#25D366] rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
                        >
                            <div className="size-8 flex items-center justify-center">
                                <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.548 4.19 1.59 6.033L0 24l6.105-1.602a11.832 11.832 0 005.937 1.598h.005c6.637 0 12.032-5.395 12.035-12.03a11.762 11.762 0 00-3.489-8.492" />
                                </svg>
                            </div>
                            <span className="text-white text-xs font-bold uppercase">WhatsApp</span>
                        </button>
                    </div>
                )}

                {/* Contact info list */}
                <div className="px-4 mt-8 flex flex-col gap-4">
                    <h3 className="text-[#1a1a1a]/40 dark:text-white/40 text-[10px] font-extrabold uppercase tracking-widest px-1">Informações de Contato</h3>

                    {selectedBirthday.phone && (
                        <div className="bg-white dark:bg-[#2a2a2a] rounded-xl p-4 flex items-center gap-4 border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">call</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[#1a1a1a]/40 dark:text-white/40 text-[10px] font-bold uppercase">Telefone</p>
                                <p className="text-[#1a1a1a] dark:text-white font-bold">{formatPhone(selectedBirthday.phone)}</p>
                            </div>
                        </div>
                    )}

                    {selectedBirthday.email && (
                        <div className="bg-white dark:bg-[#2a2a2a] rounded-xl p-4 flex items-center gap-4 border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">mail</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[#1a1a1a]/40 dark:text-white/40 text-[10px] font-bold uppercase">E-mail</p>
                                <p className="text-[#1a1a1a] dark:text-white font-bold">{selectedBirthday.email}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {/* Action Buttons - Admin or Owner */}
                {(user?.role === 'admin' || (user?.id && user.id === selectedBirthday.created_by)) && (
                    <div className="px-4 mt-10 grid grid-cols-1 gap-3">
                        <button
                            onClick={() => setCurrentView('EDIT')}
                            className="w-full h-14 bg-white dark:bg-[#2a2a2a] border border-gray-100 dark:border-white/5 text-[#1a1a1a] dark:text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                        >
                            <span className="material-symbols-outlined">edit</span>
                            Editar
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-full h-14 bg-transparent text-primary/50 font-bold text-base rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                        >
                            <span className="material-symbols-outlined">delete</span>
                            Remover da Agenda
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Details;
