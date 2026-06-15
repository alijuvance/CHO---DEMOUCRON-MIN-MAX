const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  const fullPath = path.join(__dirname, 'frontend', 'src', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
};

// 1. SERVICES / API
write('services/api.ts', `
/**
 * Configuration de l'API Client
 * Regroupe tous les appels vers le Backend NestJS
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// === PROJETS ===

// Récupère la liste de tous les projets
export const fetchProjects = async () => {
  const res = await fetch(\`\${API_URL}/projects\`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des projets');
  return res.json();
};

// Récupère les détails d'un projet spécifique (avec ses tâches et dépendances)
export const fetchProjectDetails = async (id: number) => {
  const res = await fetch(\`\${API_URL}/projects/\${id}\`);
  if (!res.ok) throw new Error('Erreur lors de la récupération du projet');
  return res.json();
};

// Crée un nouveau projet
export const createProject = async (data: { name: string; description?: string }) => {
  const res = await fetch(\`\${API_URL}/projects\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erreur lors de la création du projet');
  return res.json();
};

// Supprime un projet
export const deleteProject = async (id: number) => {
  const res = await fetch(\`\${API_URL}/projects/\${id}\`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression du projet');
  return res.json();
};

// === TÂCHES ===

// Ajoute une nouvelle tâche au projet
export const createTask = async (data: { name: string; duration: number; projectId: number }) => {
  const res = await fetch(\`\${API_URL}/tasks\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erreur lors de la création de la tâche');
  return res.json();
};

// Supprime une tâche existante
export const deleteTask = async (id: number) => {
  const res = await fetch(\`\${API_URL}/tasks/\${id}\`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression de la tâche');
  return res.json();
};

// === DÉPENDANCES ===

// Ajoute une dépendance entre deux tâches (Tâche A -> Tâche B)
export const createDependency = async (data: { sourceTaskId: number; targetTaskId: number; projectId: number }) => {
  const res = await fetch(\`\${API_URL}/dependencies\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erreur lors de la création de la dépendance');
  }
  return res.json();
};

// Supprime une dépendance existante
export const deleteDependency = async (id: number) => {
  const res = await fetch(\`\${API_URL}/dependencies/\${id}\`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression de la dépendance');
  return res.json();
};

// === ANALYSE ALGORITHMIQUE ===

// Déclenche l'algorithme de Demoucron et l'analyse Min-Max sur le backend
export const runAnalysis = async (projectId: number) => {
  const res = await fetch(\`\${API_URL}/analysis/\${projectId}/run\`, { method: 'POST' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erreur lors de l\\'analyse algorithmique');
  }
  return res.json();
};
`);

// 2. PROJECT STORE
write('store/projectStore.ts', `
/**
 * Project Store (Zustand)
 * Permet de partager l'état du projet (Tâches, Dépendances) entre les composants visuels (Gantt, PERT)
 * sans avoir à passer les props manuellement à travers chaque composant parent.
 */
import { create } from 'zustand';

export interface Task {
  id: number;
  name: string;
  duration: number;
  projectId: number;
  // Champs calculés par l'algorithme (peuvent être nuls si l'analyse n'a pas été lancée)
  level: number | null;
  earliestStart: number | null;
  earliestFinish: number | null;
  latestStart: number | null;
  latestFinish: number | null;
  totalMargin: number | null;
  freeMargin: number | null;
  isCritical: boolean;
}

export interface Dependency {
  id: number;
  sourceTaskId: number;
  targetTaskId: number;
  projectId: number;
}

interface ProjectState {
  tasks: Task[];
  dependencies: Dependency[];
  setTasks: (tasks: Task[]) => void;
  setDependencies: (deps: Dependency[]) => void;
}

// Création du store Zustand
export const useProjectStore = create<ProjectState>((set) => ({
  tasks: [],
  dependencies: [],
  setTasks: (tasks) => set({ tasks }),
  setDependencies: (dependencies) => set({ dependencies }),
}));
`);

// 3. PROJECTS PAGE (Dashboard & Création)
write('app/projects/page.tsx', `
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProjects, createProject, deleteProject } from '@/services/api';
import Link from 'next/link';

/**
 * Page Dashboard des Projets
 * Permet de lister les projets existants et d'en créer de nouveaux.
 */
export default function Projects() {
  const queryClient = useQueryClient(); // Utilisé pour rafraîchir la liste après un ajout
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Requête GET pour récupérer les projets
  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  // Mutation POST pour créer un projet
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      setName('');
      setDescription('');
      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Mutation DELETE pour supprimer un projet
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
    <div className="container mx-auto p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Mes Projets de RO</h1>
        <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors font-medium">
          ← Retour à l'accueil
        </Link>
      </div>

      {/* Formulaire de création intégré (Inline Form) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Créer un nouveau projet</h2>
        <form onSubmit={handleCreate} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-600 mb-1">Nom du projet</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              placeholder="Ex: Construction Usine" 
              required 
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-600 mb-1">Description (Optionnel)</label>
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              placeholder="Ex: Optimisation phase 1" 
            />
          </div>
          <button 
            type="submit" 
            disabled={createMutation.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? 'Création...' : 'Créer'}
          </button>
        </form>
      </div>

      {/* Liste des Projets */}
      {isLoading ? (
        <div className="text-center text-slate-500 py-12">Chargement des projets...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects?.map((project: any) => (
            <div key={project.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-slate-800">{project.name}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">{project.description || 'Aucune description fournie.'}</p>
              </div>
              <div className="flex justify-between items-center">
                <Link href={\`/projects/\${project.id}\`}>
                  <span className="text-blue-600 font-semibold hover:text-blue-800">Gérer le projet →</span>
                </Link>
                <button 
                  onClick={() => { if(confirm('Supprimer définitivement ce projet ?')) deleteMutation.mutate(project.id) }}
                  className="text-red-400 hover:text-red-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {projects?.length === 0 && (
            <div className="col-span-full text-center p-12 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-500">
              Aucun projet trouvé. Commencez par en créer un ci-dessus !
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`);

// 4. PROJECT DETAILS PAGE (Onglets, CRUD Tâches/Dépendances, Analyse)
write('app/projects/[id]/page.tsx', `
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchProjectDetails, createTask, deleteTask, createDependency, deleteDependency, runAnalysis } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import PertDiagram from '@/components/graph/PertDiagram';
import GanttChart from '@/components/gantt/GanttChart';

/**
 * Vue détaillée d'un Projet
 * Centralise l'ajout des tâches, l'ajout des dépendances, le lancement du calcul, et la visualisation.
 */
export default function ProjectDetail() {
  const params = useParams();
  const projectId = Number(params.id);
  const queryClient = useQueryClient();
  
  // Onglets actifs ('data', 'gantt', 'pert')
  const [activeTab, setActiveTab] = useState<'data' | 'gantt' | 'pert'>('data');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States pour les formulaires
  const [taskName, setTaskName] = useState('');
  const [taskDuration, setTaskDuration] = useState<number | ''>('');
  const [sourceTaskId, setSourceTaskId] = useState<number | ''>('');
  const [targetTaskId, setTargetTaskId] = useState<number | ''>('');

  // Synchronisation avec le store Zustand
  const setTasks = useProjectStore(state => state.setTasks);
  const setDependencies = useProjectStore(state => state.setDependencies);

  // Récupération des données du projet
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProjectDetails(projectId),
  });

  // Mettre à jour Zustand lorsque les données arrivent du backend
  useEffect(() => {
    if (project) {
      setTasks(project.tasks || []);
      setDependencies(project.dependencies || []);
    }
  }, [project, setTasks, setDependencies]);

  // === MUTATIONS (Actions de modification) ===
  
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
    onSuccess: () => { setErrorMsg(null); refreshProject(); setActiveTab('pert'); }, // Basculer sur PERT si succès
    onError: (error: any) => setErrorMsg(error.message),
  });

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

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Link href="/projects" className="text-sm font-medium text-slate-500 hover:text-slate-800 mb-2 inline-block">← Retour aux Projets</Link>
          <h1 className="text-3xl font-extrabold text-slate-900">{project.name}</h1>
          {project.description && <p className="text-slate-600 mt-1">{project.description}</p>}
        </div>
        
        {/* Bouton d'Analyse Algorithmique */}
        <button 
          onClick={() => analysisMutation.mutate(projectId)}
          disabled={analysisMutation.isPending || project.tasks?.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {analysisMutation.isPending ? 'Calcul en cours...' : '▶ Lancer l\\'Analyse Min-Max'}
        </button>
      </div>

      {/* Affichage des erreurs globales (ex: Cycle détecté) */}
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
          <p className="text-red-700 font-semibold">Erreur Algorithmique :</p>
          <p className="text-red-600">{errorMsg}</p>
        </div>
      )}

      {/* Système d'onglets (Tabs) */}
      <div className="flex border-b border-slate-200 mb-6 space-x-8">
        {(['data', 'gantt', 'pert'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={\`pb-3 text-lg font-semibold transition-colors \${
              activeTab === tab 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-slate-500 hover:text-slate-700'
            }\`}
          >
            {tab === 'data' ? '🗂️ Données (Tâches & Liens)' : tab === 'gantt' ? '📅 Gantt' : '🕸️ Réseau PERT'}
          </button>
        ))}
      </div>

      {/* CONTENU DE L'ONGLET SÉLECTIONNÉ */}
      
      {activeTab === 'data' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLONNE GAUCHE : TÂCHES */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              Liste des Tâches
              <span className="bg-slate-100 text-slate-600 text-sm px-2 py-1 rounded-full">{project.tasks?.length || 0}</span>
            </h2>
            
            {/* Formulaire Ajout Tâche */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
              <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Nom (ex: A)" className="flex-1 border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
              <input type="number" min="1" value={taskDuration} onChange={(e) => setTaskDuration(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Durée" className="w-24 border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
              <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-700">+</button>
            </form>

            {/* Tableau des Tâches */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-600 text-sm">
                    <th className="p-2">ID</th>
                    <th className="p-2">Nom</th>
                    <th className="p-2">Durée</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {project.tasks?.map((task: any) => (
                    <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2 text-slate-400">#{task.id}</td>
                      <td className="p-2 font-semibold">{task.name}</td>
                      <td className="p-2">{task.duration} j</td>
                      <td className="p-2 text-right">
                        <button onClick={() => removeTaskMutation.mutate(task.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                  {project.tasks?.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-500">Aucune tâche. Ajoutez-en une.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* COLONNE DROITE : DÉPENDANCES */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              Dépendances (Antériorités)
              <span className="bg-slate-100 text-slate-600 text-sm px-2 py-1 rounded-full">{project.dependencies?.length || 0}</span>
            </h2>
            
            {/* Formulaire Ajout Dépendance */}
            <form onSubmit={handleAddDependency} className="flex gap-2 mb-6 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Tâche Source (Prérequis)</label>
                <select value={sourceTaskId} onChange={(e) => setSourceTaskId(e.target.value)} className="w-full border p-2 rounded-md bg-white" required>
                  <option value="" disabled>Sélectionner...</option>
                  {project.tasks?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="text-slate-400 font-bold px-2 py-2">→</div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Tâche Cible</label>
                <select value={targetTaskId} onChange={(e) => setTargetTaskId(e.target.value)} className="w-full border p-2 rounded-md bg-white" required>
                  <option value="" disabled>Sélectionner...</option>
                  {project.tasks?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-700">+</button>
            </form>

            {/* Liste des Dépendances */}
            <ul className="space-y-2">
              {project.dependencies?.map((dep: any) => {
                const source = project.tasks?.find((t: any) => t.id === dep.sourceTaskId);
                const target = project.tasks?.find((t: any) => t.id === dep.targetTaskId);
                return (
                  <li key={dep.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-medium text-slate-700">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{source?.name || 'Inconnu'}</span> 
                      <span className="mx-2 text-slate-400">doit précéder</span> 
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{target?.name || 'Inconnu'}</span>
                    </span>
                    <button onClick={() => removeDependencyMutation.mutate(dep.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">✕</button>
                  </li>
                );
              })}
              {project.dependencies?.length === 0 && <div className="text-center text-slate-500 py-4">Aucune dépendance définie.</div>}
            </ul>
          </div>
        </div>
      )}

      {/* ONGLET GANTT */}
      {activeTab === 'gantt' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-xl font-bold mb-4">Diagramme de Gantt</h2>
          <p className="text-slate-500 mb-6 text-sm">Affiche la planification temporelle en fonction des dates "au plus tôt". Les tâches rouges appartiennent au chemin critique.</p>
          <GanttChart />
        </div>
      )}

      {/* ONGLET PERT */}
      {activeTab === 'pert' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-xl font-bold mb-4">Réseau PERT & Chemin Critique</h2>
          <p className="text-slate-500 mb-6 text-sm">Graphe modélisant les liens entre les tâches. Le chemin critique (marge = 0) est mis en surbrillance en rouge.</p>
          <PertDiagram />
        </div>
      )}

    </div>
  );
}
`);

console.log("Frontend UI files generated with extensive comments!");
