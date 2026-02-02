import { FunnelNode, FunnelEdge, NodeType, FunnelNodeData } from './types';
import { getNodeTemplate } from './nodeTemplates';
import { Node } from 'reactflow';

export const generateNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
export const generateEdgeId = () => `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const createNode = (type: NodeType, position: { x: number; y: number }, existingNodes: FunnelNode[]): Node<FunnelNodeData> => {
  const template = getNodeTemplate(type);
  
  // Auto-increment labels for upsells and downsells
  let label = template.label;
  if (type === 'upsell' || type === 'downsell') {
    const sameTypeNodes = existingNodes.filter(n => n.data?.type === type);
    const nextNumber = sameTypeNodes.length + 1;
    label = `${template.label} ${nextNumber}`;
  }
  
  return {
    id: generateNodeId(),
    type: 'custom',
    position,
    data: {
      label,
      buttonText: template.buttonText,
      type,
    },
  };
};

export const validateFunnel = (nodes: FunnelNode[], edges: FunnelEdge[]) => {
  const issues: string[] = [];
  
  // Check for orphan nodes (nodes with no connections)
  const connectedNodeIds = new Set([
    ...edges.map(e => e.source),
    ...edges.map(e => e.target)
  ]);
  
  const orphanNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
  if (orphanNodes.length > 0) {
    issues.push(`${orphanNodes.length} orphan node(s) found`);
  }
  
  // Check sales page rules
  const salesPages = nodes.filter(n => n.data?.type === 'sales');
  salesPages.forEach(salesPage => {
    const outgoingEdges = edges.filter(e => e.source === salesPage.id);
    if (outgoingEdges.length !== 1) {
      issues.push(`Sales page "${salesPage.data?.label}" should have exactly one outgoing connection`);
    }
  });
  
  // Check thank you page rules
  const thankYouPages = nodes.filter(n => n.data?.type === 'thankyou');
  thankYouPages.forEach(thankYouPage => {
    const outgoingEdges = edges.filter(e => e.source === thankYouPage.id);
    if (outgoingEdges.length > 0) {
      issues.push(`Thank you page "${thankYouPage.data?.label}" should not have outgoing connections`);
    }
  });
  
  return issues;
};