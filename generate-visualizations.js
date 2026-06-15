const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  const fullPath = path.join(__dirname, 'frontend', 'src', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
};

write('components/graph/PertNode.tsx', `
import { Handle, Position } from '@xyflow/react';

export default function PertNode({ data }: any) {
  const { name, duration, earliestStart, earliestFinish, latestStart, latestFinish, totalMargin, isCritical } = data;
  
  return (
    <div className={\`border-2 rounded-md shadow-md bg-white w-48 text-sm font-sans \${isCritical ? 'border-red-500' : 'border-slate-300'}\`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className={\`text-center font-bold p-2 border-b-2 \${isCritical ? 'bg-red-50 text-red-700 border-red-500' : 'bg-slate-50 border-slate-300'}\`}>
        {name}
      </div>
      <div className="grid grid-cols-3 text-center">
        <div className="p-1 border-r border-b border-slate-200">{earliestStart}</div>
        <div className="p-1 border-r border-b border-slate-200 bg-slate-50">{duration}</div>
        <div className="p-1 border-b border-slate-200">{earliestFinish}</div>
      </div>
      <div className="grid grid-cols-3 text-center">
        <div className="p-1 border-r border-slate-200">{latestStart}</div>
        <div className="p-1 border-r border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-center">M={totalMargin}</div>
        <div className="p-1">{latestFinish}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}
`);

write('components/graph/PertDiagram.tsx', `
'use client';
import { useCallback, useMemo } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import PertNode from './PertNode';
import { useProjectStore } from '@/store/projectStore';

const nodeTypes = { pertNode: PertNode };

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 200;
  const nodeHeight = 100;

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'TB' ? 'top' : 'left';
    node.sourcePosition = direction === 'TB' ? 'bottom' : 'right';
    
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

export default function PertDiagram() {
  const tasks = useProjectStore((state) => state.tasks);
  const dependencies = useProjectStore((state) => state.dependencies);

  const initialNodes = useMemo(() => tasks.map(t => ({
    id: t.id.toString(),
    type: 'pertNode',
    data: { ...t },
    position: { x: 0, y: 0 }
  })), [tasks]);

  const initialEdges = useMemo(() => dependencies.map(d => {
    const sourceTask = tasks.find(t => t.id === d.sourceTaskId);
    const targetTask = tasks.find(t => t.id === d.targetTaskId);
    const isCriticalEdge = sourceTask?.isCritical && targetTask?.isCritical;
    return {
      id: \`e\${d.sourceTaskId}-\${d.targetTaskId}\`,
      source: d.sourceTaskId.toString(),
      target: d.targetTaskId.toString(),
      animated: true,
      style: { stroke: isCriticalEdge ? '#ef4444' : '#94a3b8', strokeWidth: isCriticalEdge ? 3 : 1 },
    };
  }), [dependencies, tasks]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  return (
    <div style={{ width: '100%', height: '600px' }} className="border border-slate-200 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
`);

write('components/gantt/GanttChart.tsx', `
'use client';
import { Gantt, Task as GanttTask } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useProjectStore } from '@/store/projectStore';
import { useMemo } from 'react';

export default function GanttChart() {
  const tasks = useProjectStore((state) => state.tasks);
  const dependencies = useProjectStore((state) => state.dependencies);

  const ganttTasks: GanttTask[] = useMemo(() => {
    if (tasks.length === 0) return [];
    
    // We need a base date since Demoucron works with relative integers
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
        project: t.id.toString(), // Grouping
        dependencies: deps,
        styles: {
          backgroundColor: t.isCritical ? '#ef4444' : '#3b82f6',
          progressColor: t.isCritical ? '#dc2626' : '#2563eb',
        }
      };
    });
  }, [tasks, dependencies]);

  if (ganttTasks.length === 0) {
    return <div className="p-4 text-center text-slate-500">Aucune tâche à afficher.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <Gantt 
        tasks={ganttTasks} 
        viewMode={'Day' as any} 
        listCellWidth={155} 
        columnWidth={60} 
      />
    </div>
  );
}
`);

console.log("Visualization components generated successfully!");
