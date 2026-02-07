import React, { useState, createContext, useContext, useEffect } from 'react';
import { Birthday, User, ViewState, AppContextType, ModalConfig } from './types';
import { translateError } from './utils';
import ShareBirthdayModal from './components/ShareBirthdayModal';

// Components
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import List from './pages/List';
import Add from './pages/Add';
import Auth from './pages/Auth';
import Recovery from './pages/Recovery';
import Confirmation from './pages/Confirmation';
import Details from './pages/Details';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import ConfirmModal from './components/ConfirmModal';
import Admin from './pages/Admin';

// Mock Data
const INITIAL_BIRTHDAYS: Birthday[] = [
  {
    id: '1',
    name: 'Maria Oliveira',
    date: '1995-05-12',
    phone: '(21) 91234-5678',
    email: 'maria.oliveira@provider.com',
    photo_url: 'https://picsum.photos/seed/maria/200',
    relation: 'Amiga'
  },
  {
    id: '2',
    name: 'Roberto Carlos',
    date: '1988-05-15',
    phone: '(11) 98765-4321',
    email: 'roberto.carlos@email.com',
    photo_url: 'https://picsum.photos/seed/roberto/200',
    relation: 'Primo'
  },
  {
    id: '3',
    name: 'Ana Fernandes',
    date: '2000-05-22',
    phone: '(31) 97777-8888',
    email: 'ana.fernandes@webmail.com',
    relation: 'Vizinha'
  },
  {
    id: '4',
    name: 'Lucas Lima',
    date: '1992-05-28',
    phone: '(41) 96666-5555',
    email: 'lucas.lima@email.com',
    photo_url: 'https://picsum.photos/seed/lucas/200',
    relation: 'Colega'
  },
  {
    id: '5',
    name: 'Pedro Sampaio',
    date: '1999-06-02',
    phone: '(51) 99999-1111',
    email: 'pedro.s@email.com',
    relation: 'Irmão'
  },
  {
    id: '6',
    name: 'Camila Rocha',
    date: '1994-06-05',
    phone: '(61) 98888-2222',
    email: 'camila.r@company.com',
    relation: 'Colega de Trabalho'
  },
  {
    id: '7',
    name: 'João Silva',
    date: '1990-08-15',
    phone: '(11) 98765-4321',
    email: 'joao.silva@email.com',
    relation: 'Primo'
  },
];

const MOCK_USER: User = {
  id: 'mock-user-id',
  name: 'João',
  email: 'joao@exemplo.com',
  avatar: 'https://picsum.photos/seed/user/200'
};

// Context
export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

import { supabase } from './supabase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('AUTH');
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [lastAddedBirthday, setLastAddedBirthday] = useState<Birthday | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBirthday, setSelectedBirthday] = useState<Birthday | null>(null);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });
  const [shareModalBirthday, setShareModalBirthday] = useState<Birthday | null>(null);

  const showShareModal = (birthday: Birthday) => {
    setShareModalBirthday(birthday);
  };

  const hideShareModal = () => {
    setShareModalBirthday(null);
  };

  const showConfirm = (config: Omit<ModalConfig, 'isOpen'>) => {
    setModalConfig({
      ...config,
      isOpen: true,
      onConfirm: () => {
        config.onConfirm();
        hideConfirm();
      },
      onCancel: () => {
        config.onCancel?.();
        hideConfirm();
      }
    });
  };

  const hideConfirm = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const savedView = sessionStorage.getItem('currentView');

    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Fetch user profile for avatar
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('avatar_url, role')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
          avatar: profile?.avatar_url || session.user.user_metadata.avatar_url,
          role: profile?.role as 'user' | 'admin' || 'user',
        });

        // Restore saved view if it was an internal app view, otherwise default to HOME
        const viewsRequiringAuth = ['HOME', 'LIST', 'ADD', 'EDIT', 'CONFIRMATION', 'DETAILS', 'ALERTS', 'SETTINGS', 'ADMIN'];
        if (savedView && viewsRequiringAuth.includes(savedView)) {
          setCurrentView(savedView as ViewState);
        } else {
          setCurrentView('HOME');
        }

        fetchBirthdays();
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // 1. Set minimal user immediately to unblock UI
        const basicUser: User = {
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url,
          role: 'user' // Default to user, update later
        };
        setUser(basicUser);

        // 2. Navigate immediately (Optimistic UI)
        setCurrentView(prev => (prev === 'AUTH' ? 'HOME' : prev));

        // 3. Kick off data fetching in parallel
        fetchBirthdays();

        // 4. Fetch full profile (avatar/role) in background
        supabase
          .from('user_profiles')
          .select('avatar_url, role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUser(prev => prev ? ({
                ...prev,
                avatar: profile.avatar_url || prev.avatar,
                role: (profile.role as 'user' | 'admin') || prev.role
              }) : null);
            }
          })
          .catch(err => console.error('Error fetching profile:', err));

      } else {
        setUser(null);
        setCurrentView('AUTH');
        setBirthdays([]);
        sessionStorage.removeItem('currentView');
        sessionStorage.removeItem('selectedBirthdayId');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync selectedBirthday from ID when birthdays list loads or changes
  useEffect(() => {
    const savedBirthdayId = sessionStorage.getItem('selectedBirthdayId');
    if (savedBirthdayId && birthdays.length > 0 && !selectedBirthday) {
      const found = birthdays.find(b => b.id === savedBirthdayId);
      if (found) setSelectedBirthday(found);
    }
  }, [birthdays, selectedBirthday]);

  // Persist currentView and selectedBirthday whenever they change
  useEffect(() => {
    if (currentView !== 'AUTH') {
      sessionStorage.setItem('currentView', currentView);
      if (currentView === 'DETAILS' && selectedBirthday) {
        sessionStorage.setItem('selectedBirthdayId', selectedBirthday.id);
      }
    }
  }, [currentView, selectedBirthday]);

  const fetchBirthdays = async () => {
    const { data, error } = await supabase
      .from('birthdays')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching birthdays:', error);
    } else if (data) {
      setBirthdays(data);
    }
  };

  const addBirthday = async (birthday: Omit<Birthday, 'id'>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('birthdays')
      .insert([birthday])
      .select()
      .single();

    if (error) {
      console.error('Error adding birthday:', error);
      alert('Erro ao salvar aniversário: ' + translateError(error));
      return false;
    }

    if (data) {
      setBirthdays((prev) => [...prev, data]);
      setLastAddedBirthday(data);
      return true;
    }
    return false;
  };

  const updateBirthday = async (id: string, updates: Partial<Birthday>): Promise<boolean> => {
    const { error } = await supabase
      .from('birthdays')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating birthday:', error);
      alert('Erro ao atualizar aniversário: ' + translateError(error));
      return false;
    }

    setBirthdays((prev) => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
    // Update selectedBirthday if it's the one being edited
    if (selectedBirthday?.id === id) {
      setSelectedBirthday((prev) => prev ? { ...prev, ...updates } : null);
    }
    return true;
  };

  const renderView = () => {
    switch (currentView) {
      case 'AUTH':
        return <Auth />;
      case 'HOME':
        return <Home />;
      case 'LIST':
        return <List />;
      case 'ADD':
        return <Add />;
      case 'EDIT':
        return <Add isEditing={true} />;
      case 'CONFIRMATION':
        return <Confirmation />;
      case 'RECOVERY':
        return <Recovery />;
      case 'DETAILS':
        return <Details />;
      case 'ALERTS':
        return <Alerts />;
      case 'SETTINGS':
        return <Settings />;
      case 'ADMIN':
        return <Admin />;
      default:
        return <Auth />;
    }
  };

  // Show bottom nav only on main authenticated pages
  const showBottomNav = ['HOME', 'LIST', 'ALERTS', 'SETTINGS'].includes(currentView);

  const deleteBirthday = async (id: string) => {
    const { error } = await supabase
      .from('birthdays')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting birthday:', error);
      return;
    }

    setBirthdays((prev) => prev.filter(b => b.id !== id));
    if (selectedBirthday?.id === id) {
      setSelectedBirthday(null);
      setCurrentView('LIST');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        birthdays,
        addBirthday,
        updateBirthday,
        deleteBirthday,
        lastAddedBirthday,
        user,
        setUser,
        searchTerm,
        setSearchTerm,
        selectedBirthday,
        setSelectedBirthday,
        showConfirm,
        hideConfirm,
        modalConfig,
        showShareModal,
        hideShareModal,
        shareModalBirthday,
      }}
    >
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col mx-auto max-w-md shadow-2xl overflow-hidden relative">
        <div className="flex-1 overflow-y-auto hide-scrollbar bg-background-light dark:bg-background-dark font-display pb-20">
          {renderView()}
        </div>
        {showBottomNav && <BottomNav />}
      </div>
      <ConfirmModal />
      {shareModalBirthday && (
        <ShareBirthdayModal
          birthday={shareModalBirthday}
          onClose={hideShareModal}
        />
      )}
    </AppContext.Provider>
  );
};

export default App;