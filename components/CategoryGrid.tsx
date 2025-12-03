
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  title: string;
  imageUrl: string;
  count?: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick?: (id: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategoryClick }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Explore Categories</h2>
          <p className="text-gray-500 mt-2">Curated styles for every room in your home.</p>
        </div>
        <button className="text-indigo-600 font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm hidden md:flex">
          View all styles <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <div 
            key={cat.id} 
            onClick={() => onCategoryClick?.(cat.id)}
            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
          >
            {/* Image with Zoom Effect */}
            <div className="absolute inset-0 bg-stone-200">
              <img 
                src={cat.imageUrl} 
                alt={cat.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            
            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-bold text-xl mb-1">{cat.title}</h3>
                <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  <span className="text-white/80 text-sm">{cat.count || 'Explore'}</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
