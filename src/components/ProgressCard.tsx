import { motion } from "motion/react";
import { CheckCircle } from "lucide-react";
import { cn, formatBytes } from "../lib/utils";
import type { TransferProgress } from "../hooks/usePeer";

export function ProgressCard({ progress, connectionState }: { progress: TransferProgress | null, connectionState: string }) {
  if (!progress && connectionState !== "connected") return null;

  const isComplete = connectionState === "connected" && !progress;
  const showProgress = !!progress;

  return (
    <motion.div 
      className={cn(
        "glass-card w-full p-6 shadow-[0_8px_32px_rgba(79,70,229,0.1)] transition-colors duration-500",
        isComplete && "border-emerald-500/50 shadow-[0_8px_32px_rgba(16,185,129,0.15)]"
      )}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center justify-between mb-4">
         <h3 className="font-bold text-[var(--text-primary)]">
           {isComplete ? "Transfer Complete!" : "Current Transfer"}
         </h3>
         {!isComplete && connectionState === "connected" && (
           <div className="flex items-center gap-1.5">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
             </span>
             <span className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold">Transferring...</span>
           </div>
         )}
      </div>

      {showProgress && (
        <div className="space-y-4">
          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium truncate pr-4 text-[var(--text-primary)]">In progress...</span>
              <span className="text-[11px] font-mono text-[#94A3B8]">{formatBytes(progress.totalBytes)}</span>
            </div>
            
            <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#4F46E5] to-[#2563EB]"
                initial={{ width: 0 }}
                animate={{ width: `${progress.progress}%` }}
                transition={{ ease: "linear", duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-24 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
              </motion.div>
            </div>

            <div className="flex justify-between mt-2 text-[10px] font-mono text-[#94A3B8]">
               <span>{progress.progress}% Complete</span>
               <span>{progress.speed} • ETA: {progress.eta}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
