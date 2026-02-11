import React from 'react';
import { supabase } from '../supabase';

const PendingApproval: React.FC = () => {
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background-light dark:bg-background-dark text-center animate-fade-in">
            <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-3xl shadow-xl max-w-sm w-full border border-gray-100 dark:border-white/5">
                <div className="size-20 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl text-yellow-600 dark:text-yellow-500">
                        hourglass_top
                    </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Aguardando Aprovação
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Seu cadastro foi realizado com sucesso! <br />
                    Para acessar o sistema, aguarde a liberação de um administrador.
                </p>

                <button
                    onClick={handleLogout}
                    className="w-full py-3 px-6 rounded-xl font-bold text-gray-700 dark:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                    Sair e Tentar Novamente
                </button>
            </div>

            <p className="mt-8 text-xs text-gray-400">
                Entre em contato com o suporte se precisar de ajuda.
            </p>
        </div>
    );
};

export default PendingApproval;
