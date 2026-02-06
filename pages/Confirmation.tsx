import React from 'react';
import { useAppContext } from '../App';

const Confirmation: React.FC = () => {
    const { setCurrentView, lastAddedBirthday } = useAppContext();

    const handleCopy = () => {
        if (lastAddedBirthday) {
            const jsonString = JSON.stringify(lastAddedBirthday, null, 2);
            navigator.clipboard.writeText(jsonString).then(() => {
                alert("JSON copiado para a área de transferência!");
            }).catch(() => {
                alert("Erro ao copiar.");
            });
        }
    };

    if (!lastAddedBirthday) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6 text-center">
                <p className="text-gray-500 mb-4">Nenhum registro recente encontrado.</p>
                <button
                    onClick={() => setCurrentView('HOME')}
                    className="text-primary font-bold hover:underline"
                >
                    Voltar ao Início
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen font-display bg-background-light dark:bg-background-dark h-full w-full overflow-x-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[5%] left-[-10%] w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

            <header className="flex items-center p-4 justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-gray-100 dark:border-white/5">
                <div className="w-12"></div>
                <h2 className="text-[#1a1a1a] dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
                    Sucesso
                </h2>
                <button
                    onClick={() => setCurrentView('HOME')}
                    className="text-primary font-bold text-sm cursor-pointer w-12 text-right hover:text-primary-hover"
                >
                    Fechar
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center px-6 pt-12 pb-20 w-full max-w-md mx-auto relative">
                {/* Festive Icon Container */}
                <div className="relative mb-10">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative w-28 h-28 bg-gradient-to-tr from-primary to-primary-hover rounded-full flex items-center justify-center shadow-xl shadow-primary/30 transform transition-transform hover:scale-110">
                        <span className="material-symbols-outlined text-white text-6xl animate-bounce">celebration</span>
                    </div>
                    {/* Floating particles (CSS dots) */}
                    <div className="absolute -top-2 -right-2 size-3 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="absolute top-10 -left-6 size-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="absolute -bottom-2 left-6 size-2.5 bg-green-400 rounded-full animate-bounce [animation-delay:0.5s]"></div>
                </div>

                <h1 className="text-3xl font-black text-gray-900 dark:text-white text-center mb-3 tracking-tight">
                    Tudo Pronto! 🎉
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-10 max-w-[280px] text-base leading-relaxed">
                    Você acaba de garantir que o dia de <span className="text-primary font-bold">{lastAddedBirthday.name}</span> não passará em branco.
                </p>

                {/* Technical Details Accordion-style */}
                <div className="w-full group">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Detalhes Técnicos</h3>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full border border-primary/10 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[14px]">content_copy</span>
                            <span className="text-[10px] font-bold uppercase">Copiar JSON</span>
                        </button>
                    </div>

                    <div className="w-full bg-white dark:bg-[#2a2a2a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden transition-all group-hover:shadow-md group-hover:border-primary/20">
                        <div className="p-4 bg-gray-50/30 dark:bg-black/10 overflow-x-auto max-h-40 beauty-scrollbar">
                            <pre className="font-mono text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                {JSON.stringify(lastAddedBirthday, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto pt-12 w-full flex flex-col gap-4">
                    <button
                        onClick={() => setCurrentView('ADD')}
                        className="group w-full h-15 bg-primary hover:bg-primary-hover text-white font-black text-base rounded-2xl shadow-xl shadow-primary/25 active:scale-[0.97] transition-all flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">add_circle</span>
                        Cadastrar Mais Um
                    </button>

                    <button
                        onClick={() => setCurrentView('HOME')}
                        className="w-full h-15 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold text-base rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl">home</span>
                        Ir para o Início
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Confirmation;