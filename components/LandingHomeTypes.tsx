import React from 'react';

interface LandingHomeTypesProps {
  onSelectType: (type: string) => void;
}

export const LandingHomeTypes: React.FC<LandingHomeTypesProps> = ({ onSelectType }) => {
  return (
    <section className="bg-white border-y border-gray-100 py-8 w-full">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-4 justify-center">
        {['Apartment', 'Villa', 'Penthouse', 'Studio', 'Duplex'].map((type) => (
          <button
            key={type}
            onClick={() => onSelectType(type)}
            className="px-6 py-2 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all text-sm font-bold whitespace-nowrap"
          >
            {type}
          </button>
        ))}
      </div>
    </section>
  );
};
