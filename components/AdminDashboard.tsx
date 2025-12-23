
import React, { useState, useMemo } from 'react';
import { Teacher, User } from '../types';
import { 
  Pause, Play, Trash2, Crown, X, CreditCard, Sparkles, 
  Calendar, ExternalLink, Server, Users, TrendingUp, 
  Trash, Cpu, Award, Download, ShieldAlert, Lock, AlertTriangle, FileText,
  Settings, QrCode, Save, Copy, ShieldX, Info
} from 'lucide-react';
import { analyzeStorageHealth } from '../services/geminiService';

interface AdminDashboardProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  students: User[];
  setStudents: React.Dispatch<React.SetStateAction<User[]>>;
  onToggleStatus: (id: string) => void;
  onToggleStudentStatus: (id: string) => void;
  onDeleteTeacher: (id: string) => void;
  onDeleteStudent: (id: string) => void;
  onUpdateTeacher: (updated: Teacher) => void;
  onUpdateStudent: (updated: User) => void;
  federationPixKey: string;
  setFederationPixKey: (key: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  teachers = [], setTeachers, students = [], setStudents,
  onToggleStatus, onDeleteTeacher, onDeleteStudent, federationPixKey, setFederationPixKey
}) => {
  const [activeTab, setActiveTab] = useState<'inicio' | 'professores' | 'alunos' | 'config'>('inicio');
  const [searchTerm, setSearchTerm] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizerReport, setOptimizerReport] = useState<any>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; title: string; type: 'teacher' | 'student' } | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newBelt, setNewBelt] = useState('Professor');
  const [newPlan, setNewPlan] = useState<'free' | 'premium'>('free');
  const [newObservations, setNewObservations] = useState('');
  
  const [localPixKey, setLocalPixKey] = useState(federationPixKey);

  const belts = ["Monitor", "Instrutor", "Professor"];

  const handleDeepClean = async () => {
    setIsOptimizing(true);
    const report = await analyzeStorageHealth(`Bucket: mourajiujitsu252@gmail.com, Instâncias: ${teachers.length + students.length}`);
    setOptimizerReport(report);
    setTimeout(() => {
      setIsOptimizing(false);
      alert("LIMPEZA GOOGLE CLOUD CONCLUÍDA!");
    }, 2000);
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const t: Teacher = {
      id: `t-${Date.now()}`, 
      name: newName, 
      email: newEmail.toLowerCase().trim(),
      password: newPassword, 
      role: 'PROFESSOR', 
      status: 'active',
      studentCount: 0, 
      paymentStatus: 'paid', 
      belt: newBelt, 
      isVerified: true,
      plan: newPlan,
      planStartDate: Date.now(),
      observations: newObservations
    };
    setTeachers(prev => [...prev, t]);
    setNewName(''); setNewEmail(''); setNewPassword(''); setNewBelt('Professor'); setNewObservations('');
    alert("INSTRUTOR PROVISIONADO NO CLOUD!");
  };

  const handleConfirmSecureDelete = () => {
    if (!deleteConfirm) return;
    // Senha 2026 para Mestres, 26 para Alunos
    const requiredPw = deleteConfirm.type === 'teacher' ? '2026' : '26';
    if (deletePassword === requiredPw) {
      if (deleteConfirm.type === 'teacher') onDeleteTeacher(deleteConfirm.id);
      else onDeleteStudent(deleteConfirm.id);
      setDeleteConfirm(null);
      setDeletePassword('');
      alert("Instância encerrada com sucesso.");
    } else {
      alert("CÓDIGO DE AUTORIZAÇÃO INVÁLIDO!");
    }
  };

  const handleSaveConfig = () => {
    setFederationPixKey(localPixKey);
    alert("Configurações Federativas Atualizadas!");
  };

  const filteredItems = useMemo(() => {
    const list = activeTab === 'professores' ? teachers : students;
    return Array.isArray(list) ? list.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];
  }, [activeTab, teachers, students, searchTerm]);

  // Conta quantos alunos um mestre possui para o aviso de exclusão
  const studentCountForTeacher = useMemo(() => {
    if (deleteConfirm?.type === 'teacher') {
      return students.filter(s => s.teacherId === deleteConfirm.id).length;
    }
    return 0;
  }, [deleteConfirm, students]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Modal de Exclusão Segura (ADM) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setDeleteConfirm(null)}></div>
          <div className="glass-card w-full max-w-md rounded-[3rem] p-10 border-red-500/30 relative z-10 shadow-2xl animate-in zoom-in">
            <div className="text-center space-y-6">
              <ShieldX size={48} className="mx-auto text-red-500" />
              <div>
                <h2 className="text-2xl font-black uppercase italic text-white">Exclusão Crítica</h2>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-2">Removendo {deleteConfirm.name}</p>
                
                {deleteConfirm.type === 'teacher' && studentCountForTeacher > 0 && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-pulse">
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-relaxed">
                      ⚠️ ATENÇÃO: Ao excluir o mestre, todos os seus {studentCountForTeacher} atleta(s) também serão apagados.
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-gray-600 tracking-widest block text-left ml-4">Código de Autorização</label>
                <input 
                  type="password" 
                  className="w-full p-5 rounded-2xl outline-none bg-white/5 border border-white/10 text-white font-black text-center tracking-[1em]"
                  placeholder="****"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleConfirmSecureDelete} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl uppercase text-[10px] hover:bg-red-500 transition-all shadow-xl shadow-red-600/20 active:scale-95">Confirmar Puxada</button>
                <button onClick={() => { setDeleteConfirm(null); setDeletePassword(''); }} className="px-6 py-4 bg-white/5 text-gray-400 rounded-2xl uppercase text-[10px] hover:text-white transition-all">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-4 flex-wrap bg-white/5 p-1.5 rounded-3xl border border-white/5">
          <button onClick={() => setActiveTab('inicio')} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'inicio' ? 'bg-yellow-500 text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}>Painel</button>
          <button onClick={() => setActiveTab('professores')} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'professores' ? 'bg-yellow-500 text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}>Mestres</button>
          <button onClick={() => setActiveTab('alunos')} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'alunos' ? 'bg-yellow-500 text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}>Atletas</button>
          <button onClick={() => setActiveTab('config')} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'config' ? 'bg-yellow-500 text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}>Config</button>
        </div>
      </div>

      {activeTab === 'inicio' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-8 rounded-[2rem] border-white/5 shadow-xl"><Server className="text-yellow-500 mb-4" /><p className="text-[10px] font-black uppercase text-gray-500">Cloud Health</p><h4 className="text-3xl font-black text-white">{optimizerReport?.healthScore || 100}%</h4></div>
            <div className="glass-card p-8 rounded-[2rem] border-white/5 shadow-xl"><Users className="text-indigo-500 mb-4" /><p className="text-[10px] font-black uppercase text-gray-500">Membros</p><h4 className="text-3xl font-black text-white">{students.length + teachers.length}</h4></div>
            <div className="glass-card p-8 rounded-[2rem] border-white/5 shadow-xl"><TrendingUp className="text-green-500 mb-4" /><p className="text-[10px] font-black uppercase text-gray-500">Eficiência</p><h4 className="text-3xl font-black text-white">98.2%</h4></div>
            <button onClick={handleDeepClean} disabled={isOptimizing} className="glass-card p-8 rounded-[2rem] border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 text-left transition-all group">
              <Cpu size={24} className="text-cyan-400 mb-4 group-hover:scale-110" />
              <p className="text-[10px] font-black uppercase text-gray-500">IA Deep Clean</p>
              <h4 className="text-lg font-black text-cyan-400 uppercase">{isOptimizing ? 'Otimizando...' : 'Executar'}</h4>
            </button>
          </div>
          <div className="glass-card p-10 rounded-[3rem] border-white/5">
            <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3"><Cpu size={24} className="text-yellow-500" /> Provisionar Novo Instrutor</h3>
            <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input className="p-5 rounded-2xl outline-none" placeholder="Nome Completo" value={newName} onChange={e => setNewName(e.target.value)} required />
              <input className="p-5 rounded-2xl outline-none" placeholder="Email Federativo" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
              <input className="p-5 rounded-2xl outline-none" placeholder="Senha Master" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              <select value={newBelt} onChange={e => setNewBelt(e.target.value)} className="w-full p-5 rounded-2xl outline-none bg-white/5 border border-white/10 text-white font-bold">
                {belts.map(b => <option key={b} value={b} className="bg-black">{b}</option>)}
              </select>
              <select value={newPlan} onChange={e => setNewPlan(e.target.value as 'free' | 'premium')} className="w-full p-5 rounded-2xl outline-none bg-white/5 border border-white/10 text-white font-bold">
                <option value="free" className="bg-black">Plano Grátis</option>
                <option value="premium" className="bg-black">Plano Premium</option>
              </select>
              <button className="lg:col-span-3 bg-yellow-500 text-black font-black py-5 rounded-2xl uppercase text-[11px] tracking-widest hover:bg-white transition-all shadow-xl active:scale-95">Ativar Monitor/Professor</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="glass-card p-12 rounded-[4rem] border-yellow-500/20 bg-yellow-500/5 shadow-2xl animate-in slide-in-from-bottom">
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="text-center space-y-4">
              <Settings size={64} className="mx-auto text-yellow-500" />
              <h3 className="text-3xl font-black uppercase italic">Configurações Federativas</h3>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest leading-relaxed">Defina os canais de recebimento central para Instrutores e Professores.</p>
            </div>

            <div className="space-y-6 bg-white/5 p-10 rounded-[3rem] border border-white/10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-yellow-500 ml-4 tracking-widest flex items-center gap-2">
                  <QrCode size={14} /> Chave PIX da Federação (Central)
                </label>
                <input 
                  className="w-full p-6 rounded-3xl outline-none bg-white/5 border border-white/10 text-white font-black italic tracking-widest text-center"
                  placeholder="Ex: financeiro@federacao.com.br"
                  value={localPixKey}
                  onChange={e => setLocalPixKey(e.target.value)}
                />
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSaveConfig}
                  className="w-full py-6 bg-yellow-500 text-black font-black rounded-[2rem] uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white transition-all shadow-2xl active:scale-95"
                >
                  <Save size={20} /> Sincronizar Canais de Pagamento
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 text-indigo-400 italic text-xs">
              <Info size={24} className="shrink-0" />
              <p>Esta chave será visível no painel financeiro de todos os mestres para facilitar o pagamento das anuidades federativas.</p>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'professores' || activeTab === 'alunos') && (
        <div className="space-y-6">
          <input className="w-full p-5 rounded-2xl outline-none border border-white/10 bg-white/5 text-white text-xs font-bold" placeholder="Filtrar instâncias..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(u => (
              <div key={u.id} className="glass-card p-6 rounded-3xl border-white/5 flex flex-col group hover:border-white/20 transition-all shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center font-black text-yellow-500 italic text-xl shadow-inner">{u.name[0]}</div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase italic">{u.name}</h4>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">{u.belt} • {u.status === 'active' ? <span className="text-green-500">ATIVO</span> : <span className="text-red-500">SUSPENSO</span>}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onToggleStatus(u.id)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-white">{u.status === 'active' ? <Pause size={16}/> : <Play size={16}/>}</button>
                    <button onClick={() => setDeleteConfirm({ id: u.id, name: u.name, title: u.belt || 'Atleta', type: activeTab === 'professores' ? 'teacher' : 'student' })} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
