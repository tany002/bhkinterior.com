
import React from 'react';
import { Check, Wrench } from 'lucide-react';
import { Button } from './Button';

interface MicroPreviewProps {
  onConfirm: () => void;
  onQuickFix: () => void;
}

export const MicroPreview: React.FC<MicroPreviewProps> = ({ onConfirm, onQuickFix }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100">
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 text-center">Preview ready</h3>
        <p className="text-gray-600 text-center mb-6">We've generated a layout for you. How does it look?</p>
        
        <div className="space-y-3">
          <Button 
            onClick={onConfirm} 
            fullWidth 
            className="flex items-center justify-center gap-2"
          >
            <Check size={18} />
            Yes — show options
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={onQuickFix} 
            fullWidth
            className="flex items-center justify-center gap-2 text-stone-600 hover:text-stone-900"
          >
            <Wrench size={18} />
            No — Quick fix
          </Button>
        </div>
      </div>
    </div>
  );
};
