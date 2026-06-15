'use client';
import { Gantt, Task as GanttTask } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useProjectStore } from '@/store/projectStore';
import { useMemo } from 'react';

export default function GanttChart() {
  const tasks = useProjectStore((state) => state.tasks);
  const dependencies = useProjectStore((state) => state.dependencies);

  const ganttTasks: GanttTask[] = useMemo(() => {
    if (tasks.length === 0 || tasks[0].earliestStart === null) return [];
    
    // Create base date exactly at midnight to avoid timezone shifts
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    return tasks.map(t => {
      const start = new Date(baseDate);
      start.setDate(start.getDate() + (t.earliestStart || 0));
      
      const end = new Date(baseDate);
      end.setDate(end.getDate() + (t.earliestFinish || t.duration));

      const deps = dependencies
        .filter(d => d.targetTaskId === t.id)
        .map(d => d.sourceTaskId.toString());

      return {
        id: t.id.toString(),
        name: t.name,
        start,
        end,
        progress: 100,
        type: 'task',
        project: t.id.toString(),
        dependencies: deps,
        styles: {
          backgroundColor: t.isCritical ? '#ef4444' : '#3b82f6',
          progressColor: t.isCritical ? '#dc2626' : '#2563eb',
        }
      };
    });
  }, [tasks, dependencies]);

  if (ganttTasks.length === 0) {
    return <div className="p-4 text-center text-slate-500">L'analyse n'a pas encore été effectuée ou aucune tâche n'est présente.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <Gantt 
        tasks={ganttTasks} 
        viewMode={'Day' as any} 
        listCellWidth={155} 
        columnWidth={60} 
      />
    </div>
  );
}