import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import { supabase } from '../supabase';

const Settings: React.FC = () => {
    const { user, setUser, setCurrentView, showConfirm, hideConfirm } = useAppContext();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);

    // Refs for different inputs
    const fileInputGalleryRef = useRef<HTMLInputElement>(null);
    const fileInputCameraRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Check current theme from document
        const darkMode = document.documentElement.classList.contains('dark');
        setIsDarkMode(darkMode);
    }, []);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowPhotoOptions(false); // Close modal

        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showConfirm({
                    title: 'Arquivo Muito Grande',
                    message: 'A foto deve ter no máximo 5MB.',
                    confirmLabel: 'Entendi',
                    onConfirm: hideConfirm,
                    variant: 'info'
                });
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showConfirm({
                    title: 'Formato Inválido',
                    message: 'Por favor, selecione um arquivo de imagem válido.',
                    confirmLabel: 'Entendi',
                    onConfirm: hideConfirm,
                    variant: 'info'
                });
                return;
            }

            setSelectedPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Auto-upload after selection
            uploadPhoto(file);
        }
    };

    const uploadPhoto = async (file: File) => {
        if (!user?.id) return;

        setUploading(true);
        try {
            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/avatar.${fileExt}`;
            const timestamp = new Date().getTime(); // Add timestamp to bypass cache

            // Delete old photo if exists
            const { data: existingFiles } = await supabase.storage
                .from('profile-photos')
                .list(user.id);

            if (existingFiles && existingFiles.length > 0) {
                await supabase.storage
                    .from('profile-photos')
                    .remove(existingFiles.map(f => `${user.id}/${f.name}`));
            }

            // Upload new photo
            const { error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL with timestamp cache buster
            const { data: { publicUrl } } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(fileName);

            const publicUrlWithTimestamp = `${publicUrl}?t=${timestamp}`;

            // Update user profile table
            const { error: updateError } = await supabase
                .from('user_profiles')
                .upsert({
                    id: user.id,
                    avatar_url: publicUrlWithTimestamp,
                    updated_at: new Date().toISOString()
                });

            if (updateError) throw updateError;

            // Update local state IMMEDIATELY
            setUser({
                ...user,
                avatar: publicUrlWithTimestamp
            });

            showConfirm({
                title: 'Sucesso!',
                message: 'Sua foto de perfil foi atualizada.',
                confirmLabel: 'Ótimo',
                onConfirm: hideConfirm,
                variant: 'info'
            });

        } catch (error) {
            console.error('Error uploading photo:', error);
            showConfirm({
                title: 'Erro no Upload',
                message: 'Não foi possível atualizar sua foto. Por favor, tente novamente.',
                confirmLabel: 'Fechar',
                onConfirm: hideConfirm,
                variant: 'danger'
            });
            setPhotoPreview(null); // Reset preview on error
        } finally {
            setUploading(false);
            // DO NOT RELOAD PAGE
        }
    };

    const toggleTheme = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        // The auth state change listener in App.tsx will handle navigation
    };

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark font-display">
            {/* Header */}
            <header className="flex-none bg-primary text-white shadow-md z-50">
                <div className="flex items-center p-4 h-16 max-w-lg mx-auto">
                    <button onClick={() => setCurrentView('HOME')} className="flex-none text-white/80 hover:text-white">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <h1 className="flex-1 text-center text-lg font-bold tracking-tight">Ajustes</h1>
                    <div className="flex-none w-6"></div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto pb-24">
                <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

                    {/* Profile Section */}
                    <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary text-xl">person</span>
                            <h2 className="text-[#1a1a1a] dark:text-white text-lg font-bold">Perfil</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                {/* Hidden file inputs */}
                                <input
                                    ref={fileInputGalleryRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />
                                <input
                                    ref={fileInputCameraRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />

                                {/* Clickable Avatar */}
                                <div
                                    onClick={() => setShowPhotoOptions(true)}
                                    className="relative cursor-pointer group"
                                >
                                    {photoPreview || user?.avatar ? (
                                        <div
                                            className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-primary/20 group-hover:border-primary transition-colors"
                                            style={{ backgroundImage: `url("${photoPreview || user.avatar}")` }}
                                        >
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white animate-spin">progress_activity</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 group-hover:border-primary transition-colors">
                                            <span className="material-symbols-outlined text-primary text-3xl">account_circle</span>
                                        </div>
                                    )}

                                    {/* Camera icon overlay */}
                                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-white dark:border-[#2a2a2a] group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-white text-sm">photo_camera</span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <p className="text-[#1a1a1a] dark:text-white font-bold text-base">
                                        {user?.name || 'Usuário'}
                                        <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${user?.role === 'admin'
                                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'
                                            }`}>
                                            {user?.role === 'admin' ? 'Admin' : 'Usuário'}
                                        </span>
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email || 'email@exemplo.com'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Photo Source Selection Modal */}
                    {showPhotoOptions && (
                        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[4px]"
                                onClick={() => setShowPhotoOptions(false)}
                            ></div>

                            {/* Modal Content */}
                            <div className="relative w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl border-t sm:border border-gray-100 dark:border-white/5 overflow-hidden animate-in slide-in-from-bottom-full duration-300">
                                <div className="p-6">
                                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 sm:hidden"></div>

                                    <h3 className="text-lg font-bold text-center text-[#1a1a1a] dark:text-white mb-6">
                                        Alterar Foto de Perfil
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => fileInputCameraRef.current?.click()}
                                            className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20 border-2 border-primary/20 hover:border-primary/50 transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-transform">
                                                <span className="material-symbols-outlined text-2xl">photo_camera</span>
                                            </div>
                                            <span className="font-bold text-primary text-sm">Tirar Foto</span>
                                        </button>

                                        <button
                                            onClick={() => fileInputGalleryRef.current?.click()}
                                            className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 border-2 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-lg group-active:scale-95 transition-transform">
                                                <span className="material-symbols-outlined text-2xl">photo_library</span>
                                            </div>
                                            <span className="font-bold text-gray-600 dark:text-gray-300 text-sm">Galeria</span>
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setShowPhotoOptions(false)}
                                        className="w-full mt-6 py-4 rounded-xl font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Section */}
                    <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary text-xl">palette</span>
                            <h2 className="text-[#1a1a1a] dark:text-white text-lg font-bold">Aparência</h2>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                                        {isDarkMode ? 'dark_mode' : 'light_mode'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[#1a1a1a] dark:text-white font-semibold text-sm">Tema Escuro</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">Alternar entre claro e escuro</p>
                                </div>
                            </div>

                            <button
                                onClick={toggleTheme}
                                className={`relative w-14 h-8 rounded-full transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-300'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary text-xl">info</span>
                            <h2 className="text-[#1a1a1a] dark:text-white text-lg font-bold">Sobre</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">Versão</span>
                                <span className="text-[#1a1a1a] dark:text-white font-semibold text-sm">1.0.0</span>
                            </div>
                            <div className="border-t border-gray-100 dark:border-white/5"></div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">Desenvolvido por</span>
                                <span className="text-[#1a1a1a] dark:text-white font-semibold text-sm">Maycon Dias</span>
                            </div>
                            <div className="border-t border-gray-100 dark:border-white/5"></div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400 text-sm">Contato</span>
                                <a
                                    href="https://wa.me/5521988079174"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">chat</span>
                                    <span className="font-semibold text-sm">WhatsApp</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Admin Panel Button - Only if user is ADMIN */}
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setCurrentView('ADMIN')}
                            className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#2a2a2a] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 active:scale-[0.98] transition-all group mb-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">admin_panel_settings</span>
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm font-bold text-gray-900 dark:text-white">Painel Admin</span>
                                    <span className="text-xs text-blue-500 font-medium">Gerenciar usuários (apenas você vê)</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">chevron_right</span>
                        </button>
                    )}

                    {/* Sign Out Button */}
                    <button
                        onClick={handleSignOut}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 flex items-center justify-center gap-2 font-bold transition-colors border border-red-500/20"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Sair da Conta
                    </button>

                    {/* Footer */}
                    <div className="text-center py-4">
                        <p className="text-gray-400 dark:text-gray-500 text-xs">
                            © 2026 Aniversários. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
