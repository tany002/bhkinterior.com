
import React, { useState, useRef, useMemo } from 'react';
import { LayoutProposal, FurniturePlacement } from '../types';
import { Button } from './Button';
import { X, Save, RotateCw, Trash2, Plus, GripVertical, AlertCircle, Maximize2, Layout } from 'lucide-react';

interface DragEditorProps {
  layout: LayoutProposal;
  roomType: string;
  backgroundImage?: string | null;
  onSave: (updatedLayout: LayoutProposal) => void;
  onCancel: () => void;
}

// Configuration
const SCALE = 50; // 1 meter = 50 pixels
const CANVAS_METERS = 8; // 8x8 meters canvas
const CANVAS_SIZE = CANVAS_METERS * SCALE;
const SNAP = 0.1; // Snap to 10cm

// Furniture Catalog for adding new items
const CATALOG = [
  { label: 'Sofa', w: 2.2, d: 0.9, type: 'Seating' },
  { label: 'Armchair', w: 0.8, d: 0.8, type: 'Seating' },
  { label: 'Coffee Table', w: 1.2, d: 0.6, type: 'Table' },
  { label: 'Bed (Queen)', w: 1.6, d: 2.0, type: 'Bed' },
  { label: 'Nightstand', w: 0.5, d: 0.4, type: 'Storage' },
  { label: 'Dining Table', w: 1.5, d: 0.9, type: 'Table' },
  { label: 'Chair', w: 0.5, d: 0.5, type: 'Seating' },
  { label: 'TV Unit', w: 1.8, d: 0.4, type: 'Storage' },
  { label: 'Wardrobe', w: 1.0, d: 0.6, type: 'Storage' },
  { label: 'Rug', w: 2.0, d: 1.5, type: 'Decor' },
  { label: 'Plant', w: 0.4, d: 0.4, type: 'Decor' },
];

export const DragEditor: React.FC<DragEditorProps> = ({ layout, roomType, backgroundImage, onSave, onCancel }) => {
  const [placements, setPlacements] = useState<FurniturePlacement[]>(
    layout.placements.map(p => ({ ...p })) // Deep copy to avoid mutating original props
  );
  const [activeId, setActiveId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // --- Helpers ---

  const snap = (val: number) => Math.round(val / SNAP) * SNAP;

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setActiveId(index);
    setIsDragging(true);
    setIsRotating(false);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const item = placements[index];
      // Calculate mouse offset from item center in meters
      const mouseX_m = (e.clientX - rect.left) / SCALE;
      const mouseY_m = (e.clientY - rect.top) / SCALE;
      
      dragOffset.current = {
        x: mouseX_m - item.x_m,
        y: mouseY_m - item.y_m
      };
    }
  };

  const handleRotateStart = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveId(index);
    setIsRotating(true);
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if ((!isDragging && !isRotating) || activeId === null || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    if (isRotating) {
        const item = placements[activeId];
        // Calculate center of item relative to screen
        const itemCenterX = rect.left + item.x_m * SCALE;
        const itemCenterY = rect.top + item.y_m * SCALE;
        
        const dx = e.clientX - itemCenterX;
        const dy = e.clientY - itemCenterY;
        
        // Calculate angle. 0 degrees is 'Up' (-Y)
        // atan2(y, x) gives angle from +X (Right)
        // -90deg (Up) needs to be mapped to 0
        let angleDeg = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
        if (angleDeg < 0) angleDeg += 360;
        
        // Snap to 15 degrees
        const snappedAngle = Math.round(angleDeg / 15) * 15;
        
        setPlacements(prev => prev.map((item, i) => {
            if (i !== activeId) return item;
            return { ...item, rotation_deg: snappedAngle % 360 };
        }));

    } else {
        // Dragging Logic
        const mouseX_m = (e.clientX - rect.left) / SCALE;
        const mouseY_m = (e.clientY - rect.top) / SCALE;

        // Apply snap
        const newX = snap(mouseX_m - dragOffset.current.x);
        const newY = snap(mouseY_m - dragOffset.current.y);

        // Boundary clamping (keep center inside canvas)
        const clampedX = Math.max(0, Math.min(CANVAS_METERS, newX));
        const clampedY = Math.max(0, Math.min(CANVAS_METERS, newY));

        setPlacements(prev => prev.map((item, i) => {
            if (i !== activeId) return item;
            return { ...item, x_m: clampedX, y_m: clampedY };
        }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsRotating(false);
  };

  const handleAddItem = (template: typeof CATALOG[0]) => {
    const newItem: FurniturePlacement = {
      item_type: template.label,
      x_m: CANVAS_METERS / 2,
      y_m: CANVAS_METERS / 2,
      width_m: template.w,
      depth_m: template.d,
      rotation_deg: 0
    };
    setPlacements(prev => [...prev, newItem]);
    setActiveId(placements.length); // Select new item
  };

  const handleDelete = () => {
    if (activeId === null) return;
    setPlacements(prev => prev.filter((_, i) => i !== activeId));
    setActiveId(null);
  };

  const handleUpdateActive = (field: keyof FurniturePlacement, value: number) => {
    if (activeId === null) return;
    setPlacements(prev => prev.map((item, i) => {
      if (i !== activeId) return item;
      return { ...item, [field]: value };
    }));
  };

  const handleSave = () => {
    const updatedLayout = { 
      ...layout, 
      placements, 
      auto_fixed: true, 
      short_rationale: layout.short_rationale + " (User Customized)" 
    };
    onSave(updatedLayout);
  };

  // --- Collision Detection ---
  const collisions = useMemo(() => {
    const collisionSet = new Set<number>();
    const margin = 0.05; // 5cm forgiveness

    for (let i = 0; i < placements.length; i++) {
      for (let j = i + 1; j < placements.length; j++) {
        const a = placements[i];
        const b = placements[j];

        // Simple AABB approximation (swapping w/d if rotated near 90 or 270)
        const isRotatedA = (Math.abs(a.rotation_deg % 180) > 45 && Math.abs(a.rotation_deg % 180) < 135);
        const isRotatedB = (Math.abs(b.rotation_deg % 180) > 45 && Math.abs(b.rotation_deg % 180) < 135);

        const a_w = isRotatedA ? a.depth_m : a.width_m;
        const a_d = isRotatedA ? a.width_m : a.depth_m;
        const b_w = isRotatedB ? b.depth_m : b.width_m;
        const b_d = isRotatedB ? b.width_m : b.depth_m;

        const overlapX = Math.abs(a.x_m - b.x_m) < (a_w + b_w) / 2 - margin;
        const overlapY = Math.abs(a.y_m - b.y_m) < (a_d + b_d) / 2 - margin;

        if (overlapX && overlapY) {
          collisionSet.add(i);
          collisionSet.add(j);
        }
      }
    }
    return collisionSet;
  }, [placements]);

  // --- Render ---

  const activeItem = activeId !== null ? placements[activeId] : null;

  return (
    <div className="fixed inset-0 z-[80] bg-stone-900/90 flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full h-[90vh] flex overflow-hidden">
        
        {/* Left: Canvas Area */}
        <div className="flex-1 flex flex-col bg-stone-100 relative">
          <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center z-10">
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900">Layout Editor: {roomType}</h3>
              <p className="text-xs text-gray-500">Drag to move • Drag handle to rotate (15° snap)</p>
            </div>
            <div className="flex gap-2">
               <div className="text-xs px-3 py-1 bg-gray-100 rounded-md text-gray-500 flex items-center">
                  1 Grid Square = 1 Meter
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-stone-200/50"
               onMouseMove={handleMouseMove}
               onMouseUp={handleMouseUp}
               onMouseLeave={handleMouseUp}
          >
            <div 
              ref={containerRef}
              className="bg-white shadow-xl relative transition-all duration-300"
              style={{ 
                width: CANVAS_SIZE, 
                height: CANVAS_SIZE,
                backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                backgroundSize: `${SCALE}px ${SCALE}px`
              }}
              onClick={() => setActiveId(null)} // Deselect when clicking canvas
            >
              {/* Optional Background Context (e.g. Floor Plan) */}
              {backgroundImage && (
                <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                    <img src={backgroundImage} alt="Floor Plan Context" className="max-w-full max-h-full object-contain" />
                </div>
              )}

              {/* Center Marker */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-300 rounded-full -translate-x-1/2 -translate-y-1/2" />

              {placements.map((item, idx) => {
                const isSelected = activeId === idx;
                const isCollision = collisions.has(idx);

                return (
                  <div
                    key={idx}
                    onMouseDown={(e) => handleMouseDown(e, idx)}
                    className={`absolute flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none transition-shadow group
                      ${isSelected ? 'z-30' : 'z-10'}
                    `}
                    style={{
                      left: item.x_m * SCALE,
                      top: item.y_m * SCALE,
                      width: item.width_m * SCALE,
                      height: item.depth_m * SCALE,
                      transform: `translate(-50%, -50%) rotate(${item.rotation_deg}deg)`,
                    }}
                  >
                    <div className={`
                      w-full h-full rounded-sm border flex items-center justify-center relative overflow-hidden transition-colors duration-200
                      ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-1 hover:ring-gray-300 shadow-sm'}
                      ${isCollision ? 'bg-red-50 border-red-500' : 'bg-stone-50 border-stone-400'}
                    `}>
                      {/* Front indicator */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-black/10" />
                      
                      <span className="text-[10px] font-medium text-gray-700 truncate px-1 text-center pointer-events-none">
                         {item.item_type}
                      </span>

                      {/* Dimensions on Hover/Select */}
                      {(isSelected) && (
                         <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-[8px] px-1 rounded-tl-sm pointer-events-none">
                            {item.width_m} x {item.depth_m}m
                         </div>
                      )}
                    </div>
                    
                    {/* Interactive Rotation Handle */}
                    {isSelected && (
                       <div 
                         onMouseDown={(e) => handleRotateStart(e, idx)}
                         className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 flex items-end justify-center cursor-grab active:cursor-grabbing z-50 pointer-events-auto group/rotate"
                       >
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-white border border-blue-500 rounded-full p-1 shadow-sm group-hover/rotate:scale-110 transition-transform">
                             <RotateCw size={12} className="text-blue-500" />
                          </div>
                          <div className="w-0.5 h-3 bg-blue-500" />
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Sidebar Controls */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col z-20">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h4 className="font-bold text-gray-800">Inspector</h4>
                <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* 1. Add Items Section */}
                <div>
                    <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Add Furniture</h5>
                    <div className="grid grid-cols-2 gap-2">
                        {CATALOG.map(cat => (
                            <button
                                key={cat.label}
                                onClick={() => handleAddItem(cat)}
                                className="flex items-center gap-2 px-3 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-left transition-colors group"
                            >
                                <Plus size={14} className="text-stone-400 group-hover:text-blue-500" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-700 truncate">{cat.label}</div>
                                    <div className="text-[10px] text-gray-400">{cat.w}x{cat.d}m</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* 2. Properties Section */}
                {activeItem ? (
                    <div className="animate-in slide-in-from-right-2 duration-200">
                         <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Properties</h5>
                         
                         <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                             <div className="flex justify-between items-start mb-2">
                                 <span className="font-bold text-gray-900">{activeItem.item_type}</span>
                                 <GripVertical size={16} className="text-blue-300" />
                             </div>
                             <div className="text-xs text-blue-700 space-y-1">
                                 <div>Pos: ({activeItem.x_m.toFixed(1)}, {activeItem.y_m.toFixed(1)})</div>
                                 {collisions.has(activeId!) && (
                                     <div className="flex items-center gap-1 text-red-600 font-bold mt-2">
                                         <AlertCircle size={12} /> Overlap Detected
                                     </div>
                                 )}
                             </div>
                         </div>

                         <div className="space-y-4">
                             {/* Rotation */}
                             <div>
                                 <label className="text-xs font-medium text-gray-500 mb-1.5 block">Rotation ({activeItem.rotation_deg}°)</label>
                                 <div className="flex items-center gap-2">
                                     <input 
                                        type="range" min="0" max="360" step="15"
                                        value={activeItem.rotation_deg}
                                        onChange={(e) => handleUpdateActive('rotation_deg', parseInt(e.target.value))}
                                        className="flex-1 accent-gray-900"
                                     />
                                     <Button 
                                        variant="outline" className="p-2 h-8 w-8 flex items-center justify-center"
                                        onClick={() => handleUpdateActive('rotation_deg', (activeItem.rotation_deg + 90) % 360)}
                                        title="Rotate +90°"
                                     >
                                        <RotateCw size={14} />
                                     </Button>
                                 </div>
                             </div>

                             {/* Dimensions */}
                             <div className="grid grid-cols-2 gap-3">
                                 <div>
                                     <label className="text-xs font-medium text-gray-500 mb-1.5 block">Width (m)</label>
                                     <input 
                                        type="number" step="0.1" min="0.1"
                                        value={activeItem.width_m}
                                        onChange={(e) => handleUpdateActive('width_m', parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                     />
                                 </div>
                                 <div>
                                     <label className="text-xs font-medium text-gray-500 mb-1.5 block">Depth (m)</label>
                                     <input 
                                        type="number" step="0.1" min="0.1"
                                        value={activeItem.depth_m}
                                        onChange={(e) => handleUpdateActive('depth_m', parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 bg-stone-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                     />
                                 </div>
                             </div>

                             <Button 
                                onClick={handleDelete}
                                className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 mt-4"
                             >
                                <Trash2 size={16} className="mr-2" /> Delete Item
                             </Button>
                         </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 bg-stone-50 rounded-lg border border-dashed border-gray-200">
                        <Maximize2 size={24} className="mb-2 opacity-50" />
                        <span className="text-sm">Select an item to edit</span>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
                <Button variant="outline" fullWidth onClick={onCancel}>Cancel</Button>
                <Button fullWidth onClick={handleSave} className="flex items-center justify-center gap-2">
                    <Save size={16} /> Save Changes
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};
