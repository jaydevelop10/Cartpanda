import { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './CustomNode';
import NodePalette from './NodePalette';
import { FunnelData, NodeType, FunnelNodeData } from './types';
import { createNode, generateEdgeId, validateFunnel } from './utils';
import { Download, Upload, AlertTriangle } from 'lucide-react';

const nodeTypes = {
  custom: CustomNode,
};

const STORAGE_KEY = 'funnel-builder-data';
const BACKGROUND_GAP = 20;
const BACKGROUND_SIZE = 1;
const ICON_SIZE_SMALL = 14;

interface DeletedItem {
  id: string;
}

function FunnelBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<FunnelNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const funnelData: FunnelData = JSON.parse(saved);
        setNodes(funnelData.nodes);
        setEdges(funnelData.edges);
      } catch (error) {
        console.error('Failed to load saved funnel:', error);
      }
    }
    setIsLoaded(true);
  }, [setNodes, setEdges]);

  // Auto-save to localStorage whenever nodes or edges change (but not on initial load)
  useEffect(() => {
    if (isLoaded) {
      const funnelData: FunnelData = { nodes, edges };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(funnelData));
    }
  }, [nodes, edges, isLoaded]);

  const onNodesDelete = useCallback(
    (deleted: DeletedItem[]) => {
      setNodes((nds) => nds.filter((node) => !deleted.find((d) => d.id === node.id)));
    },
    [setNodes]
  );

  const onEdgesDelete = useCallback(
    (deleted: DeletedItem[]) => {
      setEdges((eds) => eds.filter((edge) => !deleted.find((d) => d.id === edge.id)));
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: generateEdgeId(),
        type: 'smoothstep',
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = createNode(type, position, nodes);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const exportJSON = () => {
    const funnelData: FunnelData = { nodes, edges };
    const dataStr = JSON.stringify(funnelData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'funnel.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Invalid file format');
        }
        
        const funnelData: FunnelData = JSON.parse(result);
        
        // Validate the imported data structure
        if (!funnelData.nodes || !funnelData.edges) {
          throw new Error('Invalid funnel data structure');
        }
        
        setNodes(funnelData.nodes);
        setEdges(funnelData.edges);
      } catch (error) {
        console.error('Import failed:', error);
        // In a real app, use a proper toast/notification system
        const message = error instanceof Error ? error.message : 'Invalid JSON file';
        alert(`Import failed: ${message}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const validationIssues = validateFunnel(nodes, edges);

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <NodePalette onDragStart={onDragStart} />
      
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-white border-b border-gray-200 p-2 lg:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h1 className="text-lg lg:text-xl font-semibold text-gray-800">Funnel Builder</h1>
          
          <div className="flex items-center gap-2 text-xs lg:text-sm">
            {validationIssues.length > 0 && (
              <div 
                className="flex items-center gap-1 text-amber-600"
                role="alert"
                aria-label={`${validationIssues.length} validation issues found`}
              >
                <AlertTriangle size={ICON_SIZE_SMALL} aria-hidden="true" />
                <span>{validationIssues.length} issue(s)</span>
              </div>
            )}
            
            <button
              onClick={exportJSON}
              className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Export funnel as JSON file"
            >
              <Download size={ICON_SIZE_SMALL} aria-hidden="true" />
              <span className="hidden sm:inline">Export</span>
            </button>
            
            <label className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
              <Upload size={ICON_SIZE_SMALL} aria-hidden="true" />
              <span className="hidden sm:inline">Import</span>
              <input
                type="file"
                accept=".json"
                onChange={importJSON}
                className="hidden"
                aria-label="Import funnel from JSON file"
              />
            </label>
          </div>
        </div>

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={BACKGROUND_GAP} size={BACKGROUND_SIZE} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FunnelBuilder />
    </ReactFlowProvider>
  );
}