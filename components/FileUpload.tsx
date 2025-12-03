

import React, { useRef, useState } from 'react';
import { PlayCircle, Loader2, Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (base64: string, type: 'image' | 'video') => void;
  label: string;
  accept?: string;
  className?: string;
  preview?: string | null;
  isVideo?: boolean;
  maxSizeMB?: number;
  onClear?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  label, 
  accept = "image/*,video/*", 
  className = "",
  preview,
  isVideo = false,
  maxSizeMB = 50,
  onClear
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File is too large. Please upload files smaller than ${maxSizeMB}MB.`);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      setIsLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        onFileSelect(reader.result as string, type);
        setIsLoading(false);
      };
      reader.onerror = () => {
        alert("Failed to read file");
        setIsLoading(false);
      }
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center transition-all hover:border-gray-500 hover:bg-gray-50 cursor-pointer group ${className} ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
      onClick={() => !isLoading && inputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleFileChange} 
        accept={accept} 
        className="hidden" 
        disabled={isLoading}
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="animate-spin mb-2 text-gray-900" size={32} />
          <span className="text-sm font-medium">Processing file...</span>
        </div>
      ) : preview ? (
        <div className="relative w-full h-full overflow-hidden rounded-lg shadow-sm flex items-center justify-center bg-black group">
           {isVideo ? (
             <video src={preview} className="w-full h-full object-cover" controls={false} muted />
           ) : (
             <img src={preview} alt="Preview" className="w-full h-full object-cover" />
           )}
           
           {isVideo && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <PlayCircle className="text-white opacity-80" size={32} />
             </div>
           )}

           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <span className="text-white font-medium">Click to change</span>
           </div>
           
           {onClear && (
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 onClear();
               }}
               className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white text-gray-700 hover:text-red-600 rounded-full shadow-sm transition-all z-20 opacity-0 group-hover:opacity-100"
               title="Remove file"
             >
               <X size={20} />
             </button>
           )}
        </div>
      ) : (
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="mt-2 text-sm text-gray-600">{label}</p>
          <p className="mt-1 text-xs text-gray-500">Max size {maxSizeMB}MB</p>
        </div>
      )}
    </div>
  );
};
