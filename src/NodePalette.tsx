import { nodeTemplates } from './nodeTemplates';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <div className="w-full lg:w-64 bg-gray-50 border-b lg:border-r lg:border-b-0 border-gray-200 p-2 lg:p-4 overflow-x-auto lg:overflow-x-visible">
      <h3 className="font-semibold text-gray-800 mb-2 lg:mb-4 text-sm lg:text-base">Node Types</h3>
      
      <div className="flex lg:flex-col gap-2 lg:space-y-2 lg:space-x-0 min-w-max lg:min-w-0">
        {nodeTemplates.map((template) => {
          const Icon = template.icon;
          
          return (
            <div
              key={template.type}
              draggable
              onDragStart={(e) => onDragStart(e, template.type)}
              className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3 p-2 lg:p-3 bg-white rounded-lg border border-gray-200 cursor-grab hover:shadow-md transition-shadow min-w-[80px] lg:min-w-0"
            >
              <div className={`p-1 lg:p-2 rounded ${template.color} text-white`}>
                <Icon size={16} className="lg:w-5 lg:h-5" />
              </div>
              <div className="text-center lg:text-left">
                <div className="font-medium text-xs lg:text-sm text-gray-800">{template.label}</div>
                <div className="text-xs text-gray-500 hidden lg:block">{template.buttonText}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}