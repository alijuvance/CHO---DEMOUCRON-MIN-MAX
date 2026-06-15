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
    <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="container mx-auto p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Mes Projets</h1>
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
                <Link href={`/projects/${project.id}`}>
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
    </div>
  );
}