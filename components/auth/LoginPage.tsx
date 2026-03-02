
import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, ShieldCheck, Sun, Moon, Fingerprint, Command } from 'lucide-react';
import DockaLogo from '../common/DockaLogo';

interface LoginPageProps {
  onLogin: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, theme, onToggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-docka-50 dark:bg-zinc-950 text-docka-900 dark:text-zinc-100 font-sans p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px] dark:opacity-10"></div>
      </div>

      {/* Theme Toggle */}
      {onToggleTheme && (
        <button 
          onClick={onToggleTheme}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 text-docka-600 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-100 hover:border-docka-300 dark:hover:border-zinc-600 transition-all shadow-sm z-50"
          title={theme === 'dark' ? "Modo Claro" : "Modo Escuro"}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      )}

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Main Card */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 md:p-10 rounded-2xl border border-docka-200 dark:border-zinc-800 shadow-2xl shadow-docka-200/50 dark:shadow-black/50">
            
            {/* Brand Header */}
            <div className="text-center mb-8 flex flex-col items-center">
               <div className="text-docka-900 dark:text-zinc-100 mb-4">
                  <DockaLogo variant="icon" className="h-14 w-auto" />
               </div>
               <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">Docka Workspace</h1>
               <p className="text-sm text-docka-500 dark:text-zinc-400 mt-2">Entre para acessar seu ecossistema.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
               <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-docka-700 dark:text-zinc-300 uppercase tracking-wide">ID Corporativo</label>
                  <div className="relative group">
                     <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500 group-focus-within:text-docka-900 dark:group-focus-within:text-zinc-100 transition-colors" size={18} />
                     <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-docka-50 dark:bg-zinc-950 border border-docka-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-600 focus:ring-4 focus:ring-docka-100 dark:focus:ring-zinc-800 transition-all font-medium placeholder:text-docka-300 dark:placeholder:text-zinc-600 text-docka-900 dark:text-zinc-100"
                        placeholder="usuario@docka.io"
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-docka-700 dark:text-zinc-300 uppercase tracking-wide">Senha</label>
                      <a href="#" className="text-xs text-docka-500 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-300 hover:underline">Esqueceu?</a>
                  </div>
                  <div className="relative group">
                     <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500 group-focus-within:text-docka-900 dark:group-focus-within:text-zinc-100 transition-colors" size={18} />
                     <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-docka-50 dark:bg-zinc-950 border border-docka-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-600 focus:ring-4 focus:ring-docka-100 dark:focus:ring-zinc-800 transition-all font-medium placeholder:text-docka-300 dark:placeholder:text-zinc-600 text-docka-900 dark:text-zinc-100"
                        placeholder="••••••••"
                     />
                  </div>
               </div>

               <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-xl text-sm font-bold hover:bg-black dark:hover:bg-white/90 flex items-center justify-center gap-2 shadow-lg shadow-docka-900/10 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-2 group"
               >
                  {isLoading ? (
                     <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                  ) : (
                     <>Acessar Workspace <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>
                  )}
               </button>
            </form>

            {/* SSO / Divider */}
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-docka-100 dark:border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-zinc-900 px-2 text-docka-400 dark:text-zinc-600 font-semibold tracking-wider">Ou continue com</span>
                </div>
            </div>

            <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-docka-200 dark:border-zinc-800 rounded-xl hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-zinc-950 text-docka-700 dark:text-zinc-300 text-sm font-medium">
                    <Fingerprint size={18} /> SSO
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-docka-200 dark:border-zinc-800 rounded-xl hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-zinc-950 text-docka-700 dark:text-zinc-300 text-sm font-medium">
                    <ShieldCheck size={18} /> 2FA
                </button>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-6 text-[11px] text-docka-400 dark:text-zinc-600 font-medium">
               <a href="#" className="hover:text-docka-900 dark:hover:text-zinc-300 transition-colors">Política de Privacidade</a>
               <a href="#" className="hover:text-docka-900 dark:hover:text-zinc-300 transition-colors">Termos de Serviço</a>
               <a href="#" className="hover:text-docka-900 dark:hover:text-zinc-300 transition-colors">Status</a>
            </div>
            <p className="text-[10px] text-docka-300 dark:text-zinc-700 mt-4 font-mono">
               Docka Workspace v2.5.0 • Build 8921
            </p>
        </div>

      </div>
      
      {/* Keyboard Shortcut Hint */}
      <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 text-[10px] text-docka-400 dark:text-zinc-600 opacity-50 bg-docka-100/50 dark:bg-zinc-900/50 px-2 py-1 rounded-md border border-docka-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
          <Command size={10} /> + L to Focus
      </div>

    </div>
  );
};

export default LoginPage;
