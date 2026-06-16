'use client';
import { useMemo, useEffect } from 'react';
import { ReactFlow, Background, Controls, Edge, Node, Position, MarkerType, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { useProjectStore } from '@/store/projectStore';
import PertNode from './PertNode';

const nodeTypes = { pertNode: PertNode };

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 60 });

  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 160, height: 80 }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;
    node.position = { x: nodeWithPosition.x - 160 / 2, y: nodeWithPosition.y - 80 / 2 };
    return node;
  });

  return { nodes: layoutedNodes, edges };
};

export default function PertDiagram() {
  const { tasks, dependencies } = useProjectStore();

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes = tasks.map((t) => ({
      id: t.id.toString(),
      type: 'pertNode',
      data: { 
        label: t.name, duration: t.duration, earliestStart: t.earliestStart, earliestFinish: t.earliestFinish,
        latestStart: t.latestStart, latestFinish: t.latestFinish, totalMargin: t.totalMargin,
        freeMargin: t.freeMargin, isCritical: t.isCritical
      },
      position: { x: 0, y: 0 },
    }));

    const edges = dependencies.map((d) => {
      const sourceTask = tasks.find(t => t.id === d.sourceTaskId);
      const targetTask = tasks.find(t => t.id === d.targetTaskId);
      const isCriticalEdge = sourceTask?.isCritical && targetTask?.isCritical;

      return {
        id: `e${d.sourceTaskId}-${d.targetTaskId}`,
        source: d.sourceTaskId.toString(),
        target: d.targetTaskId.toString(),
        type: 'smoothstep',
        animated: isCriticalEdge,
        style: { stroke: isCriticalEdge ? '#f43f5e' : '#cbd5e1', strokeWidth: isCriticalEdge ? 2.5 : 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: isCriticalEdge ? '#f43f5e' : '#cbd5e1' },
      };
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [tasks, dependencies]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => getLayoutedElements(initialNodes, initialEdges), [initialNodes, initialEdges]);
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  if (!tasks || tasks.length === 0) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} nodeTypes={nodeTypes} fitView className="bg-gray-50/30">
        <Background color="#e2e8f0" gap={20} size={1} />
        <Controls showInteractive={false} className="shadow-md border border-gray-100 rounded-lg overflow-hidden bg-white" />
      </ReactFlow>
    </div>
  );
}
