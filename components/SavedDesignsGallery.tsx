
import React, { useEffect, useState } from 'react';
import { RoomData } from '../types';
import { Trash2, Eye, ArrowLeft, LayoutTemplate, Clock } from 'lucide-react';
import { Button } from './Button';

interface SavedDesignsGalleryProps {
  onBack: () => void;
  onLoadDesign: (design: RoomData) => void;
}

export const SavedDesignsGallery: React.FC<SavedDesignsGalleryProps> = ({ onBack, onLoadDesign }) => {
  const [designs, setDesigns] = useState<RoomData[]>([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem('luxe_saved_designs');
      if (data) {
        setDesigns(JSON.parse(data));
      }
    } catch (e) {
      console.error("Failed to load designs", e);
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this design permanently?')) {
        const updated = designs.filter(d => d.id !== id);
        setDesigns(updated);
        localStorage.setItem('luxe_saved_designs', JSON.stringify(updated));
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft size={16} /> Back
        </Button>
        <h2 className="text-3xl font-serif font-bold text-gray-900">Saved Room Designs</h2>
      </div>

      {designs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <LayoutTemplate size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No saved designs yet</h3>
            <p className="text-gray-500">Completed room designs can be saved from the results page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map(design => (
                <div key={design.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col">
                    <div className="aspect-[4/3] relative bg-stone-100 overflow-hidden">
                        {design.result?.generatedImages[0] ? (
                            <img src={design.result.generatedImages[0]} alt={design.type} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                                <LayoutTemplate size={32} />
                                <span className="text-sm">No Preview</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className={`text-xs px-2 py-1 rounded-full font-medium ${design.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                {design.status === 'completed' ? 'Completed' : 'Draft'}
                             </span>
                        </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-serif font-bold text-xl text-gray-900">{design.type}</h3>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                            <Clock size={12} />
                            <span>Saved Design</span>
                        </div>

                        <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-1">
                            {design.result?.advice || "No design description available."}
                        </p>
                        
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <Button onClick={() => onLoadDesign(design)} fullWidth className="text-sm py-2 bg-gray-900 hover:bg-gray-800">
                                <Eye size={16} className="mr-2" /> View Project
                            </Button>
                            <button 
                                onClick={(e) => handleDelete(design.id, e)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                title="Delete Design"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
