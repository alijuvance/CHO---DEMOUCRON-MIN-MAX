import { Handle, Position } from '@xyflow/react';

export default function PertNode({ data }: { data: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) {
  const isCritical = data.isCritical;
  
  return (
    <div className={`w-[160px] bg-white rounded-xl shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] border-y border-r ${isCritical ? 'border-l-4 border-l-rose-500 border-y-rose-100 border-r-rose-100 shadow-rose-500/10' : 'border-l-4 border-l-indigo-400 border-y-gray-100 border-r-gray-100'} overflow-hidden transition-all hover:shadow-md`}>
      <div className={`text-center py-2 border-b ${isCritical ? 'border-rose-50 bg-rose-50/30 text-rose-700' : 'border-gray-50 bg-gray-50/50 text-gray-700'} font-bold text-sm`}>
        {data.label}
      </div>
      <div className="grid grid-cols-3 text-center border-b border-gray-50 text-xs">
        <div className="py-1.5 font-medium text-gray-600 border-r border-gray-50">{data.earliestStart ?? '-'}</div>
        <div className="py-1.5 font-semibold text-gray-900 border-r border-gray-50 bg-gray-50/30">{data.duration}</div>
        <div className="py-1.5 font-medium text-gray-600">{data.earliestFinish ?? '-'}</div>
      </div>
      <div className="grid grid-cols-3 text-center text-[10px]">
        <div className="py-1.5 font-medium text-gray-500 border-r border-gray-50">{data.latestStart ?? '-'}</div>
        <div className="py-1 border-r border-gray-50 flex flex-col justify-center items-center bg-gray-50/30">
          <span className={`font-semibold ${isCritical ? 'text-rose-500' : 'text-indigo-500'}`}>MT:{data.totalMargin ?? '-'}</span>
          <span className="text-gray-400 font-medium">ML:{data.freeMargin ?? '-'}</span>
        </div>
        <div className="py-1.5 font-medium text-gray-500">{data.latestFinish ?? '-'}</div>
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-gray-300 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-gray-300 border-white" />
    </div>
  );
}
