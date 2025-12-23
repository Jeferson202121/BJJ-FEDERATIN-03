
import React, { useState } from 'react';
import { User, Teacher } from '../types';
import { Eye, EyeOff, ChevronRight, RefreshCw, Mail, ShieldCheck, ArrowLeft, Loader2, Cloud, Info, AlertCircle } from 'lucide-react';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'login' | 'verify_pending'>('login');
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Login ADM Master
      if (normalizedEmail === 'jefersoncarvalho252@gmail.com' && password === 'ben150718') {
        onLogin({ id: 'admin-1', name: 'Jeferson Carvalho', email: normalizedEmail, role: 'ADM', status: 'active', paymentStatus: 'paid', isVerified: true });
        return;
      }

      // Busca nos dados locais do dispositivo
      const storedTeachers: Teacher[] = JSON.parse(localStorage.getItem('bjj_teachers') || '[]');
      const storedStudents: User[] = JSON.parse(localStorage.getItem('bjj_students') || '[]');
      const foundUser = [...storedTeachers, ...storedStudents].find(u => u.email.toLowerCase().trim() === normalizedEmail);

      if (foundUser && foundUser.password === password) {
        if (foundUser.isVerified === false) {
          setPendingUser(foundUser);
          setView('verify_pending');
        } else {
          onLogin(foundUser);
        }
      } else {
        alert('USUÁRIO NÃO ENCONTRADO NESTE DISPOSITIVO.\n\nNota: Como este é um protótipo, os dados ficam salvos apenas no aparelho onde foram criados. Se o professor te cadastrou em outro celular, os dados não aparecerão aqui automaticamente.');
        setIsLoading(false);
      }
    }, 1500); 
  };

  const handleConfirmVerification = () => {
    if (!pendingUser) return;
    setIsLoading(true);
    setTimeout(() => {
      const storedTeachers: Teacher[] = JSON.parse(localStorage.getItem('bjj_teachers') || '[]');
      const storedStudents: User[] = JSON.parse(localStorage.getItem('bjj_students') || '[]');
      const updatedUser = { ...pendingUser, isVerified: true };

      if (pendingUser.role === 'PROFESSOR') {
        localStorage.setItem('bjj_teachers', JSON.stringify(storedTeachers.map(t => t.id === pendingUser.id ? { ...t, isVerified: true } : t)));
      } else {
        localStorage.setItem('bjj_students', JSON.stringify(storedStudents.map(s => s.id === pendingUser.id ? { ...s, isVerified: true } : s)));
      }
      onLogin(updatedUser);
      setIsLoading(false);
    }, 1500);
  };

  if (view === 'verify_pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-yellow-500/5 blur-[100px]"></div>
        <div className="max-w-md w-full glass-card p-12 md:p-16 rounded-[4rem] text-center space-y-10 border-yellow-500/20 shadow-2xl relative z-10 animate-in zoom-in duration-500">
          <div className="bg-yellow-500/10 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse text-yellow-500 border border-yellow-500/10 shadow-[0_0_30px_rgba(234,179,8,0.2)]"><Mail size={48} /></div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Verificação Cloud</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">Confirme seu e-mail para acesso neural:<br/><span className="text-yellow-500 block mt-3 lowercase font-bold tracking-normal text-sm">{pendingUser?.email}</span></p>
          </div>
          <div className="space-y-4">
            <button onClick={handleConfirmVerification} disabled={isLoading} className="w-full bg-white hover:bg-yellow-500 text-black font-black py-6 rounded-2xl flex items-center justify-center gap-4 uppercase text-[10px] tracking-widest transition-all h-[75px] shadow-xl active:scale-95">
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
              {isLoading ? 'Autenticando...' : 'Confirmar Verificação'}
            </button>
            <button onClick={() => alert('Token reenviado para o seu e-mail Cloud.')} className="w-full text-gray-500 hover:text-white font-black text-[9px] uppercase tracking-widest transition-colors">Reenviar Link de Ativação</button>
          </div>
          <button onClick={() => setView('login')} className="flex items-center gap-2 mx-auto text-gray-700 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"><ArrowLeft size={14}/> Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-md w-full space-y-12 relative z-10">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top duration-1000">
          <Logo size={100} />
          <h1 className="text-6xl font-black italic tracking-tighter text-white">BJJ <span className="text-yellow-500">PRO</span></h1>
          <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             Google Cloud Federation
          </p>
        </div>

        <div className="glass-card p-10 md:p-12 rounded-[3.5rem] space-y-8 shadow-2xl border-white/10 animate-in zoom-in duration-700">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-500 uppercase ml-4 tracking-widest">Login Federativo</label>
               <input type="email" placeholder="nome@academia.com" className="w-full py-5 px-8 rounded-2xl outline-none text-white bg-white/5 border border-white/10 focus:border-yellow-500 transition-all font-medium placeholder:text-gray-700" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1 relative">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-4 tracking-widest">Senha</label>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full py-5 px-8 rounded-2xl outline-none text-white bg-white/5 border border-white/10 focus:border-yellow-500 transition-all tracking-[0.3em] font-medium" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-[44px] text-gray-600 hover:text-yellow-500 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full bg-white hover:bg-yellow-500 text-black font-black py-6 rounded-2xl uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-4 h-[80px] shadow-2xl transition-all group mt-6 active:scale-95 ${isLoading ? 'animate-pulse opacity-80 cursor-not-allowed scale-[0.98]' : 'hover:scale-[1.02]'}`}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <RefreshCw className="animate-spin" size={24} />
                  <span>Sincronizando...</span>
                </div>
              ) : (
                <>
                  <span>Entrar no Tatame Federativo</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-start gap-3 p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">
            <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">
              Dica: Verifique se o e-mail está correto. Novos cadastros requerem confirmação na primeira tela de acesso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
