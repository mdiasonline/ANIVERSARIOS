import React, { useEffect, useState } from 'react';
import { useAppContext } from '../App';
import { supabase } from '../supabase';
import { User } from '../types';
import { formatPhone } from '../utils';
import BulkImportModal from '../components/BulkImportModal';

const Admin: React.FC = () => {
    const { setCurrentView, showConfirm, hideConfirm, user, birthdays, showShareModal } = useAppContext();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);


    const handleImportSuccess = () => {
        setShowImportModal(false);
        showConfirm({
            title: 'Sucesso',
            message: 'Importação concluída! Os aniversários foram adicionados.',
            confirmLabel: 'OK',
            onConfirm: hideConfirm,
            variant: 'info'
        });
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch profiles directly since auth.users is not accessible from client without specific policies
            // We are relying on the "Admins can view all profiles" policy we created
            const { data, error } = await supabase
                .from('user_profiles')
                .select(`
          id,
          email,
          full_name,
          avatar_url,
          role,
          approved,
          updated_at,
          created_at
        `);

            if (error) throw error;

            // Map to User type
            const mappedUsers: User[] = (data || []).map((profile: any) => ({
                id: profile.id,
                name: profile.full_name || profile.email?.split('@')[0] || 'Usuário',
                email: profile.email || '',
                avatar: profile.avatar_url,
                role: profile.role || 'user',
                approved: profile.approved,
                created_at: profile.created_at
            }));

            // Sort: Pending first, then Admins, then by created_at desc
            mappedUsers.sort((a, b) => {
                // 1. Pending priority: Pending < Approved (false < true)
                if (a.approved === false && b.approved !== false) return -1;
                if (a.approved !== false && b.approved === false) return 1;

                // 2. Role priority: Admin < User
                if (a.role === 'admin' && b.role !== 'admin') return -1;
                if (a.role !== 'admin' && b.role === 'admin') return 1;

                // 3. Date priority: Newest first
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            });

            setUsers(mappedUsers);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            showConfirm({
                title: 'Erro',
                message: 'Não foi possível carregar os usuários. Verifique se você é administrador.',
                confirmLabel: 'Voltar',
                onConfirm: () => {
                    hideConfirm();
                    setCurrentView('SETTINGS');
                },
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (targetUser: User) => {
        if (targetUser.email && targetUser.email.includes('mdias.online')) {
            showConfirm({
                title: 'Ação Bloqueada',
                message: 'Este usuário é um Super Admin e não pode ter suas permissões alteradas.',
                confirmLabel: 'OK',
                onConfirm: hideConfirm,
                variant: 'info'
            });
            return;
        }

        const newRole = targetUser.role === 'admin' ? 'user' : 'admin';

        showConfirm({
            title: 'Alterar Permissão',
            message: `Deseja alterar o acesso deste usuário para ${newRole === 'admin' ? 'Administrador' : 'Usuário Comum'}?`,
            confirmLabel: 'Sim, Alterar',
            cancelLabel: 'Cancelar',
            onConfirm: async () => {
                hideConfirm();
                try {
                    const { error } = await supabase
                        .from('user_profiles')
                        .update({ role: newRole })
                        .eq('id', targetUser.id);

                    if (error) throw error;

                    // Update local state
                    setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));

                    showConfirm({
                        title: 'Sucesso',
                        message: 'Permissão atualizada com sucesso.',
                        confirmLabel: 'OK',
                        onConfirm: hideConfirm,
                        variant: 'info'
                    });

                } catch (error: any) {
                    showConfirm({
                        title: 'Erro',
                        message: 'Não foi possível atualizar a permissão: ' + error.message,
                        confirmLabel: 'OK',
                        onConfirm: hideConfirm,
                        variant: 'danger'
                    });
                }
            },
            onCancel: hideConfirm
        });
    };


    const approveUser = async (targetUser: User) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ approved: true })
                .eq('id', targetUser.id);

            if (error) throw error;

            setUsers(users.map(u => u.id === targetUser.id ? { ...u, approved: true } : u));

            showConfirm({
                title: 'Sucesso',
                message: 'Usuário aprovado com sucesso!',
                confirmLabel: 'OK',
                onConfirm: hideConfirm,
                variant: 'info'
            });
        } catch (error: any) {
            console.error('Error approving user:', error);
            showConfirm({
                title: 'Erro',
                message: 'Erro ao aprovar usuário: ' + error.message,
                confirmLabel: 'OK',
                onConfirm: hideConfirm,
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const rejectUser = async (targetUser: User) => {
        showConfirm({
            title: 'Reprovar Usuário',
            message: `Tem certeza que deseja reprovar e remover o usuário ${targetUser.name}? Esta ação não pode ser desfeita.`,
            confirmLabel: 'Sim, Reprovar',
            cancelLabel: 'Cancelar',
            variant: 'danger',
            onConfirm: async () => {
                hideConfirm();
                setLoading(true);
                try {
                    const { error } = await supabase
                        .from('user_profiles')
                        .delete()
                        .eq('id', targetUser.id);

                    if (error) throw error;

                    setUsers(users.filter(u => u.id !== targetUser.id));

                    showConfirm({
                        title: 'Sucesso',
                        message: 'Usuário reprovado e removido com sucesso.',
                        confirmLabel: 'OK',
                        onConfirm: hideConfirm,
                        variant: 'info'
                    });
                } catch (error: any) {
                    console.error('Error rejecting user:', error);
                    showConfirm({
                        title: 'Erro',
                        message: 'Erro ao reprovar usuário: ' + error.message,
                        confirmLabel: 'OK',
                        onConfirm: hideConfirm,
                        variant: 'danger'
                    });
                } finally {
                    setLoading(false);
                }
            },
            onCancel: hideConfirm
        });
    };

    const handleTriggerEmail = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('send-birthday-email');

            if (error) throw error;

            console.log("Email output:", data);

            if (data?.error) {
                throw new Error(data.error);
            }

            let message = 'E-mail disparado com sucesso!';
            if (data?.message === "No birthdays today.") {
                message = 'O sistema verificou e **não há aniversariantes hoje**. Nenhum e-mail foi enviado.';
            } else if (data?.id) {
                message = 'E-mail enviado para os administradores com a lista de hoje!';
            }

            showConfirm({
                title: 'Disparo Manual',
                message: message,
                confirmLabel: 'OK',
                onConfirm: hideConfirm,
                variant: 'info'
            });

        } catch (error: any) {
            console.error('Error triggering email:', error);
            showConfirm({
                title: 'Erro',
                message: 'Falha ao disparar e-mail: ' + (error.message || 'Erro desconhecido'),
                confirmLabel: 'OK',
                onConfirm: hideConfirm,
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-display bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-40 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-100 dark:border-white/5">
                <div
                    onClick={() => setCurrentView('SETTINGS')}
                    className="flex size-12 shrink-0 items-center justify-start cursor-pointer group"
                >
                    <div className="size-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined text-primary text-[20px]">arrow_back_ios_new</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">admin_panel_settings</span>
                    <h2 className="text-[#1a1a1a] dark:text-white text-lg font-black uppercase tracking-tight">
                        Painel Admin
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <div
                        onClick={handleTriggerEmail}
                        className="flex size-10 shrink-0 items-center justify-center cursor-pointer group rounded-full hover:bg-primary/5 transition-colors"
                        title="Disparar E-mail Agora"
                    >
                        <span className="material-symbols-outlined text-primary text-xl">send</span>
                    </div>

                    <div
                        onClick={() => setShowImportModal(true)}
                        className="flex size-10 shrink-0 items-center justify-center cursor-pointer group rounded-full hover:bg-primary/5 transition-colors"
                        title="Importar CSV"
                    >
                        <span className="material-symbols-outlined text-primary text-xl">upload_file</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6">
                {showImportModal && (
                    <BulkImportModal
                        onClose={() => setShowImportModal(false)}
                        onSuccess={handleImportSuccess}
                    />
                )}
                <div className="mb-6">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Gerencie as permissões dos usuários do sistema.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {users.map(u => (
                            <div key={u.id} className="bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        {u.avatar ? (
                                            <img src={u.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <span className="material-symbols-outlined text-lg">person</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                                            {u.name}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${u.role === 'admin'
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'
                                                }`}>
                                                {u.role === 'admin' ? 'Admin' : 'Usuário'}
                                            </span>
                                            {u.approved === false && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500">
                                                    Pendente
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {u.approved === false && (
                                        <>
                                            <button
                                                onClick={() => approveUser(u)}
                                                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20"
                                            >
                                                Aprovar
                                            </button>
                                            <button
                                                onClick={() => rejectUser(u)}
                                                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
                                            >
                                                Reprovar
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => toggleRole(u)}
                                        // Prevent changing own role for safety in this simple demo
                                        disabled={u.id === user?.id || (u.email && u.email.includes('mdias.online'))}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${u.id === user?.id
                                            ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-white/5'
                                            : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
                                            }`}
                                    >
                                        {u.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {users.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                Nenhum usuário encontrado.
                            </div>
                        )}
                    </div>
                )}

                {/* Last Registered Birthdays Section */}
                <div className="mt-8 mb-6">
                    <h3 className="text-[#1a1a1a] dark:text-white text-lg font-black uppercase tracking-tight mb-4">
                        Últimos Cadastros
                    </h3>
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                        {birthdays && birthdays.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-white/5">
                                {[...birthdays]
                                    .sort((a, b) => {
                                        if (!a.created_at) return 1;
                                        if (!b.created_at) return -1;
                                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                    })
                                    .slice(0, 5)
                                    .map((birthday) => (
                                        <div key={birthday.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                                                    {birthday.photo_url ? (
                                                        <img src={birthday.photo_url} alt={birthday.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold">
                                                            {birthday.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {birthday.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <span>{birthday.phone ? formatPhone(birthday.phone) : 'Sem telefone'}</span>
                                                        <span>•</span>
                                                        <span>{birthday.date.split('-').reverse().join('/')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs text-gray-400">
                                                    {birthday.created_at ? new Date(birthday.created_at).toLocaleDateString('pt-BR') : '-'}
                                                </div>
                                                <button
                                                    onClick={() => showShareModal(birthday)}
                                                    className="size-8 flex items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                                                    title="Gerar Cartão"
                                                >
                                                    <span className="material-symbols-outlined text-lg">image</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                Nenhum aniversário cadastrado ainda.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Admin;
