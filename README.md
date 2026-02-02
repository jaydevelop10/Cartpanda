# Funnel Builder

A visual drag-and-drop funnel builder for creating e-commerce sales funnels with nodes and connections.

## 🚀 Live Demo

[Deploy to Vercel/Netlify and add URL here]

## 🏃‍♂️ How to Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Architecture Decisions

### Core Stack
- **React 18** + **TypeScript** - Type safety and modern React features
- **Vite** - Fast development and build tooling
- **React Flow** - Robust graph/node editor with built-in drag-drop, zoom, pan
- **Tailwind CSS** - Utility-first styling for rapid UI development
- **Lucide React** - Consistent icon system

### Key Design Choices

**1. React Flow Integration**
- Leveraged React Flow's mature ecosystem instead of building from scratch
- Custom node components for funnel-specific UI
- Built-in features: zoom, pan, minimap, background grid

**2. State Management**
- React Flow's built-in state management via `useNodesState` and `useEdgesState`
- Local component state for UI interactions
- No external state library needed for this scope

**3. Data Persistence**
- localStorage for automatic save/restore
- JSON export/import for data portability
- Simple serialization without complex normalization

**4. Validation System**
- Real-time funnel validation with visual feedback
- Business rule enforcement (Thank You pages, Sales page connections)
- Non-blocking validation - warns but doesn't prevent actions

**5. Component Structure**
```
App.tsx              # Main container with React Flow
├── CustomNode.tsx   # Individual funnel node component
├── NodePalette.tsx  # Draggable node types sidebar
├── nodeTemplates.ts # Node type definitions and configs
├── utils.ts         # Validation and helper functions
└── types.ts         # TypeScript interfaces
```

## ⚖️ Tradeoffs & What I'd Improve Next

### Current Limitations
- **Node/Edge Deletion** - Only keyboard deletion (Backspace), no UI buttons
- **Basic validation** - Could add flow analysis, dead ends, circular references
- **No undo/redo** - React Flow supports this, needs UI implementation
- **No snap-to-grid** - Available in React Flow, disabled for simplicity
- **No node editing** - Labels and button text are static

### Next Improvements (Priority Order)
1. **Enhanced Deletion UX** - Visual delete buttons, multi-select deletion
2. **Advanced Validation** - Flow analysis, dead ends, circular references  
3. **Undo/Redo** - History management with keyboard shortcuts (Ctrl+Z)
4. **Node Editing** - Inline editing of labels and button text
5. **Snap to Grid** - Better alignment and organization
6. **Templates** - Pre-built funnel templates for common patterns
7. **Export Options** - PNG/SVG export for documentation

### Technical Debt
- **Error Boundaries** - Add error handling for React Flow crashes
- **Performance** - Virtualization for large funnels (100+ nodes)
- **Testing** - Unit tests for validation logic, E2E for interactions
- **Notifications** - Replace alert() with proper toast system

## 🎯 Features Implemented

### Core Requirements ✅
- [x] Infinite canvas with pan (React Flow built-in)
- [x] Grid background with dots pattern
- [x] Draggable nodes from palette
- [x] 5 node types: Sales, Order, Upsell, Downsell, Thank You
- [x] Visual connections with arrows
- [x] Auto-incrementing labels (Upsell 1, Upsell 2, etc.)
- [x] Basic funnel validation rules
- [x] **localStorage auto-save/restore**
- [x] JSON export/import

### Bonus Features ✅
- [x] Zoom controls
- [x] Mini-map for navigation
- [x] Real-time validation feedback
- [x] Clean, professional UI
- [x] Responsive design

## 🔧 Technical Implementation

### Node System
Each node type has:
- Unique icon and color coding
- Connection handles (input/output)
- Business rule validation
- Auto-generated labels

### Connection System
- Visual arrow connections
- Directional flow validation
- Smooth step edge styling
- Automatic routing

### Validation Engine
- Real-time rule checking
- Visual issue indicators
- Non-blocking warnings
- Extensible rule system

## 📱 Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for tablet/desktop
- Touch support for mobile devices