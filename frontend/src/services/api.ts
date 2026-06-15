/**
 * Configuration de l'API Client
 * Regroupe tous les appels vers le Backend NestJS
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// === PROJETS ===

// Récupère la liste de tous les projets
export const fetchProjects = async () => {
  const res = await fetch(`${API_URL}/projects`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des projets');
  return res.json();
};

// Récupère les détails d'un projet spécifique (avec ses tâches et dépendances)
export const fetchProjectDetails = async (id: number) => {
  const res = await fetch(`${API_URL}/projects/${id}`);
  if (!res.ok) throw new Error('Erreur lors de la récupération du projet');
  return res.json();
};

// Crée un nouveau projet
export const createProject = async (data: { name: string; description?: string }) => {
  const res = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erreur lors de la création du projet');
  return res.json();
};

// Supprime un projet
export const deleteProject = async (id: number) => {
  const res = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression du projet');
  return res.json();
};

// === TÂCHES ===

// Ajoute une nouvelle tâche au projet
export const createTask = async (data: { name: string; duration: number; projectId: number }) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erreur lors de la création de la tâche');
  return res.json();
};

// Supprime une tâche existante
export const deleteTask = async (id: number) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression de la tâche');
  return res.json();
};

// === DÉPENDANCES ===

// Ajoute une dépendance entre deux tâches (Tâche A -> Tâche B)
export const createDependency = async (data: { sourceTaskId: number; targetTaskId: number; projectId: number }) => {
  const res = await fetch(`${API_URL}/dependencies`, {
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
  const res = await fetch(`${API_URL}/dependencies/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression de la dépendance');
  return res.json();
};

// === ANALYSE ALGORITHMIQUE ===

// Déclenche l'algorithme de Demoucron et l'analyse Min-Max sur le backend
export const runAnalysis = async (projectId: number) => {
  const res = await fetch(`${API_URL}/analysis/${projectId}/run`, { method: 'POST' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erreur lors de l\'analyse algorithmique');
  }
  return res.json();
};