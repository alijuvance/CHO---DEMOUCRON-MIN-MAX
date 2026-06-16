'use client';
import { useProjectStore } from '@/store/projectStore';
import { useMemo } from 'react';

export default function DemoucronLevels() {
  const { tasks } = useProjectStore();

  const levels = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    // Group tasks by level
    const grouped = tasks.reduce((acc, task) => {
      const level = task.level !== null && task.level !== undefined ? task.level : -1;
      if (!acc[level]) acc[level] = [];
      acc[level].push(task);
      return acc;
    }, {} as Record<number, typeof tasks>);

    // Convert to sorted array
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .map(level => ({
        level,
        tasks: grouped[level]
      }));
  }, [tasks]);

  if (!tasks || tasks.length === 0) return null;
  if (levels.length > 0 && levels[0].level === -1) {
    return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">Les niveaux n'ont pas encore été calculés. Lancez l'analyse pour visualiser la matrice.</div>;
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Affichage par Niveaux (Méthode de Demoucron)</h3>
        <p className="text-sm text-gray-500 mt-1">
          Cette vue montre la décomposition topologique du projet. Chaque niveau représente un ensemble de tâches pouvant être exécutées en parallèle, 
          une fois que toutes les tâches des niveaux précédents sont terminées.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {levels.map((lvl) => (
          <div key={lvl.level} className="flex flex-col sm:flex-row gap-4 items-start sm:items-stretch bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold w-16 sm:w-24 shrink-0 rounded-lg py-4">
              Niveau {lvl.level}
            </div>
            
            <div className="flex flex-wrap gap-3 flex-1 items-center">
              {lvl.tasks.map(t => (
                <div key={t.id} className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium ${t.isCritical ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-700'}`}>
                  <span className="font-bold">{t.name}</span>
                  <span className="text-xs opacity-60">({t.duration}j)</span>
                  {t.isCritical && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
