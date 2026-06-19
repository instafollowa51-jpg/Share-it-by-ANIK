import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileIcon, ImageIcon, FileTextIcon, X, Eye } from "lucide-react";
import { formatBytes } from "../lib/utils";

export function FileList({ files, onRemove, isReceiver = false }: { files: File[] | any[], onRemove?: (index: number) => void, isReceiver?: boolean }) {
  const [previewFile, setPreviewFile] = useState<File | any | null>(null);

  if (files.length === 0) return null;

  return (
    <>
      <motion.div 
        className="glass-card w-full p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <h3 className="font-bold mb-4 text-[var(--text-primary)]">{isReceiver ? "Files ready for you" : "Files in Queue"}</h3>
        
        <div className="flex flex-col gap-3 mt-4">
          <AnimatePresence>
            {files.map((file, index) => {
               const isImage = file.type?.startsWith("image/");
               const isPdf = file.type?.includes("pdf");
               const fileUrl = file instanceof File ? URL.createObjectURL(file) : file.url;
               
               return (
                 <motion.div 
                   key={`${file.name}-${index}`}
                   className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 will-change-transform"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   transition={{ ease: "easeOut", duration: 0.2 }}
                 >
                   <div className="flex-1 min-w-0 pr-4">
                     <p className="text-sm font-medium truncate text-[var(--text-primary)]">{file.name}</p>
                     <p className="font-mono text-[11px] text-[#94A3B8]">{formatBytes(file.size)}</p>
                   </div>

                   <div className="flex items-center gap-2 shrink-0">
                     {(isImage || isPdf) && (
                        <button 
                           onClick={() => setPreviewFile(file)}
                           className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0 tooltip text-[var(--text-secondary)]"
                           title="Preview"
                        >
                           <Eye className="w-4 h-4" />
                        </button>
                     )}

                     {onRemove && (
                       <button 
                         onClick={() => onRemove(index)}
                         className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-colors shrink-0 text-[var(--text-secondary)]"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     )}
                   </div>
                 </motion.div>
               )
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
         {previewFile && (
           <motion.div 
             className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
           >
             <button 
                onClick={() => setPreviewFile(null)}
                className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-all pointer-events-auto"
             >
                <X className="w-6 h-6" />
             </button>
             
             <motion.div 
               className="w-full max-w-4xl max-h-full overflow-hidden rounded-2xl bg-black shadow-2xl relative flex items-center justify-center"
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               transition={{ type: "spring", stiffness: 350, damping: 30 }}
               onClick={(e) => e.stopPropagation()}
             >
                {previewFile.type?.startsWith("image/") ? (
                   <img 
                     src={previewFile instanceof File ? URL.createObjectURL(previewFile) : previewFile.url} 
                     alt="Preview" 
                     className="max-w-full max-h-[85vh] object-contain"
                   />
                ) : (
                   <iframe 
                     src={previewFile instanceof File ? URL.createObjectURL(previewFile) : previewFile.url}
                     className="w-full h-[85vh] bg-white border-0"
                     title="PDF Preview"
                   />
                )}
             </motion.div>
           </motion.div>
         )}
      </AnimatePresence>
    </>
  );
}
