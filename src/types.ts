import { Node, Edge } from 'reactflow';

export type NodeType = 'sales' | 'order' | 'upsell' | 'downsell' | 'thankyou';

export interface FunnelNodeData {
  label: string;
  buttonText: string;
  type: NodeType;
}

export type FunnelNode = Node<FunnelNodeData>;
export type FunnelEdge = Edge;

export interface FunnelData {
  nodes: FunnelNode[];
  edges: FunnelEdge[];
}