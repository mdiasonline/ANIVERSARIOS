export interface Birthday {
  id: string;
  name: string;
  date: string; // ISO date string YYYY-MM-DD
  phone: string;
  email: string;
  photo_url?: string;
  relation?: string; // e.g., 'Irmão', 'Colega'
  created_by?: string;
  created_at?: string;
}

export interface User {
  id: string; // Supabase Auth ID
  name: string;
  email: string;
  avatar?: string;
  role?: 'user' | 'admin';
  approved?: boolean;
  created_at?: string;
}

export type ViewState = 'AUTH' | 'HOME' | 'LIST' | 'ADD' | 'EDIT' | 'CONFIRMATION' | 'RECOVERY' | 'DETAILS' | 'ALERTS' | 'SETTINGS' | 'ADMIN' | 'RESET_PASSWORD';

export interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'danger' | 'info';
}

export interface AppContextType {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  birthdays: Birthday[];
  addBirthday: (birthday: Omit<Birthday, 'id'>) => Promise<boolean>;
  updateBirthday: (id: string, birthday: Partial<Birthday>) => Promise<boolean>;
  deleteBirthday: (id: string) => Promise<void>;
  lastAddedBirthday: Birthday | null;
  user: User | null;
  setUser: (user: User | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedBirthday: Birthday | null;
  setSelectedBirthday: (birthday: Birthday | null) => void;
  showConfirm: (config: Omit<ModalConfig, 'isOpen'>) => void;
  hideConfirm: () => void;
  modalConfig: ModalConfig;
  showShareModal: (birthday: Birthday) => void;
  hideShareModal: () => void;
  shareModalBirthday: Birthday | null;
}