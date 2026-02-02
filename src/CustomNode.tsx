import React from 'react';
import { Handle, Position } from 'reactflow';
import { getNodeTemplate } from './nodeTemplates';
import { FunnelNodeData } from './types';

interface CustomNodeProps {
  data: FunnelNodeData;
}

const CustomNode = React.memo(function CustomNode({ data }: CustomNodeProps) {
  const template = getNodeTemplate(data.type);
  const Icon = template.icon;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md min-w-[160px] hover:shadow-lg transition-shadow">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500"
        aria-label="Connection input"
      />
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1 rounded ${template.color} text-white`} aria-hidden="true">
            <Icon size={16} />
          </div>
          <span className="font-medium text-sm text-gray-800">{data.label}</span>
        </div>
        
        <div className="bg-gray-50 rounded px-2 py-1 text-xs text-gray-600 text-center">
          {data.buttonText}
        </div>
      </div>

      {data.type !== 'thankyou' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-blue-500"
          aria-label="Connection output"
        />
      )}
    </div>
  );
});

export default CustomNode;