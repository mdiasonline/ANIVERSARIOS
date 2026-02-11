import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAppContext } from '../App';
import { translateError } from '../utils';

const Auth: React.FC = () => {
  const { setCurrentView, showConfirm, hideConfirm } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        showConfirm({
          title: 'Cadastro Realizado!',
          message: 'Sua conta foi criada. Aguarde a aprovação do administrador para acessar o sistema.',
          confirmLabel: 'Entendi',
          onConfirm: hideConfirm,
          variant: 'info'
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      const errorMessage = translateError(error);

      showConfirm({
        title: 'Erro na Autenticação',
        message: errorMessage,
        confirmLabel: 'Tentar Novamente',
        onConfirm: hideConfirm,
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-[#2a2a2a] rounded-2xl shadow-xl border border-[#e5e7eb] dark:border-red-900/30">
        <h2 className="text-2xl font-bold mb-6 text-[#1a1a1a] dark:text-white text-center">
          {isSignUp ? 'Criar Conta' : 'Acessar Agenda'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#e5e7eb] dark:border-red-900/30 bg-transparent text-[#1a1a1a] dark:text-white outline-none focus:ring-2 focus:ring-primary"
              placeholder="exemplo@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
            <input
              type={isSignUp && showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#e5e7eb] dark:border-red-900/30 bg-transparent text-[#1a1a1a] dark:text-white outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </div>

          {isSignUp && (
            <div className="flex items-center my-2">
              <input
                id="show-password"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary accent-primary cursor-pointer"
              />
              <label htmlFor="show-password" className="ml-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                Mostrar senha
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Carregando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
          </button>
        </form >

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 text-sm text-primary hover:underline font-bold"
        >
          {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
        </button>

        {
          !isSignUp && (
            <button
              onClick={() => setCurrentView('RECOVERY')}
              className="w-full mt-2 text-xs text-gray-400 dark:text-gray-500 hover:text-primary transition-colors font-medium"
            >
              Esqueceu a senha?
            </button>
          )
        }
      </div >
    </div >
  );
};

export default Auth;