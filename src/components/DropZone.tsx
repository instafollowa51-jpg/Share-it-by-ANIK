import * as React from "react";
import { useState, useRef } from "react";
import { UploadCloud, CheckCircle, X } from "lucide-react";
import { cn, formatBytes } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export function DropZone({ onFilesAdded }: { onFilesAdded: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <motion.div 
      className={cn(
        "glass-card w-full p-8 md:p-12 relative flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-all duration-300",
        isDragging ? "border-[#4F46E5] bg-white/10 ring-4 ring-[#4F46E5]/20 shadow-[0_8px_32px_rgba(79,70,229,0.2)]" : "border-dashed border-2 border-indigo-500/30 hover:border-indigo-500/60 shadow-[0_8px_32px_rgba(79,70,229,0.1)]"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <input 
        ref={inputRef}
        type="file" 
        multiple 
        className="hidden" 
        onChange={handleChange} 
      />
      
      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-300",
        isDragging ? "bg-indigo-500/20 scale-110" : "bg-indigo-500/10 group-hover:scale-110"
      )}>
        <UploadCloud className={cn("w-10 h-10 transition-colors", isDragging ? "text-indigo-400" : "text-indigo-400/80 group-hover:text-indigo-400")} />
      </div>

      <h2 className="text-2xl font-bold mb-2 text-center text-[var(--text-primary)]">Drop your files here</h2>
      <p className="text-[var(--text-secondary)] text-center text-sm md:text-base max-w-[280px]">
        or click to browse — any file type, any size
      </p>

      {/* Decorative gradient blur in background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-tr from-[#4F46E5]/10 via-[#7C3AED]/10 to-[#2563EB]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[20px] pointer-events-none",
        isDragging && "opacity-100"
      )} />
    </motion.div>
  );
}
