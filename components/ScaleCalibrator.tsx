import React, { useState, useRef } from 'react';
import { Ruler, Check, X, MoveHorizontal } from 'lucide-react';
import { Button } from './Button';

interface ScaleCalibratorProps {
  imageSrc: string;
  onConfirm: (pixelsPerMeter: number, distanceMeters: number) => void;
  onCancel: () => void;
}

export const ScaleCalibrator: React.FC<ScaleCalibratorProps> = ({ imageSrc, onConfirm, onCancel }) => {
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  const [realWorldDistance, setRealWorldDistance] = useState<string>('0.9');
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (points.length >= 2) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPoints(prev => [...prev, { x, y }]);
  };

  const resetPoints = () => setPoints([]);

  const handleConfirm = () => {
    if (points.length !== 2) return;

    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate pixels per meter based on user input (default 0.9m for a door)
    const meters = parseFloat(realWorldDistance);
    if (isNaN(meters) || meters <= 0) {
      alert("Please enter a valid distance.");
      return;
    }

    const ppm = pixelDistance / meters;
    onConfirm(ppm, meters);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-stone-900/95 flex flex-col items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-stone-50">
          <div>
            <h3 className="font-serif text-lg font-medium text-gray-900 flex items-center gap-2">
              <Ruler size={20} />
              Calibrate Room Scale
            </h3>
            <p className="text-sm text-gray-500">
              {points.length === 0 && "Step 1: Click the left edge of a standard door."}
              {points.length === 1 && "Step 2: Click the right edge of the door."}
              {points.length === 2 && "Step 3: Confirm the real-world width."}
            </p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-black relative overflow-hidden flex items-center justify-center cursor-crosshair group">
          <div className="relative inline-block" onClick={handleImageClick}>
            <img 
              ref={imageRef}
              src={imageSrc} 
              alt="Calibration Reference" 
              className="max-h-[60vh] object-contain select-none" 
              draggable={false}
            />
            
            {/* Overlay Points & Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {points.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="6" fill="#D4AF37" stroke="white" strokeWidth="2" />
              ))}
              {points.length === 2 && (
                <>
                  <line 
                    x1={points[0].x} y1={points[0].y} 
                    x2={points[1].x} y2={points[1].y} 
                    stroke="#D4AF37" strokeWidth="2" strokeDasharray="4" 
                  />
                  <text 
                    x={(points[0].x + points[1].x) / 2} 
                    y={(points[0].y + points[1].y) / 2 - 10} 
                    fill="white" 
                    fontSize="12"
                    textAnchor="middle"
                    className="drop-shadow-md font-bold"
                  >
                    {realWorldDistance}m
                  </text>
                </>
              )}
            </svg>
            
            {points.length < 2 && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full pointer-events-none backdrop-blur-sm">
                  Click two points to measure
               </div>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-stone-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
                <MoveHorizontal size={16} className="text-gray-400" />
                <input 
                  type="number" 
                  step="0.01" 
                  value={realWorldDistance} 
                  onChange={(e) => setRealWorldDistance(e.target.value)}
                  className="w-20 outline-none text-gray-900 font-medium text-center"
                />
                <span className="text-sm text-gray-500">meters</span>
             </div>
             <button 
               onClick={resetPoints} 
               className="text-sm text-red-600 hover:text-red-700 underline underline-offset-2"
               disabled={points.length === 0}
             >
               Reset Points
             </button>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" onClick={onCancel} className="flex-1 md:flex-none">Cancel</Button>
            <Button 
              onClick={handleConfirm} 
              disabled={points.length !== 2}
              className="flex-1 md:flex-none"
            >
              <Check size={18} className="mr-2" />
              Save Calibration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
