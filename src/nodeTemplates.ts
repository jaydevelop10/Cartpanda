import { ShoppingCart, CreditCard, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { NodeType } from './types';

export interface NodeTemplate {
  type: NodeType;
  label: string;
  icon: React.ComponentType<any>;
  buttonText: string;
  color: string;
}

export const nodeTemplates: NodeTemplate[] = [
  {
    type: 'sales',
    label: 'Sales Page',
    icon: ShoppingCart,
    buttonText: 'Buy Now',
    color: 'bg-blue-500'
  },
  {
    type: 'order',
    label: 'Order Page',
    icon: CreditCard,
    buttonText: 'Complete Order',
    color: 'bg-green-500'
  },
  {
    type: 'upsell',
    label: 'Upsell',
    icon: TrendingUp,
    buttonText: 'Add to Order',
    color: 'bg-purple-500'
  },
  {
    type: 'downsell',
    label: 'Downsell',
    icon: TrendingDown,
    buttonText: 'Special Offer',
    color: 'bg-orange-500'
  },
  {
    type: 'thankyou',
    label: 'Thank You',
    icon: CheckCircle,
    buttonText: 'Continue',
    color: 'bg-gray-500'
  }
];

export const getNodeTemplate = (type: NodeType): NodeTemplate => {
  return nodeTemplates.find(t => t.type === type)!;
};