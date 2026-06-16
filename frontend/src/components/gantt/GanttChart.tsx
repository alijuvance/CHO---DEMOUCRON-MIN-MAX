'use client';
import { useProjectStore } from '@/store/projectStore';
import { useMemo } from 'react';

export default function GanttChart() {
  const { tasks, dependencies } = useProjectStore();

  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;
    const maxDuration = Math.max(...tasks.map(t => t.latestFinish || t.earliestFinish || 0));
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.earliestStart !== b.earliestStart) return (a.earliestStart || 0) - (b.earliestStart || 0);
      return (a.totalMargin || 0) - (b.totalMargin || 0);
    });
    return { maxDuration, sortedTasks };
  }, [tasks]);

  if (!chartData) return null;
  const { maxDuration, sortedTasks } = chartData;

  const dayWidth = 45; 
  const headerHeight = 50;
  const rowHeight = 48;
  const svgWidth = (maxDuration + 2) * dayWidth; // Extra space
  const totalHeight = sortedTasks.length * rowHeight + headerHeight;

  return (
    <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm w-full font-sans text-sm" style={{ height: totalHeight + 2 }}>
      
      {/* Panneau Gauche : Tableau (Fixe) */}
      <div className="w-[380px] shrink-0 border-r border-gray-200 bg-white z-10 flex flex-col">
        {/* Header Tableau */}
        <div className="flex items-center h-[50px] border-b border-gray-200 bg-gray-50/80 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
          <div className="w-10">N°</div>
          <div className="flex-1">Nom de la Tâche</div>
          <div className="w-14 text-center">Durée</div>
          <div className="w-16 text-center" title="Début au plus tôt">Début</div>
          <div className="w-16 text-center" title="Fin au plus tôt">Fin</div>
        </div>
        
        {/* Lignes du Tableau */}
        <div className="flex-1 overflow-hidden bg-white">
          {sortedTasks.map((task, index) => (
            <div key={`row-${task.id}`} className="flex items-center px-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors" style={{ height: `${rowHeight}px` }}>
              <div className="w-10 font-mono text-gray-400 text-xs">{index + 1}</div>
              <div className="flex-1 font-medium text-gray-800 truncate pr-2" title={task.name}>{task.name}</div>
              <div className="w-14 text-center text-gray-600 font-medium">{task.duration}j</div>
              <div className="w-16 text-center text-gray-500">J{task.earliestStart}</div>
              <div className="w-16 text-center text-gray-500">J{task.earliestFinish}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau Droit : SVG Gantt Chart (Défilable) */}
      <div className="flex-1 overflow-x-auto relative bg-[#fafafa] custom-scrollbar">
        <svg width={svgWidth} height={totalHeight} className="block">
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0,0 6,3 0,6" fill="#94a3b8" />
            </marker>
            <marker id="arrowhead-critical" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0,0 6,3 0,6" fill="#f43f5e" />
            </marker>
          </defs>

          {/* Grille Temporelle */}
          <g>
            <rect x="0" y="0" width={svgWidth} height={headerHeight} fill="#f9fafb" className="border-b border-gray-200" />
            <line x1="0" y1={headerHeight} x2={svgWidth} y2={headerHeight} stroke="#e5e7eb" strokeWidth="1" />
            
            {Array.from({ length: maxDuration + 2 }).map((_, i) => (
              <g key={`grid-${i}`}>
                {/* Colonnes alternées */}
                {i % 2 !== 0 && (
                  <rect x={i * dayWidth} y={headerHeight} width={dayWidth} height={totalHeight - headerHeight} fill="#f1f5f9" opacity="0.4" />
                )}
                {/* Lignes verticales de grille */}
                <line x1={i * dayWidth} y1={headerHeight} x2={i * dayWidth} y2={totalHeight} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
                
                {/* En-tête des jours */}
                <text x={i * dayWidth + dayWidth / 2} y={30} textAnchor="middle" className="text-[11px] font-semibold fill-gray-500">J{i}</text>
              </g>
            ))}
          </g>

          {/* Marges et Barres des Tâches */}
          {sortedTasks.map((task, index) => {
            const y = headerHeight + index * rowHeight;
            const es = task.earliestStart || 0;
            const duration = task.duration || 0;
            const freeMargin = task.freeMargin || 0;
            const totalMargin = task.totalMargin || 0;
            
            const barX = es * dayWidth;
            const barWidth = duration * dayWidth;
            const freeMarginWidth = freeMargin * dayWidth;
            const totalMarginWidth = totalMargin * dayWidth;
            
            const isCritical = task.isCritical;
            const isMilestone = duration === 0;

            return (
              <g key={`bar-${task.id}`} className="group">
                {/* Hover line background */}
                <rect x="0" y={y} width={svgWidth} height={rowHeight} fill="transparent" className="hover:fill-black/5 transition-colors cursor-default" />
                
                {/* Marge Totale (Ligne continue) */}
                {totalMarginWidth > 0 && (
                  <rect x={barX + barWidth} y={y + rowHeight/2 - 2} width={totalMarginWidth} height={4} rx="2" fill="#cbd5e1" opacity="0.6" />
                )}

                {/* Marge Libre (Ligne pointillée) */}
                {freeMarginWidth > 0 && (
                  <line x1={barX + barWidth} y1={y + rowHeight/2} x2={barX + barWidth + freeMarginWidth} y2={y + rowHeight/2} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                )}

                {/* Barre de durée */}
                {!isMilestone ? (
                  <g>
                    <rect x={barX} y={y + 10} width={Math.max(barWidth, 4)} height={28} rx="6" className={`${isCritical ? 'fill-rose-500' : 'fill-indigo-500'} shadow-sm`} opacity="0.9" />
                  </g>
                ) : (
                  // Jalon (Milestone)
                  <polygon points={`${barX},${y+10} ${barX+10},${y+24} ${barX},${y+38} ${barX-10},${y+24}`} className={`${isCritical ? 'fill-rose-500' : 'fill-indigo-500'}`} />
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

            const startX = (sourceEs + sourceDuration) * dayWidth;
            const startY = headerHeight + sourceIndex * rowHeight + rowHeight / 2;
            
            const endX = targetEs * dayWidth;
            const endY = headerHeight + targetIndex * rowHeight + rowHeight / 2;

            const isCriticalEdge = sourceTask.isCritical && targetTask.isCritical;
            const strokeColor = isCriticalEdge ? '#f43f5e' : '#94a3b8';
            const markerId = isCriticalEdge ? 'url(#arrowhead-critical)' : 'url(#arrowhead)';

            let pathD = '';
            
            if (startX <= endX - 10) {
              const midX = startX + 10;
              pathD = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX - 2} ${endY}`;
            } else {
              const midX = startX + 10;
              const backX = endX - 10;
              const midY = startY + (endY - startY) / 2;
              pathD = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${midY} L ${backX} ${midY} L ${backX} ${endY} L ${endX - 2} ${endY}`;
            }

            return (
              <path 
                key={`dep-${dep.id}`}
                d={pathD} 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth="1.5" 
                strokeOpacity="0.8"
                markerEnd={markerId}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
