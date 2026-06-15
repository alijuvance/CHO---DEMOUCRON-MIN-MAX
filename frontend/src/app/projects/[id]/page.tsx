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

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProjectDetails(projectId),
  });

  useEffect(() => {
    if (project) {
      setTasks(project.tasks || []);
      setDependencies(project.dependencies || []);
    }
  }, [project, setTasks, setDependencies]);

  const refreshProject = () => queryClient.invalidateQueries({ queryKey: ['project', projectId] });

  const addTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => { setTaskName(''); setTaskDuration(''); refreshProject(); },
  });

  const removeTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => refreshProject(),
  });

  const addDependencyMutation = useMutation({
    mutationFn: createDependency,
    onSuccess: () => { setSourceTaskId(''); setTargetTaskId(''); setErrorMsg(null); refreshProject(); },
    onError: (error: any) => setErrorMsg(error.message),
  });

  const removeDependencyMutation = useMutation({
    mutationFn: deleteDependency,
    onSuccess: () => refreshProject(),
  });

  const analysisMutation = useMutation({
    mutationFn: runAnalysis,
    onSuccess: () => { setErrorMsg(null); refreshProject(); setActiveTab('pert'); },
    onError: (error: any) => setErrorMsg(error.message),
  });

  // Export CSV Function
  const exportToCSV = () => {
    if (!project || !project.tasks || project.tasks.length === 0) return;
    
    const headers = ["ID", "Nom", "Durée", "Début au plus tôt (MIN)", "Fin au plus tôt", "Début au plus tard (MAX)", "Fin au plus tard", "Marge Totale", "Marge Libre", "Chemin Critique"];
    
    const rows = project.tasks.map((t: any) => [
      t.id,
      t.name,
      t.duration,
      t.earliestStart ?? '',
      t.earliestFinish ?? '',
      t.latestStart ?? '',
      t.latestFinish ?? '',
      t.totalMargin ?? '',
      t.freeMargin ?? '',
      t.isCritical ? 'OUI' : 'NON'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `projet_${project.name.replace(/\s+/g, '_')}_resultats.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-12 text-center text-slate-500 font-medium">Chargement du projet...</div>;
  if (!project) return <div className="p-12 text-center text-red-500">Projet introuvable.</div>;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !taskDuration) return;
    addTaskMutation.mutate({ name: taskName, duration: Number(taskDuration), projectId });
  };

  const handleAddDependency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTaskId || !targetTaskId) return;
    addDependencyMutation.mutate({ sourceTaskId: Number(sourceTaskId), targetTaskId: Number(targetTaskId), projectId });
  };

  // Check if analysis has been run
  const hasBeenAnalyzed = project.tasks && project.tasks.length > 0 && project.tasks[0].earliestStart !== null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Link href="/projects" className="text-sm font-medium text-blue-500 hover:text-blue-700 mb-2 inline-block">← Retour aux Projets</Link>
          <h1 className="text-3xl font-extrabold text-slate-900">{project.name}</h1>
          {project.description && <p className="text-slate-600 mt-1">{project.description}</p>}
        </div>
        
        <div className="flex gap-2">
          {hasBeenAnalyzed && (
            <button 
              onClick={exportToCSV}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-3 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2"
              title="Exporter les dates et marges en fichier Excel/CSV"
            >
              Exporter (CSV)
            </button>
          )}
          <button 
            onClick={() => analysisMutation.mutate(projectId)}
            disabled={analysisMutation.isPending || project.tasks?.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {analysisMutation.isPending ? 'Calcul en cours...' : '▶ Lancer l\'Analyse Min-Max'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
          <p className="text-red-700 font-semibold">Erreur Algorithmique :</p>
          <p className="text-red-600">{errorMsg}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 space-x-8">
        {(['data', 'gantt', 'pert'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              if ((tab === 'gantt' || tab === 'pert') && !hasBeenAnalyzed) {
                alert("Veuillez lancer l'analyse Min-Max avant d'accéder aux vues visuelles.");
                return;
              }
              setActiveTab(tab);
            }}
            className={`pb-3 text-lg font-semibold transition-colors ${
              activeTab === tab 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : ((tab === 'gantt' || tab === 'pert') && !hasBeenAnalyzed) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'data' ? 'Données' : tab === 'gantt' ? 'Gantt' : 'PERT'}
          </button>
        ))}
      </div>

      {activeTab === 'data' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              Tâches
              <span className="bg-slate-100 text-slate-600 text-sm px-2 py-1 rounded-full">{project.tasks?.length || 0}</span>
            </h2>
            
            <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
              <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Nom (ex: A)" className="flex-1 border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
              <input type="number" min="1" value={taskDuration} onChange={(e) => setTaskDuration(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Durée" className="w-24 border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
              <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-700">+</button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-600">
                    <th className="p-2">Nom</th>
                    <th className="p-2 text-center">Durée</th>
                    <th className="p-2 text-center" title="Début au plus tôt">MIN</th>
                    <th className="p-2 text-center" title="Début au plus tard">MAX</th>
                    <th className="p-2 text-center" title="Marge Totale / Libre">MT/ML</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {project.tasks?.map((task: any) => (
                    <tr key={task.id} className={`border-b border-slate-100 hover:bg-slate-50 ${task.isCritical ? 'bg-red-50' : ''}`}>
                      <td className="p-2 font-bold">{task.name}</td>
                      <td className="p-2 text-center">{task.duration}</td>
                      <td className="p-2 text-center">{task.earliestStart !== null ? task.earliestStart : '-'}</td>
                      <td className="p-2 text-center">{task.latestStart !== null ? task.latestStart : '-'}</td>
                      <td className="p-2 text-center font-mono text-xs">
                        {task.totalMargin !== null ? `${task.totalMargin} / ${task.freeMargin}` : '-'}
                      </td>
                      <td className="p-2 text-right">
                        <button onClick={() => removeTaskMutation.mutate(task.id)} className="text-red-500 hover:text-red-700 font-medium">✕</button>
                      </td>
                    </tr>
                  ))}
                  {project.tasks?.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-slate-500">Ajoutez une tâche.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              Dépendances
              <span className="bg-slate-100 text-slate-600 text-sm px-2 py-1 rounded-full">{project.dependencies?.length || 0}</span>
            </h2>
            
            <form onSubmit={handleAddDependency} className="flex gap-2 mb-6 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Source</label>
                <select value={sourceTaskId} onChange={(e) => setSourceTaskId(e.target.value)} className="w-full border p-2 rounded-md bg-white" required>
                  <option value="" disabled>Choix...</option>
                  {project.tasks?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="text-slate-400 font-bold px-1 py-2">→</div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Cible</label>
                <select value={targetTaskId} onChange={(e) => setTargetTaskId(e.target.value)} className="w-full border p-2 rounded-md bg-white" required>
                  <option value="" disabled>Choix...</option>
                  {project.tasks?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-700">+</button>
            </form>

            <ul className="space-y-2">
              {project.dependencies?.map((dep: any) => {
                const source = project.tasks?.find((t: any) => t.id === dep.sourceTaskId);
                const target = project.tasks?.find((t: any) => t.id === dep.targetTaskId);
                return (
                  <li key={dep.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-medium text-slate-700 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{source?.name || '?'}</span> 
                      <span className="mx-2 text-slate-400">avant</span> 
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{target?.name || '?'}</span>
                    </span>
                    <button onClick={() => removeDependencyMutation.mutate(dep.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">✕</button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'gantt' && hasBeenAnalyzed && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <GanttChart />
        </div>
      )}

      {activeTab === 'pert' && hasBeenAnalyzed && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <PertDiagram />
        </div>
      )}
    </div>
    </div>
  );
}