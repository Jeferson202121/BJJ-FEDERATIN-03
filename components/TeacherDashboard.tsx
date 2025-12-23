
import React, { useState, useMemo } from 'react';
import { User, Teacher, Announcement } from '../types';
import { 
  PlusCircle, GraduationCap, Pause, Play, Award, Loader2, Send, 
  Megaphone, Bell, Users, LayoutDashboard, Trash2, Lock, 
  DollarSign, Wallet, Banknote, Save, AlertTriangle, Crown, 
  ShieldAlert, Clock, CheckCircle, Share2, MessageCircle, Mail, X, UserPlus,
  ExternalLink, CreditCard, Settings, Link, Globe, ShieldCheck, Copy, QrCode,
  Info, Zap, Database, ShieldX, Check
} from 'lucide-react';
import { moderateAnnouncement } from '../services/geminiService';
import BJJBelt from './BJJBelt';

interface TeacherDashboardProps {
  user: Teacher;
  students: User[];
  setStudents: React.Dispatch<React.SetStateAction<User[]>>;
  announcements: Announcement[];
  onAddAnnouncement: (ann: Announcement) => void;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  onToggleStudentStatus: (id: string) => void;
  onDeleteStudent: (id: string) => void;
  onUpdateStudent: (updated: User) => void;
  federationPixKey?: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  user, students, setStudents, onToggleStudentStatus, onDeleteStudent, announcements, onAddAnnouncement, setTeachers, federationPixKey
}) => {
  const [activeTab, setActiveTab] = useState<'inicio' | 'alunos' | 'avisos' | 'financeiro'>('inicio');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para o Aluno recém-criado (Sucesso na Matrícula)
  const [lastCreatedStudent, setLastCreatedStudent] = useState<User | null>(null);

  // Estados para Exclusão Segura
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  // Estados do Novo Aluno
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentBelt, setNewStudentBelt] = useState('Branca');
  const [newStudentFee, setNewStudentFee] = useState<number>(0);

  const [paymentInstructions, setPaymentInstructions] = useState(user.paymentInstructions || '');
  const [pixKey, setPixKey] = useState(user.pixKey || '');

  const teacherStudents = students.filter(s => s.teacherId === user.id);
  const currentUsage = teacherStudents.length;
  const isPremium = user.plan === 'premium';
  const studentLimit = isPremium ? 50 : 10;
  const usagePercentage = Math.min((currentUsage / studentLimit) * 100, 100);
  
  const totalMonthlyRevenue = teacherStudents.reduce((acc, curr) => acc + (curr.monthlyFee || 0), 0);

  const beltOptions = [
    "Branca",
    "Cinza/Branca", "Cinza", "Cinza/Preta",
    "Amarela/Branca", "Amarela", "Amarela/Preta",
    "Laranja/Branca", "Laranja", "Laranja/Preta",
    "Verde/Branca", "Verde", "Verde/Preta",
    "Azul", "Roxa", "Marrom", "Preta"
  ];

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUsage >= studentLimit) {
      alert("LIMITE DE COTA ATINGIDO! Faça upgrade para o Plano Premium.");
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newStudent: User = {
      id: `s-${Date.now()}`, 
      name: newStudentName, 
      email: newStudentEmail.toLowerCase().trim(),
      phone: newStudentPhone,
      password: newStudentPassword || '123456',
      role: 'ALUNO', 
      status: 'active', 
      teacherId: user.id,
      belt: newStudentBelt, 
      paymentStatus: 'paid', 
      monthlyFee: newStudentFee,
      isVerified: false
    };

    setStudents(prev => [...prev, newStudent]);
    setIsSubmitting(false);
    setIsAddModalOpen(false);
    
    // Abrir tela de sucesso com opções de envio
    setLastCreatedStudent(newStudent);
    
    // Limpar formulário
    setNewStudentName(''); setNewStudentEmail(''); setNewStudentPhone(''); setNewStudentPassword(''); setNewStudentFee(0);
  };

  const shareViaWhatsApp = (student: User) => {
    const cleanPhone = student.phone?.replace(/\D/g, '');
    const message = encodeURIComponent(
      `🥋 *MATRÍCULA BJJ PRO - ${user.name.toUpperCase()}*\n\n` +
      `Olá *${student.name}*, sua matrícula foi realizada com sucesso!\n\n` +
      `*DADOS DE ACESSO AO APP:*\n` +
      `📧 E-mail: ${student.email}\n` +
      `🔑 Senha: ${student.password}\n\n` +
      `Acesse agora para acompanhar seus treinos e graduações!`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const shareViaEmail = (student: User) => {
    const subject = encodeURIComponent("Sua Matrícula no BJJ PRO");
    const body = encodeURIComponent(
      `Olá ${student.name},\n\n` +
      `Sua matrícula foi realizada pelo Mestre ${user.name}.\n\n` +
      `Seus dados para acessar o sistema são:\n` +
      `Login: ${student.email}\n` +
      `Senha: ${student.password}\n\n` +
      `Oss!`
    );
    window.location.href = `mailto:${student.email}?subject=${subject}&body=${body}`;
  };

  const handleConfirmSecureDelete = () => {
    if (!deleteConfirm) return;
    if (deletePassword === '26') {
      onDeleteStudent(deleteConfirm.id);
      setDeleteConfirm(null);
      setDeletePassword('');
      alert("Atleta removido com sucesso.");
    } else {
      alert("CÓDIGO DE AUTORIZAÇÃO INCORRETO!");
    }
  };

  const handleSavePaymentConfig = () => {
    setTeachers(prev => prev.map(t => t.id === user.id ? { ...t, paymentInstructions, pixKey } : t));
    alert("Dados Financeiros Atualizados!");
  };

  const handleCopyFedPix = () => {
    if (federationPixKey) {
      navigator.clipboard.writeText(federationPixKey);
      alert("Chave PIX da Federação copiada!");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Modal de Sucesso na Matrícula (Compartilhamento) */}
      {lastCreatedStudent && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => setLastCreatedStudent(null)}></div>
          <div className="glass-card w-full max-w-lg rounded-[4rem] p-12 border-green-500/30 relative z-10 shadow-[0_0_150px_rgba(34,197,94,0.15)] animate-in zoom-in duration-500 text-center">
            <div className="bg-green-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)] animate-bounce">
              <CheckCircle size={56} className="text-green-500" />
            </div>
            <div className="space-y-4 mb-10">
              <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">Atleta Matriculado!</h2>
              <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.3em]">Instância Cloud provisionada com sucesso.</p>
            </div>

            <div className="bg-white/5 rounded-3xl p-8 mb-10 border border-white/5 space-y-4 text-left">
               <div className="flex justify-between items-center border-b border-white/5 pb-3">
                 <span className="text-[9px] font-black uppercase text-gray-500">Atleta</span>
                 <span className="text-xs font-black text-white italic">{lastCreatedStudent.name}</span>
               </div>
               <div className="flex justify-between items-center border-b border-white/5 pb-3">
                 <span className="text-[9px] font-black uppercase text-gray-500">E-mail</span>
                 <span className="text-xs font-black text-indigo-400">{lastCreatedStudent.email}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[9px] font-black uppercase text-gray-500">Senha Padrão</span>
                 <span className="text-xs font-black text-yellow-500 tracking-widest">{lastCreatedStudent.password}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => shareViaWhatsApp(lastCreatedStudent)}
                className="w-full py-5 bg-[#25D366] text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-green-600/20 active:scale-95"
              >
                <MessageCircle size={20} /> Enviar para WhatsApp
              </button>
              <button 
                onClick={() => shareViaEmail(lastCreatedStudent)}
                className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl active:scale-95"
              >
                <Mail size={20} /> Enviar para E-mail
              </button>
              <button 
                onClick={() => setLastCreatedStudent(null)}
                className="mt-4 text-[9px] font-black uppercase text-gray-600 hover:text-white transition-colors tracking-widest"
              >
                Fechar e Voltar ao Painel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão Segura (Professor) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => { setDeleteConfirm(null); setDeletePassword(''); }}></div>
          <div className="glass-card w-full max-w-md rounded-[3rem] p-10 border-red-500/30 relative z-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center space-y-6">
              <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <ShieldX size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic text-white">Encerrar Matrícula</h2>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-2 px-4 leading-relaxed">
                  Você está prestes a remover permanentemente <span className="text-white">{deleteConfirm.name}</span> do sistema.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-gray-600 tracking-widest block text-left ml-4">Código de Autorização Professor</label>
                <input 
                  type="password" 
                  className="w-full p-5 rounded-2xl outline-none bg-white/5 border border-white/10 text-white font-black text-center tracking-[1em] focus:border-red-500 transition-all"
                  placeholder="**"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleConfirmSecureDelete} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl uppercase text-[10px] hover:bg-red-500 transition-all shadow-xl shadow-red-600/20 active:scale-95">Confirmar Exclusão</button>
                <button onClick={() => { setDeleteConfirm(null); setDeletePassword(''); }} className="px-6 py-4 bg-white/5 text-gray-400 rounded-2xl uppercase text-[10px] hover:text-white transition-all">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Matrícula */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => !isSubmitting && setIsAddModalOpen(false)}></div>
          <div className="glass-card w-full max-w-2xl rounded-[3rem] p-10 border-indigo-500/30 relative z-10 shadow-[0_0_100px_rgba(79,70,229,0.15)] animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">Matricular Atleta</h2>
                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Sincronizando novo atleta com a rede {user.name.split(' ')[0].toUpperCase()}</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-500 ml-4 tracking-widest">Nome do Atleta</label>
                <input className="w-full p-5 rounded-2xl outline-none" placeholder="Ex: Rickson Gracie" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} required disabled={isSubmitting} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-500 ml-4 tracking-widest">E-mail (Acesso)</label>
                <input className="w-full p-5 rounded-2xl outline-none" type="email" placeholder="atleta@tatame.com" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} required disabled={isSubmitting} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-500 ml-4 tracking-widest">WhatsApp (DDD + Número)</label>
                <input className="w-full p-5 rounded-2xl outline-none" placeholder="Ex: 21999999999" value={newStudentPhone} onChange={e => setNewStudentPhone(e.target.value)} disabled={isSubmitting} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-500 ml-4 tracking-widest">Senha de Acesso</label>
                <input className="w-full p-5 rounded-2xl outline-none" type="password" placeholder="Mínimo 6 dígitos" value={newStudentPassword} onChange={e => setNewStudentPassword(e.target.value)} required disabled={isSubmitting} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-500 ml-4 tracking-widest">Graduação Federativa</label>
                <select value={newStudentBelt} onChange={e => setNewStudentBelt(e.target.value)} className="w-full p-5 rounded-2xl outline-none bg-white/5 border border-white/10 text-white font-bold" disabled={isSubmitting}>
                  {beltOptions.map(b => (
                    <option key={b} value={b} className="bg-black">{b}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-500 ml-4 tracking-widest">Mensalidade (R$)</label>
                <input className="w-full p-5 rounded-2xl outline-none" type="number" placeholder="0.00" value={newStudentFee} onChange={e => setNewStudentFee(Number(e.target.value))} required disabled={isSubmitting} />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="md:col-span-2 mt-4 py-6 bg-indigo-600 hover:bg-white text-white hover:text-black font-black rounded-3xl uppercase text-[11px] tracking-[0.3em] transition-all flex items-center justify-center gap-4 active:scale-95"
              >
                {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Provisionando...</> : <><Database size={20} /> Finalizar Matrícula</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-3xl border border-white/5 overflow-x-auto max-w-full no-scrollbar">
          <button onClick={() => setActiveTab('inicio')} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'inicio' ? 'bg-indigo-600 shadow-xl text-white' : 'text-gray-500 hover:text-white'}`}>Painel</button>
          <button onClick={() => setActiveTab('alunos')} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'alunos' ? 'bg-indigo-600 shadow-xl text-white' : 'text-gray-500 hover:text-white'}`}>Alunos</button>
          <button onClick={() => setActiveTab('avisos')} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'avisos' ? 'bg-indigo-600 shadow-xl text-white' : 'text-gray-500 hover:text-white'}`}>Mural</button>
          <button onClick={() => setActiveTab('financeiro')} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'financeiro' ? 'bg-indigo-600 shadow-xl text-white' : 'text-gray-500 hover:text-white'}`}>Caixa</button>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="hidden lg:flex flex-col gap-1 w-48">
            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
              <span>Cota Atletas</span>
              <span className={usagePercentage > 90 ? 'text-red-500' : 'text-indigo-400'}>{currentUsage}/{studentLimit}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className={`h-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-600 to-cyan-400'}`} style={{ width: `${usagePercentage}%` }}></div>
            </div>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-yellow-500 transition-all shadow-xl active:scale-95">
            <UserPlus size={18} /> Matricular Atleta
          </button>
        </div>
      </div>

      {activeTab === 'inicio' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom duration-500">
           <div className="glass-card p-8 rounded-[2rem] border-white/5 shadow-xl">
              <Users className="text-indigo-500 mb-4" />
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Atletas</p>
              <h4 className="text-3xl font-black text-white">{currentUsage} <span className="text-xs text-gray-700 font-bold">/ {studentLimit}</span></h4>
           </div>
           <div className="glass-card p-8 rounded-[2rem] border-green-500/20 bg-green-500/5 shadow-xl">
              <DollarSign className="text-green-500 mb-4" />
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Receita Mensal</p>
              <h4 className="text-3xl font-black text-white">R$ {totalMonthlyRevenue.toFixed(2)}</h4>
           </div>
           <div className="glass-card p-8 rounded-[2rem] border-yellow-500/20 bg-yellow-500/5 shadow-xl">
              <Crown className="text-yellow-500 mb-4" />
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Seu Plano</p>
              <h4 className="text-xl font-black text-white uppercase italic">{isPremium ? 'Premium Gold' : 'Free Standard'}</h4>
           </div>
           <div className="glass-card p-8 rounded-[2rem] border-indigo-500/20 bg-indigo-500/5 shadow-xl">
              <Zap className="text-indigo-400 mb-4" />
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nível de Acesso</p>
              <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{user.belt}</h4>
           </div>
        </div>
      )}

      {activeTab === 'financeiro' && (
        <div className="space-y-8 animate-in slide-in-from-right">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="glass-card p-10 rounded-[3rem] border-green-500/20 bg-green-500/5 shadow-2xl relative overflow-hidden flex flex-col justify-center">
              <DollarSign size={80} className="absolute -right-4 -bottom-4 opacity-5 text-green-500" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Previsão Alunos</p>
              <h4 className="text-4xl font-black italic text-white">R$ {totalMonthlyRevenue.toFixed(2)}</h4>
            </div>
            <div className="lg:col-span-3 glass-card p-8 rounded-[3rem] border-yellow-500/20 bg-yellow-500/5 shadow-2xl flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1 space-y-2">
                  <h5 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest flex items-center gap-2"><Crown size={14} /> Mensalidade Federação</h5>
                  <p className="text-sm font-black text-white italic truncate">{federationPixKey || 'Aguardando Federação...'}</p>
               </div>
               <div className="flex gap-4">
                  {federationPixKey && (
                    <button onClick={handleCopyFedPix} className="px-6 py-3 bg-yellow-500 text-black rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-white transition-all active:scale-95">
                       <Copy size={16} /> Copiar PIX
                    </button>
                  )}
                  <button onClick={handleSavePaymentConfig} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-white hover:text-black transition-all active:scale-95">
                    <Save size={16} /> Salvar Meus Dados
                  </button>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="glass-card p-10 rounded-[4rem] border-white/5 shadow-2xl flex flex-col gap-8">
              <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3 text-indigo-400"><QrCode size={28} /> Sua Chave PIX Alunos</h3>
              <div className="space-y-4">
                <input className="w-full p-6 rounded-3xl outline-none bg-white/5 border border-white/10 text-white font-black italic" placeholder="Seu PIX" value={pixKey} onChange={e => setPixKey(e.target.value)} />
                <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-xs text-gray-400 italic">Esta chave será visível no painel do aluno.</div>
              </div>
            </section>
            <section className="glass-card p-10 rounded-[4rem] border-white/5 shadow-2xl flex flex-col">
              <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3 text-indigo-400"><Wallet size={28} /> Instruções de Pagamento</h3>
              <textarea className="w-full flex-1 p-8 rounded-[3rem] mt-6 outline-none bg-white/5 border border-white/10 text-white italic text-sm" placeholder="Ex: Pagamento via Nubank..." value={paymentInstructions} onChange={e => setPaymentInstructions(e.target.value)} />
            </section>
          </div>
        </div>
      )}

      {activeTab === 'alunos' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherStudents.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 py-20 text-center glass-card rounded-[3rem] opacity-30 flex flex-col items-center">
                  <Users size={64} className="mb-4" />
                  <p className="text-[11px] font-black uppercase tracking-[0.5em]">Tatame Vazio</p>
                </div>
              ) : (
                teacherStudents.map(s => (
                  <div key={s.id} className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-col gap-6 group hover:border-indigo-500/30 transition-all shadow-xl">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-indigo-400 italic text-xl border border-white/10">{s.name[0]}</div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase italic truncate max-w-[120px]">{s.name}</h4>
                          <p className={`text-[8px] font-black uppercase ${s.paymentStatus === 'paid' ? 'text-green-500' : 'text-red-500'}`}>{s.paymentStatus === 'paid' ? 'EM DIA' : 'PENDENTE'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onToggleStudentStatus(s.id)} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                          {s.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button onClick={() => setDeleteConfirm({ id: s.id, name: s.name })} className="p-2.5 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <BJJBelt belt={s.belt || 'Branca'} size="sm" />
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
                      <span>Mensalidade:</span>
                      <span className="text-white">R$ {s.monthlyFee?.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
