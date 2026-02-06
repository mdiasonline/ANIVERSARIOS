import React from 'react';
import { useAppContext } from '../App';
import { ViewState } from '../types';

const BottomNav: React.FC = () => {
  const { currentView, setCurrentView } = useAppContext();

  const getButtonClass = (view: ViewState) => {
    const isActive = currentView === view;
    return isActive
      ? "text-primary"
      : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300";
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-20 bg-white/80 dark:bg-[#1f1f1f]/90 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 px-8 flex justify-between items-center z-50">
      <button
        onClick={() => setCurrentView('HOME')}
        className={`flex flex-col items-center gap-1 transition-colors ${getButtonClass('HOME')}`}
      >
        <span className={`material-symbols-outlined ${currentView === 'HOME' ? 'fill-1' : ''}`}>home</span>
        <span className="text-[10px] font-bold">Início</span>
      </button>

      <button
        onClick={() => setCurrentView('LIST')}
        className={`flex flex-col items-center gap-1 transition-colors ${getButtonClass('LIST')}`}
      >
        <span className={`material-symbols-outlined ${currentView === 'LIST' ? 'fill-1' : ''}`}>group</span>
        <span className="text-[10px] font-bold">Contatos</span>
      </button>


      <button
        onClick={() => setCurrentView('ALERTS')}
        className={`flex flex-col items-center gap-1 transition-colors ${getButtonClass('ALERTS')}`}
      >
        <span className={`material-symbols-outlined ${currentView === 'ALERTS' ? 'fill-1' : ''}`}>notifications</span>
        <span className="text-[10px] font-bold">Alertas</span>
      </button>


      <button
        onClick={() => setCurrentView('SETTINGS')}
        className={`flex flex-col items-center gap-1 transition-colors ${getButtonClass('SETTINGS')}`}
      >
        <span className={`material-symbols-outlined ${currentView === 'SETTINGS' ? 'fill-1' : ''}`}>settings</span>
        <span className="text-[10px] font-bold">Ajustes</span>
      </button>
    </div>
  );
};

export default BottomNav;