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