'use client';
import { useProjectStore } from '@/store/projectStore';
import { useMemo } from 'react';

export default function GanttChart() {
  const { tasks, dependencies } = useProjectStore();

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
              <rect x={barX} y={y + 12} width={Math.max(barWidth, 4)} height={24} rx="12" className={`${isCritical ? 'fill-rose-500' : 'fill-indigo-500'} shadow-sm`} opacity="0.9" />
              {barWidth > 30 && (
                <text x={barX + barWidth / 2} y={y + 28} textAnchor="middle" className="text-[10px] font-bold fill-white pointer-events-none">{task.duration}j</text>
              )}
            </g>
          );
        })}
        
        {/* Flèches de dépendances */}
        {dependencies?.map((dep) => {
          const sourceTask = sortedTasks.find(t => t.id === dep.sourceTaskId);
          const targetTask = sortedTasks.find(t => t.id === dep.targetTaskId);
          if (!sourceTask || !targetTask) return null;

          const sourceIndex = sortedTasks.findIndex(t => t.id === dep.sourceTaskId);
          const targetIndex = sortedTasks.findIndex(t => t.id === dep.targetTaskId);

          const sourceEs = sourceTask.earliestStart || 0;
          const sourceDuration = sourceTask.duration || 0;
          const targetEs = targetTask.earliestStart || 0;

          // Coordonnées de départ (fin de la tâche source)
          const startX = 100 + (sourceEs + sourceDuration) * dayWidth;
          const startY = headerHeight + sourceIndex * rowHeight + 24;

          // Coordonnées d'arrivée (début de la tâche cible)
          const endX = 100 + targetEs * dayWidth;
          const endY = headerHeight + targetIndex * rowHeight + 24;

          // Dessin d'un chemin en "S" ou en angle droit
          const isCriticalEdge = sourceTask.isCritical && targetTask.isCritical;
          const strokeColor = isCriticalEdge ? '#f43f5e' : '#94a3b8'; // Rose pour chemin critique, gris pour normal
          const midX = startX + 15; // Point d'inflexion

          return (
            <g key={`dep-${dep.id}`}>
              <path 
                d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX - 5} ${endY}`} 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth="1.5" 
                strokeOpacity="0.6"
              />
              <polygon 
                points={`${endX - 5},${endY - 3} ${endX},${endY} ${endX - 5},${endY + 3}`} 
                fill={strokeColor} 
                opacity="0.8"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
