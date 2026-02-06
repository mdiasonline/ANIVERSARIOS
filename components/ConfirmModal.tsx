import React from 'react';
import { useAppContext } from '../App';

const ConfirmModal: React.FC = () => {
    const { modalConfig } = useAppContext();
    const { isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant } = modalConfig;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[4px]"
                onClick={onCancel}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="p-8 flex flex-col items-center text-center">
                    {/* Icon Header */}
                    <div className={`size-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner ${variant === 'danger'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                        : 'bg-primary/10 dark:bg-primary/20 text-primary'
                        }`}>
                        <span className="material-symbols-outlined text-[40px]">
                            {variant === 'danger' ? 'delete_forever' : 'info'}
                        </span>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">
                        {title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={onConfirm}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-wider text-white shadow-xl transition-all active:scale-[0.97] ${variant === 'danger'
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                : 'bg-primary hover:bg-primary-hover shadow-primary/20'
                                }`}
                        >
                            {confirmLabel || 'Confirmar'}
                        </button>
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="w-full py-4 rounded-2xl font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase text-sm tracking-widest"
                            >
                                {cancelLabel || 'Cancelar'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
                    <span className="material-symbols-outlined text-6xl">celebration</span>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
