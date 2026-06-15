import { Handle, Position } from '@xyflow/react';

export default function PertNode({ data }: any) {
  const { name, duration, earliestStart, earliestFinish, latestStart, latestFinish, totalMargin, freeMargin, isCritical } = data;
  
  const hasData = earliestStart !== null;

  if (!hasData) {
    return (
      <div className="border-2 border-slate-300 rounded-md shadow-md bg-white w-32 text-center p-4">
        <Handle type="target" position={Position.Top} className="w-2 h-2" />
        <div className="font-bold text-slate-700">{name}</div>
        <div className="text-sm text-slate-400">{duration} j</div>
        <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      </div>
    );
  }

  return (
    <div className={`border-2 rounded-md shadow-md bg-white w-48 text-sm font-sans ${isCritical ? 'border-red-500' : 'border-slate-300'}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className={`text-center font-bold p-2 border-b-2 ${isCritical ? 'bg-red-50 text-red-700 border-red-500' : 'bg-slate-50 border-slate-300'}`}>
        {name}
      </div>
      <div className="grid grid-cols-3 text-center">
        <div className="p-1 border-r border-b border-slate-200 font-semibold" title="Début au plus tôt">{earliestStart}</div>
        <div className="p-1 border-r border-b border-slate-200 bg-slate-50" title="Durée">{duration}</div>
        <div className="p-1 border-b border-slate-200 font-semibold" title="Fin au plus tôt">{earliestFinish}</div>
      </div>
      <div className="grid grid-cols-3 text-center">
        <div className="p-1 border-r border-slate-200" title="Début au plus tard">{latestStart}</div>
        <div className="p-1 border-r border-slate-200 bg-slate-50 text-xs text-slate-500 flex flex-col items-center justify-center">
          <span title="Marge Totale">MT:{totalMargin}</span>
          <span title="Marge Libre" className="text-blue-500">ML:{freeMargin}</span>
        </div>
        <div className="p-1" title="Fin au plus tard">{latestFinish}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}