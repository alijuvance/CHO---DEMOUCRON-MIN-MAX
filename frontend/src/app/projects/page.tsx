'use client';
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
            {projects?.map((project: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, i: number) => (
              <div 
                key={project.id} 
                className={`group bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_-6px_rgba(99,102,241,0.08)] transition-all duration-300 flex flex-col justify-between animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.05}s` }}
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
                  <Link href={`/projects/${project.id}`} className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
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
                <p className="text-sm text-gray-500 mt-1">Créez votre premier projet d&apos;ordonnancement ci-dessus.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
