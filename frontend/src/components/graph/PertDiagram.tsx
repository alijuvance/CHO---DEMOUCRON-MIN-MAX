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
      id: `e${d.sourceTaskId}-${d.targetTaskId}`,
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