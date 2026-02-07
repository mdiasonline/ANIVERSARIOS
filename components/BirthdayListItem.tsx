import React from 'react';
import { Birthday } from '../types';
import { getDayMonth, getDaysRemaining, getMonthName, getDayNumber, calculateAge, formatPhone } from '../utils';
import { useAppContext } from '../App';

interface BirthdayListItemProps {
    birthday: Birthday;
    variant?: 'home' | 'list';
    onClick?: () => void;
}

const BirthdayListItem: React.FC<BirthdayListItemProps> = ({ birthday, variant = 'list', onClick }) => {
    const { deleteBirthday, showConfirm, showShareModal } = useAppContext();
    const days = getDaysRemaining(birthday.date);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        showConfirm({
            title: 'Remover Registro?',
            message: `Deseja excluir o aniversário de ${birthday.name}?`,
            confirmLabel: 'Excluir',
            cancelLabel: 'Cancelar',
            variant: 'danger',
            onConfirm: () => deleteBirthday(birthday.id),
        });
    };

    // Home Variant (Compact)
    if (variant === 'home') {
        return (
            <div
                onClick={onClick}
                className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-xl border border-gray-50 dark:border-white/5 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
            >
                <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${days < 7 ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                    <span className="text-[10px] font-bold uppercase leading-none">{getMonthName(birthday.date)}</span>
                    <span className="text-lg font-extrabold leading-none">{getDayNumber(birthday.date)}</span>
                </div>
                <div className="flex-1">
                    <h4 className="text-[#1a1a1a] dark:text-white font-bold text-sm">{birthday.name}</h4>
                    <p className="text-gray-400 text-xs">{calculateAge(birthday.date)} anos</p>
                </div>
                <button className="text-primary hover:bg-primary/10 rounded-full p-1 transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        );
    }

    // List Variant (Full)
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col gap-3 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-primary overflow-hidden">
                        {birthday.photo_url ? (
                            <img src={birthday.photo_url} alt={birthday.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined font-bold">person</span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">{birthday.name}</h3>
                        <p className="text-primary font-semibold text-sm">Próximo: {getDayMonth(birthday.date)}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="bg-primary/5 px-2 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-wider">
                        {days === 0 ? 'Hoje' : `Em ${days} dias`}
                    </div>
                    <button
                        onClick={handleDelete}
                        className="text-gray-400 hover:text-primary transition-colors p-1"
                        title="Excluir"
                    >
                        <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-gray-50 dark:border-zinc-800">
                {birthday.phone && (
                    <div className="flex items-center justify-between">
                        <a
                            href={`tel:${birthday.phone.replace(/\D/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm text-primary">call</span>
                            <span>{formatPhone(birthday.phone)}</span>
                        </a>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (days === 0) {
                                    showShareModal(birthday);
                                } else {
                                    window.open(`https://wa.me/${birthday.phone.replace(/\D/g, '')}`, '_blank');
                                }
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-[#25D366]/10 text-[#25D366] rounded-md text-[10px] font-bold uppercase transition-colors hover:bg-[#25D366]/20"
                        >
                            <svg className="size-3 fill-current" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.548 4.19 1.59 6.033L0 24l6.105-1.602a11.832 11.832 0 005.937 1.598h.005c6.637 0 12.032-5.395 12.035-12.03a11.762 11.762 0 00-3.489-8.492" />
                            </svg>
                            <span>WhatsApp</span>
                        </button>
                    </div>
                )}
                {birthday.email && (
                    <a
                        href={`mailto:${birthday.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm text-primary">mail</span>
                        <span>{birthday.email}</span>
                    </a>
                )}
            </div>
        </div>
    );
};

export default BirthdayListItem;
