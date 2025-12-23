
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Announcement, Teacher } from '../types';
import { 
  Trophy, User as UserIcon, ShieldCheck, Zap, Cpu, Flame, 
  RefreshCw, Loader2, Award, CheckCircle, Star, ExternalLink, 
  Sparkles, Key, Crown, Banknote, CreditCard, Info, AlertTriangle,
  Check, Eye, EyeOff, Filter, QrCode, Copy
} from 'lucide-react';
import { getDailyMotivation } from '../services/geminiService';
import BJJBelt from './BJJBelt';
import Logo from './Logo';

interface StudentDashboardProps {
  user: User;
  announcements: Announcement[];
  onUpdateStudent: (updated: User) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, announcements, onUpdateStudent }) => {
  const OFFICIAL_PAYMENT_LINK = "https://buy.stripe.com/test_7sY8wQd2NcVgagTayNcs801";
  const [inspirationQuote, setInspirationQuote] = useState<string>("Sincronizando mente e técnica...");
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const [readAnnIds, setReadAnnIds] = useState<string[]>(() => {
    const stored = localStorage.getItem(`read_anns_${user.id}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [annFilter, setAnnFilter] = useState<'todos' | 'lidos' | 'nao-lidos'>('todos');

  useEffect(() => {
    localStorage.setItem(`read_anns_${user.id}`, JSON.stringify(readAnnIds));
  }, [readAnnIds, user.id]);

  const toggleRead = (id: string) => {
    setReadAnnIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredAnnouncements = useMemo(() => {
    const myAnns = announcements.filter(a => a.teacherId === user.teacherId);
    if (annFilter === 'lidos') return myAnns.filter(a => readAnnIds.includes(a.id));
    if (annFilter === 'nao-lidos') return myAnns.filter(a => !readAnnIds.includes(a.id));
    return myAnns;
  }, [announcements, user.teacherId, annFilter, readAnnIds]);

  const fetchInspiration = useCallback(async () => {
    setLoadingQuote(true);
    const text = await getDailyMotivation();
    setInspirationQuote(text);
    setLoadingQuote(false);
  }, []);

  useEffect(() => { 
    fetchInspiration(); 
    const storedTeachers: Teacher[] = JSON.parse(localStorage.getItem('bjj_teachers') || '[]');
    const myTeacher = storedTeachers.find(t => t.id === user.teacherId);
    if (myTeacher) setTeacherData(myTeacher);
  }, [fetchInspiration, user.teacherId]);

  const upgrades = [
    { id: 'up-1', title: 'Seminário Master', price: 'R$ 147,00', icon: <Trophy size={20} />, link: OFFICIAL_PAYMENT_LINK },
    { id: 'up-2', title: 'IA Análise', price: 'R$ 89,90/mês', icon: <Cpu size={20} />, link: OFFICIAL_PAYMENT_LINK },
    { id: 'up-3', title: 'Protocolo Força', price: 'R$ 59,00', icon: <Flame size={20} />, link: OFFICIAL_PAYMENT_LINK },
    { id: 'up-4', title: 'Psicologia BJJ', price: 'R$ 199,00', icon: <Zap size={20} />, link: OFFICIAL_PAYMENT_LINK }
  ];

  const handlePurchase = (id: string, link: string) => {
    setPurchasingId(id);
    window.open(link, '_blank');
    setTimeout(() => {
      const currentUpgrades = user.purchasedUpgrades || [];
      if (!currentUpgrades.includes(id)) {
        onUpdateStudent({ ...user, purchasedUpgrades: [...currentUpgrades, id] });
      }
      setPurchasingId(null);
      alert("Upgrade registrado no cloud federativo!");
    }, 2000);
  };

  const isUnpaid = user.paymentStatus === 'unpaid';

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-1000">
      
      {/* Notificação Proeminente de Pagamento Pendente */}
      {isUnpaid && (
        <section className="glass-card p-8 rounded-[3.5rem] border-red-500/50 bg-red-600/10 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-pulse border-2 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12"><AlertTriangle size={120} className="text-red-500" /></div>
          <div className="flex items-center gap-6 text-center md:text-left relative z-10">
            <div className="p-5 bg-red-600 rounded-3xl text-white shadow-2xl">
              <ShieldCheck size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">Mensalidade Pendente</h2>
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest mt-1">Regularize sua situação para manter o acesso ao tatame.</p>
            </div>
          </div>
          <div className="w-full md:w-auto relative z-10">
            <a 
              href={OFFICIAL_PAYMENT_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full md:w-auto px-12 py-6 bg-white text-black font-black rounded-[2rem] uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-2xl active:scale-95"
            >
              <CreditCard size={20} /> Regularizar Pagamento
            </a>
          </div>
        </section>
      )}

      {/* Inspiração IA */}
      <section className="glass-card p-12 rounded-[4rem] text-center border-white/5 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-6">
          <Flame size={40} className={`mx-auto text-yellow-500 ${loadingQuote ? 'animate-pulse' : ''}`} />
          <p className={`text-3xl md:text-5xl font-black italic tracking-tighter text-white transition-all duration-700 ${loadingQuote ? 'opacity-20 blur-sm scale-95' : 'opacity-100'}`}>
            "{inspirationQuote}"
          </p>
          <button onClick={fetchInspiration} disabled={loadingQuote} className="group mx-auto flex items-center gap-3 px-8 py-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 active:scale-95">
            {loadingQuote ? <Loader2 size={18} className="animate-spin text-yellow-500" /> : <Sparkles size={18} className="text-yellow-500" />}
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Nova Inspiração</span>
          </button>
        </div>
      </section>

      {/* Financeiro e Instruções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className={`glass-card p-10 rounded-[3.5rem] border-2 shadow-2xl relative overflow-hidden ${isUnpaid ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/20 bg-green-500/5'}`}>
          <Banknote size={100} className="absolute -right-4 -bottom-4 opacity-5 text-white" />
          <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3 mb-8"><CreditCard size={24} /> Financeiro</h3>
          <div className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className={`text-sm font-bold ${isUnpaid ? 'text-red-500' : 'text-green-500'}`}>R$</span>
              <span className="text-6xl font-black italic text-white">{(user.monthlyFee || 0).toFixed(2)}</span>
            </div>
            <div className={`text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-2xl border text-center ${user.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-600 text-white border-red-400 animate-pulse shadow-2xl'}`}>
              Status: {user.paymentStatus === 'paid' ? 'Em Dia' : 'DÉBITO DETECTADO'}
            </div>
          </div>
        </section>

        <section className="glass-card p-10 rounded-[3.5rem] border-indigo-500/20 bg-indigo-500/5 shadow-2xl relative">
          <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3 mb-6"><QrCode size={24} /> Como Pagar</h3>
          <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 min-h-[160px] flex flex-col justify-between">
            <p className="text-sm text-gray-300 font-medium whitespace-pre-wrap italic">
              {teacherData?.paymentInstructions || "Instruções do mestre em processamento..."}
            </p>
            {teacherData?.pixKey && (
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                 <div className="flex-1">
                   <p className="text-[9px] font-black uppercase text-indigo-400">Chave PIX do Mestre</p>
                   <p className="text-xs font-black text-white truncate">{teacherData.pixKey}</p>
                 </div>
                 <button onClick={() => { navigator.clipboard.writeText(teacherData.pixKey!); alert("Chave PIX copiada!"); }} className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-white hover:text-black transition-all shadow-xl">
                   <Copy size={16} />
                 </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Upgrades */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Marketplace Federativo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {upgrades.map(up => (
            <div key={up.id} className="glass-card p-8 rounded-[3rem] border-white/5 flex flex-col justify-between hover:border-yellow-500/30 transition-all shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-yellow-500 border border-white/10">{up.icon}</div>
                <h4 className="text-sm font-black uppercase italic text-white leading-tight">{up.title}</h4>
                <span className="text-lg font-black text-white">{up.price}</span>
              </div>
              <button onClick={() => handlePurchase(up.id, up.link)} disabled={!!purchasingId} className="w-full mt-8 py-4 bg-yellow-500 text-black rounded-2xl text-[9px] font-black uppercase hover:bg-white transition-all flex items-center justify-center gap-2 active:scale-95">
                {purchasingId === up.id ? <Loader2 size={12} className="animate-spin" /> : <><ExternalLink size={14}/> Comprar</>}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Perfil e Mural */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <section className="glass-card p-10 rounded-[4rem] text-center border-white/5 relative group shadow-2xl">
             <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
               <UserIcon size={40} className="text-yellow-500" />
             </div>
             <h3 className="text-xl font-black uppercase italic text-white tracking-tight">{user.name}</h3>
             <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] mb-8">Node: {user.id.slice(-6)}</p>
             <div className="space-y-4">
               <div className="relative px-2 py-4 rounded-3xl bg-white/5 border border-white/5 mb-6">
                 <BJJBelt belt={user.belt || 'Branca'} size="lg" className="mx-auto" />
               </div>
               <button onClick={() => setIsChangingPassword(!isChangingPassword)} className="w-full py-3 bg-white/5 rounded-2xl border border-white/5 text-[9px] font-black uppercase text-gray-500 hover:text-white transition-all">Alterar Senha Cloud</button>
             </div>
          </section>
        </div>

        <div className="lg:col-span-2">
           <div className="glass-card p-10 rounded-[4rem] border-white/5 min-h-[400px] flex flex-col shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3">
                  <ShieldCheck size={24} className="text-yellow-500" /> Mural Federativo
                </h3>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                  <button onClick={() => setAnnFilter('todos')} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${annFilter === 'todos' ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}>Todos</button>
                  <button onClick={() => setAnnFilter('nao-lidos')} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${annFilter === 'nao-lidos' ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}>Novos</button>
                </div>
              </div>
              <div className="space-y-4 flex-1">
                 {filteredAnnouncements.map(ann => (
                   <div key={ann.id} className={`p-8 bg-white/5 rounded-[3rem] border-l-4 transition-all shadow-lg group relative ${readAnnIds.includes(ann.id) ? 'border-green-500/40 opacity-50' : 'border-yellow-500'}`}>
                      <button onClick={() => toggleRead(ann.id)} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        {readAnnIds.includes(ann.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <p className="text-sm md:text-base italic text-gray-200 leading-relaxed font-medium">"{ann.content}"</p>
                      <div className="flex items-center gap-3 mt-6">
                        <div className="w-8 h-8 bg-yellow-500 text-black text-[10px] font-black flex items-center justify-center rounded-xl">{ann.authorName[0]}</div>
                        <p className="text-[10px] font-black uppercase text-white tracking-widest leading-none">{ann.authorName}</p>
                      </div>
                   </div>
                 ))}
                 {filteredAnnouncements.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-56 text-center opacity-20">
                      <Filter size={64} className="mb-4" />
                      <p className="text-[11px] text-gray-500 uppercase font-black tracking-[0.5em]">Sem novos comunicados</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
