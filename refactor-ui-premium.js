const fs = require('fs');
const path = require('path');

const p = (file) => path.join(__dirname, 'frontend', 'src', file);

// -----------------------------------------------------------------------------
// 1. PROJECTS DASHBOARD
// -----------------------------------------------------------------------------
const projectsPageCode = `'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProjects, createProject, deleteProject } from '@/services/api';
import Link from 'next/link';

export default function Projects() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      setName('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name, description });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      
      {/* Navbar Premium */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm shadow-indigo-200">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">Demoucron <span className="text-gray-400 font-normal">Min-Max</span></span>
          </div>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Déconnexion
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-12 animate-fade-in-up">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Vos Projets</h1>
            <p className="text-gray-500 mt-1 text-sm">Gérez et planifiez vos ordonnancements.</p>
          </div>
        </header>

        {/* Formulaire Minimaliste */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 mb-10">
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nom du projet</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-gray-400"
                placeholder="Ex: Refonte Infrastructure" 
                required 
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description (Optionnelle)</label>
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-gray-400"
                placeholder="Ex: Tâches critiques Q3" 
              />
            </div>
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="w-full md:w-auto bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {createMutation.isPending ? 'Création...' : 'Créer le projet'}
            </button>
          </form>
        </div>

        {/* Liste des Projets */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <svg className="w-5 h-5 animate-spin text-gray-300" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            <span className="text-sm font-medium">Chargement des projets...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects?.map((project: any, i: number) => (
              <div 
                key={project.id} 
                className={\`group bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_-6px_rgba(99,102,241,0.08)] transition-all duration-300 flex flex-col justify-between animate-fade-in-up\`}
                style={{ animationDelay: \`\${i * 0.05}s\` }}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>
                    </div>
                    <button 
                      onClick={() => { if(confirm('Supprimer ce projet ?')) deleteMutation.mutate(project.id) }}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">{project.name}</h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">{project.description || 'Aucune description fournie.'}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-50">
                  <Link href={\`/projects/\${project.id}\`} className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Ouvrir le projet
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                  </Link>
                </div>
              </div>
            ))}
            
            {projects?.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white/50 rounded-2xl border border-gray-200/60 border-dashed">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /></svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">Aucun projet</h3>
                <p className="text-sm text-gray-500 mt-1">Créez votre premier projet d'ordonnancement ci-dessus.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(p('app/projects/page.tsx'), projectsPageCode);

// -----------------------------------------------------------------------------
// 2. PROJECT DETAIL PAGE
// -----------------------------------------------------------------------------
const projectDetailPageCode = `'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchProjectDetails, createTask, deleteTask, createDependency, deleteDependency, runAnalysis } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import PertDiagram from '@/components/graph/PertDiagram';
import GanttChart from '@/components/gantt/GanttChart';

export default function ProjectDetail() {
  const params = useParams();
  const projectId = Number(params.id);
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'data' | 'gantt' | 'pert'>('data');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [taskName, setTaskName] = useState('');
  const [taskDuration, setTaskDuration] = useState<number | ''>('');
  const [sourceTaskId, setSourceTaskId] = useState<number | ''>('');
  const [targetTaskId, setTargetTaskId] = useState<number | ''>('');

  const setTasks = useProjectStore(state => state.setTasks);
  const setDependencies = useProjectStore(state => state.setDependencies);

  const { data: project, isLoading } = useQuery({ queryKey: ['project', projectId], queryFn: () => fetchProjectDetails(projectId) });

  useEffect(() => {
    if (project) {
      setTasks(project.tasks || []);
      setDependencies(project.dependencies || []);
    }
  }, [project, setTasks, setDependencies]);

  const refreshProject = () => queryClient.invalidateQueries({ queryKey: ['project', projectId] });

  const addTaskMutation = useMutation({ mutationFn: createTask, onSuccess: () => { setTaskName(''); setTaskDuration(''); refreshProject(); } });
  const removeTaskMutation = useMutation({ mutationFn: deleteTask, onSuccess: () => refreshProject() });
  
  const addDependencyMutation = useMutation({
    mutationFn: createDependency,
    onSuccess: () => { setSourceTaskId(''); setTargetTaskId(''); setErrorMsg(null); refreshProject(); },
    onError: (error: any) => setErrorMsg(error.message),
  });
  
  const removeDependencyMutation = useMutation({ mutationFn: deleteDependency, onSuccess: () => refreshProject() });
  
  const analysisMutation = useMutation({
    mutationFn: runAnalysis,
    onSuccess: () => { setErrorMsg(null); refreshProject(); setActiveTab('pert'); },
    onError: (error: any) => setErrorMsg(error.message),
  });

  const exportToCSV = () => {
    if (!project || !project.tasks || project.tasks.length === 0) return;
    const headers = ["ID", "Nom", "Durée", "Début au plus tôt (MIN)", "Fin au plus tôt", "Début au plus tard (MAX)", "Fin au plus tard", "Marge Totale", "Marge Libre", "Chemin Critique"];
    const rows = project.tasks.map((t: any) => [
      t.id, t.name, t.duration, t.earliestStart ?? '', t.earliestFinish ?? '', t.latestStart ?? '', t.latestFinish ?? '', t.totalMargin ?? '', t.freeMargin ?? '', t.isCritical ? 'OUI' : 'NON'
    ]);
    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", \`projet_\${project.name.replace(/\\s+/g, '_')}_resultats.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-gray-400 font-medium">Chargement...</div>;
  if (!project) return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-red-500">Projet introuvable.</div>;

  const handleAddTask = (e: React.FormEvent) => { e.preventDefault(); if (!taskName || !taskDuration) return; addTaskMutation.mutate({ name: taskName, duration: Number(taskDuration), projectId }); };
  const handleAddDependency = (e: React.FormEvent) => { e.preventDefault(); if (!sourceTaskId || !targetTaskId) return; addDependencyMutation.mutate({ sourceTaskId: Number(sourceTaskId), targetTaskId: Number(targetTaskId), projectId }); };
  const hasBeenAnalyzed = project.tasks && project.tasks.length > 0 && project.tasks[0].earliestStart !== null;

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-indigo-100 pb-20">
      
      {/* Navbar Premium */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/projects" className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          </Link>
          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight truncate">{project.name}</h1>
          
          <div className="ml-auto flex items-center gap-3">
            {hasBeenAnalyzed && (
              <button onClick={exportToCSV} className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Export CSV
              </button>
            )}
            <button 
              onClick={() => analysisMutation.mutate(projectId)} 
              disabled={project.tasks?.length === 0 || analysisMutation.isPending}
              className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
              {analysisMutation.isPending ? 'Analyse...' : 'Lancer l\\'Analyse'}
            </button>
          </div>
        </div>
      </nav>

      {/* Messages Erreur Globaux */}
      {errorMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Onglets Premium (Pills) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 mb-6">
        <div className="inline-flex bg-gray-100/80 p-1 rounded-xl shadow-inner">
          <button onClick={() => setActiveTab('data')} className={\`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 \${activeTab === 'data' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}>Données</button>
          <button onClick={() => setActiveTab('gantt')} className={\`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 \${activeTab === 'gantt' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}>Gantt</button>
          <button onClick={() => setActiveTab('pert')} className={\`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 \${activeTab === 'pert' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}>Réseau PERT</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in-up">
        {activeTab === 'data' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Tâches */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h2 className="font-bold text-gray-900">Tâches</h2>
                  <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">{project.tasks?.length || 0}</span>
                </div>
                <div className="p-6 border-b border-gray-100">
                  <form onSubmit={handleAddTask} className="flex gap-3">
                    <input type="text" value={taskName} onChange={e=>setTaskName(e.target.value)} placeholder="Nom (ex: A)" className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" required />
                    <input type="number" value={taskDuration} onChange={e=>setTaskDuration(Number(e.target.value) || '')} placeholder="Durée" min="1" className="w-1/4 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" required />
                    <button type="submit" className="w-1/4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Ajouter</button>
                  </form>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white border-b border-gray-100 text-gray-400 uppercase text-[11px] font-semibold tracking-wider">
                      <tr><th className="px-6 py-3">ID</th><th className="px-6 py-3">Nom</th><th className="px-6 py-3">Durée</th><th className="px-6 py-3"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {project.tasks?.map((t: any) => (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-3 font-mono text-gray-400">{t.id}</td>
                          <td className="px-6 py-3 font-medium text-gray-900">{t.name}</td>
                          <td className="px-6 py-3 text-gray-600">{t.duration}j</td>
                          <td className="px-6 py-3 text-right">
                            <button onClick={() => removeTaskMutation.mutate(t.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Dépendances */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h2 className="font-bold text-gray-900">Dépendances</h2>
                  <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">{project.dependencies?.length || 0}</span>
                </div>
                <div className="p-6 border-b border-gray-100">
                  <form onSubmit={handleAddDependency} className="flex gap-3">
                    <select value={sourceTaskId} onChange={e=>setSourceTaskId(Number(e.target.value))} className="w-2/5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-gray-700" required>
                      <option value="">Avant...</option>
                      {project.tasks?.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <div className="flex items-center text-gray-300"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg></div>
                    <select value={targetTaskId} onChange={e=>setTargetTaskId(Number(e.target.value))} className="w-2/5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-gray-700" required>
                      <option value="">Après...</option>
                      {project.tasks?.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button type="submit" className="w-1/5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Lier</button>
                  </form>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white border-b border-gray-100 text-gray-400 uppercase text-[11px] font-semibold tracking-wider">
                      <tr><th className="px-6 py-3">Source</th><th className="px-6 py-3">Cible</th><th className="px-6 py-3"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {project.dependencies?.map((d: any) => {
                        const s = project.tasks?.find((t:any)=>t.id === d.sourceTaskId);
                        const t = project.tasks?.find((t:any)=>t.id === d.targetTaskId);
                        return (
                        <tr key={d.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-3"><span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">{s?.name || d.sourceTaskId}</span></td>
                          <td className="px-6 py-3"><span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">{t?.name || d.targetTaskId}</span></td>
                          <td className="px-6 py-3 text-right">
                            <button onClick={() => removeDependencyMutation.mutate(d.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GANTT & PERT (Si tâches existent) */}
        {activeTab === 'gantt' && project.tasks?.length === 0 && <div className="p-16 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed">Ajoutez des tâches puis lancez l'analyse pour visualiser le diagramme.</div>}
        {activeTab === 'gantt' && project.tasks?.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] animate-fade-in overflow-x-auto">
            <GanttChart />
          </div>
        )}

        {activeTab === 'pert' && project.tasks?.length === 0 && <div className="p-16 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed">Ajoutez des tâches puis lancez l'analyse pour visualiser le diagramme.</div>}
        {activeTab === 'pert' && project.tasks?.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] animate-fade-in overflow-hidden" style={{ minHeight: '600px' }}>
            <PertDiagram />
          </div>
        )}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(p('app/projects/[id]/page.tsx'), projectDetailPageCode);

// -----------------------------------------------------------------------------
// 3. PERT NODE (Premium Subtlety)
// -----------------------------------------------------------------------------
const pertNodeCode = `import { Handle, Position } from 'reactflow';

export default function PertNode({ data }: { data: any }) {
  const isCritical = data.isCritical;
  
  return (
    <div className={\`w-[160px] bg-white rounded-xl shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] border-y border-r \${isCritical ? 'border-l-4 border-l-rose-500 border-y-rose-100 border-r-rose-100 shadow-rose-500/10' : 'border-l-4 border-l-indigo-400 border-y-gray-100 border-r-gray-100'} overflow-hidden transition-all hover:shadow-md\`}>
      <div className={\`text-center py-2 border-b \${isCritical ? 'border-rose-50 bg-rose-50/30 text-rose-700' : 'border-gray-50 bg-gray-50/50 text-gray-700'} font-bold text-sm\`}>
        {data.label}
      </div>
      <div className="grid grid-cols-3 text-center border-b border-gray-50 text-xs">
        <div className="py-1.5 font-medium text-gray-600 border-r border-gray-50">{data.earliestStart ?? '-'}</div>
        <div className="py-1.5 font-semibold text-gray-900 border-r border-gray-50 bg-gray-50/30">{data.duration}</div>
        <div className="py-1.5 font-medium text-gray-600">{data.earliestFinish ?? '-'}</div>
      </div>
      <div className="grid grid-cols-3 text-center text-[10px]">
        <div className="py-1.5 font-medium text-gray-500 border-r border-gray-50">{data.latestStart ?? '-'}</div>
        <div className="py-1 border-r border-gray-50 flex flex-col justify-center items-center bg-gray-50/30">
          <span className={\`font-semibold \${isCritical ? 'text-rose-500' : 'text-indigo-500'}\`}>MT:{data.totalMargin ?? '-'}</span>
          <span className="text-gray-400 font-medium">ML:{data.freeMargin ?? '-'}</span>
        </div>
        <div className="py-1.5 font-medium text-gray-500">{data.latestFinish ?? '-'}</div>
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-gray-300 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-gray-300 border-white" />
    </div>
  );
}
`;
fs.writeFileSync(p('components/graph/PertNode.tsx'), pertNodeCode);

// -----------------------------------------------------------------------------
// 4. GANTT CHART (Premium Rounded Bars)
// -----------------------------------------------------------------------------
const ganttChartCode = `'use client';
import { useProjectStore } from '@/store/projectStore';
import { useMemo } from 'react';

export default function GanttChart() {
  const { tasks } = useProjectStore();

  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;
    const maxDuration = Math.max(...tasks.map(t => t.earliestFinish || 0));
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.earliestStart !== b.earliestStart) return (a.earliestStart || 0) - (b.earliestStart || 0);
      return (a.totalMargin || 0) - (b.totalMargin || 0);
    });
    return { maxDuration, sortedTasks };
  }, [tasks]);

  if (!chartData) return null;
  const { maxDuration, sortedTasks } = chartData;

  const dayWidth = 40; 
  const headerHeight = 40;
  const rowHeight = 48;
  const totalWidth = maxDuration * dayWidth;
  const totalHeight = sortedTasks.length * rowHeight + headerHeight;

  return (
    <div className="w-full overflow-x-auto pb-4">
      <svg width={totalWidth + 120} height={totalHeight + 20} className="font-sans text-sm">
        <g className="text-gray-400 text-xs font-medium">
          {Array.from({ length: maxDuration + 1 }).map((_, i) => (
            <g key={i}>
              <line x1={100 + i * dayWidth} y1={headerHeight} x2={100 + i * dayWidth} y2={totalHeight} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
              <text x={100 + i * dayWidth} y={24} textAnchor="middle">{i}</text>
            </g>
          ))}
        </g>
        {sortedTasks.map((task, index) => {
          const y = headerHeight + index * rowHeight;
          const es = task.earliestStart || 0;
          const ef = task.earliestFinish || 0;
          const duration = ef - es;
          const barX = 100 + es * dayWidth;
          const barWidth = duration * dayWidth;
          const isCritical = task.isCritical;
          const marginWidth = (task.freeMargin || 0) * dayWidth;

          return (
            <g key={task.id} className="group">
              <rect x="0" y={y} width={totalWidth + 100} height={rowHeight} fill="transparent" className="hover:fill-gray-50/50 transition-colors" />
              <text x="80" y={y + 28} textAnchor="end" className="font-semibold text-gray-700 fill-current">{task.name}</text>
              {marginWidth > 0 && (
                <line x1={barX + barWidth} y1={y + 24} x2={barX + barWidth + marginWidth} y2={y + 24} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
              )}
              <rect x={barX} y={y + 12} width={Math.max(barWidth, 4)} height={24} rx="12" className={\`\${isCritical ? 'fill-rose-500' : 'fill-indigo-500'} shadow-sm\`} opacity="0.9" />
              {barWidth > 30 && (
                <text x={barX + barWidth / 2} y={y + 28} textAnchor="middle" className="text-[10px] font-bold fill-white pointer-events-none">{task.duration}j</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
`;
fs.writeFileSync(p('components/gantt/GanttChart.tsx'), ganttChartCode);

// -----------------------------------------------------------------------------
// 5. PERT DIAGRAM (Edge styling)
// -----------------------------------------------------------------------------
const pertDiagramCode = `'use client';
import { useMemo, useCallback } from 'react';
import ReactFlow, { Background, Controls, Edge, Node, Position, MarkerType, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { useProjectStore } from '@/store/projectStore';
import PertNode from './PertNode';

const nodeTypes = { pertNode: PertNode };

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 60 });

  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 160, height: 80 }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;
    node.position = { x: nodeWithPosition.x - 160 / 2, y: nodeWithPosition.y - 80 / 2 };
    return node;
  });

  return { nodes: layoutedNodes, edges };
};

export default function PertDiagram() {
  const { tasks, dependencies } = useProjectStore();
  if (!tasks || tasks.length === 0) return null;

  const initialNodes: Node[] = tasks.map((t) => ({
    id: t.id.toString(),
    type: 'pertNode',
    data: { 
      label: t.name, duration: t.duration, earliestStart: t.earliestStart, earliestFinish: t.earliestFinish,
      latestStart: t.latestStart, latestFinish: t.latestFinish, totalMargin: t.totalMargin,
      freeMargin: t.freeMargin, isCritical: t.isCritical
    },
    position: { x: 0, y: 0 },
  }));

  const initialEdges: Edge[] = dependencies.map((d) => {
    const sourceTask = tasks.find(t => t.id === d.sourceTaskId);
    const targetTask = tasks.find(t => t.id === d.targetTaskId);
    const isCriticalEdge = sourceTask?.isCritical && targetTask?.isCritical;

    return {
      id: \`e\${d.sourceTaskId}-\${d.targetTaskId}\`,
      source: d.sourceTaskId.toString(),
      target: d.targetTaskId.toString(),
      type: 'smoothstep',
      animated: isCriticalEdge,
      style: { stroke: isCriticalEdge ? '#f43f5e' : '#cbd5e1', strokeWidth: isCriticalEdge ? 2.5 : 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: isCriticalEdge ? '#f43f5e' : '#cbd5e1' },
    };
  });

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} nodeTypes={nodeTypes} fitView className="bg-gray-50/30">
        <Background color="#e2e8f0" gap={20} size={1} />
        <Controls showInteractive={false} className="shadow-md border border-gray-100 rounded-lg overflow-hidden bg-white" />
      </ReactFlow>
    </div>
  );
}
`;
fs.writeFileSync(p('components/graph/PertDiagram.tsx'), pertDiagramCode);

console.log('UI Premium Refactoring Completed.');
