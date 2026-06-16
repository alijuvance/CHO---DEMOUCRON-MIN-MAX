'use client';
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
    onError: (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => setErrorMsg(error.message),
  });
  
  const removeDependencyMutation = useMutation({ mutationFn: deleteDependency, onSuccess: () => refreshProject() });
  
  const analysisMutation = useMutation({
    mutationFn: runAnalysis,
    onSuccess: () => { setErrorMsg(null); refreshProject(); setActiveTab('pert'); },
    onError: (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => setErrorMsg(error.message),
  });

  const exportToCSV = () => {
    if (!project || !project.tasks || project.tasks.length === 0) return;
    const headers = ["ID", "Nom", "Durée", "Début au plus tôt (MIN)", "Fin au plus tôt", "Début au plus tard (MAX)", "Fin au plus tard", "Marge Totale", "Marge Libre", "Chemin Critique"];
    const rows = project.tasks.map((t: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, index: number) => [
      index + 1, t.name, t.duration, t.earliestStart ?? '', t.earliestFinish ?? '', t.latestStart ?? '', t.latestFinish ?? '', t.totalMargin ?? '', t.freeMargin ?? '', t.isCritical ? 'OUI' : 'NON'
    ]);
    const csvContent = [headers.join(','), ...rows.map((row: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[]) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `projet_${project.name.replace(/\s+/g, '_')}_resultats.csv`);
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
              {analysisMutation.isPending ? 'Analyse...' : 'Lancer l\'Analyse'}
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
          <button onClick={() => setActiveTab('data')} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'data' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Données</button>
          <button onClick={() => setActiveTab('gantt')} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'gantt' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Gantt</button>
          <button onClick={() => setActiveTab('pert')} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'pert' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Réseau PERT</button>
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
                      {project.tasks?.map((t: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, index: number) => (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-3 font-mono text-gray-400">{index + 1}</td>
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
                      {project.tasks?.map((t:any /* eslint-disable-line @typescript-eslint/no-explicit-any */)=><option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <div className="flex items-center text-gray-300"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg></div>
                    <select value={targetTaskId} onChange={e=>setTargetTaskId(Number(e.target.value))} className="w-2/5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-gray-700" required>
                      <option value="">Après...</option>
                      {project.tasks?.map((t:any /* eslint-disable-line @typescript-eslint/no-explicit-any */)=><option key={t.id} value={t.id}>{t.name}</option>)}
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
                      {project.dependencies?.map((d: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
                        const s = project.tasks?.find((t:any /* eslint-disable-line @typescript-eslint/no-explicit-any */)=>t.id === d.sourceTaskId);
                        const t = project.tasks?.find((t:any /* eslint-disable-line @typescript-eslint/no-explicit-any */)=>t.id === d.targetTaskId);
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
        {activeTab === 'gantt' && project.tasks?.length === 0 && <div className="p-16 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed">Ajoutez des tâches puis lancez l&apos;analyse pour visualiser le diagramme.</div>}
        {activeTab === 'gantt' && project.tasks?.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] animate-fade-in">
            <GanttChart />
          </div>
        )}

        {activeTab === 'pert' && project.tasks?.length === 0 && <div className="p-16 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed">Ajoutez des tâches puis lancez l&apos;analyse pour visualiser le diagramme.</div>}
        {activeTab === 'pert' && project.tasks?.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] animate-fade-in overflow-hidden" style={{ height: '600px' }}>
            <PertDiagram />
          </div>
        )}
      </div>
    </div>
  );
}
