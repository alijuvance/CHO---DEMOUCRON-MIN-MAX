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

      <div className="flex flex-col">
        {levels.map((lvl) => (
          <div key={lvl.level} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-4 rounded-xl sm:rounded-none">
            <div className="w-24 shrink-0 flex flex-row sm:flex-col items-baseline sm:items-start gap-2 sm:gap-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Niveau</span>
              <div className="text-3xl font-light text-gray-800 tabular-nums tracking-tight">{lvl.level}</div>
            </div>
            
            <div className="flex flex-wrap gap-3 flex-1 items-center">
              {lvl.tasks.map(t => (
                <div key={t.id} className={`flex items-center gap-2 px-4 py-1.5 border rounded-md text-sm transition-all duration-300 ${t.isCritical ? 'border-rose-200/80 bg-white text-rose-700 shadow-[0_2px_10px_-3px_rgba(244,63,94,0.15)] hover:shadow-[0_4px_15px_-3px_rgba(244,63,94,0.25)] hover:border-rose-300' : 'border-gray-200/80 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'}`}>
                  <span className="font-semibold tracking-wide">{t.name}</span>
                  <span className="text-xs text-gray-400 font-medium">({t.duration}j)</span>
                  {t.isCritical && (
                    <svg className="w-3.5 h-3.5 text-rose-500 ml-0.5 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
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
