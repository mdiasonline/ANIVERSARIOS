import React, { useState } from 'react';
import { useAppContext } from '../App';
import { supabase } from '../supabase';

const ResetPassword: React.FC = () => {
    const { setCurrentView, showConfirm, hideConfirm } = useAppContext();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            showConfirm({
                title: 'Senha Atualizada!',
                message: 'Sua senha foi alterada com sucesso. Você já está logado e pode usar o app normalmente.',
                confirmLabel: 'Ir para o Início',
                onConfirm: () => {
                    hideConfirm();
                    setCurrentView('HOME');
                },
                variant: 'info'
            });

        } catch (error: any) {
            console.error('Reset error:', error);
            showConfirm({
                title: 'Erro ao Atualizar',
                message: error.message || 'Não foi possível atualizar a senha. Tente novamente.',
                confirmLabel: 'Tentar Novamente',
                onConfirm: hideConfirm,
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-display bg-background-light dark:bg-background-dark max-w-md mx-auto relative overflow-x-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-5%] left-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none appearance-none"></div>

            {/* Header Standardized */}
            <header className="sticky top-0 z-40 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-100 dark:border-white/5">
                <div className="size-12"></div> {/* Spacer to center title */}

                <div className="flex items-center gap-2 flex-1 justify-center">
                    <div className="flex flex-col items-center scale-75">
                        <img src="/assets/cake_simple_red.png" alt="Bolo" className="size-8 object-contain" />
                        <span className="text-primary text-[7px] font-black uppercase leading-none">Aniversário</span>
                    </div>
                    <h2 className="text-[#1a1a1a] dark:text-white text-lg font-black uppercase tracking-tight ml-1">
                        Nova Senha
                    </h2>
                </div>

                <div className="size-12"></div>
            </header>

            <main className="flex-1 flex flex-col px-6 py-12 w-full relative">
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-primary/15 rounded-full blur-2xl animate-pulse"></div>
                        <div className="relative size-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl flex items-center justify-center border border-primary/10 rotate-3 shadow-inner">
                            <span className="material-symbols-outlined text-primary text-[48px] -rotate-3">lock_open</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-3 tracking-tight">
                        Redefinir Senha
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base text-center max-w-[240px] leading-relaxed">
                        Digite sua nova senha abaixo para recuperar o acesso.
                    </p>
                </div>

                <form className="space-y-8" onSubmit={handleReset}>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1" htmlFor="password">
                            Nova Senha
                        </label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-focus-within:text-primary transition-colors text-[20px]">
                                lock
                            </span>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full h-15 pl-12 pr-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-15 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.97] transition-all flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                <span>Salvando...</span>
                            </>
                        ) : (
                            <>
                                <span>Atualizar Senha</span>
                                <span className="material-symbols-outlined text-xl">check_circle</span>
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default ResetPassword;
