import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ArrowDownLeft, X, History } from "lucide-react";
import { formatBytes } from "../lib/utils";
import type { TransferRecord } from "../hooks/useHistory";
import { useState } from "react";

export function HistoryDrawer({ history }: { history: TransferRecord[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        id="history-trigger"
        onClick={() => setIsOpen(true)}
        className="hidden"
      >
        History
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-[var(--bg-primary)] border-t border-white/10 shadow-2xl rounded-t-3xl h-[60vh] z-50 flex flex-col will-change-transform"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <History className="w-5 h-5 text-[#4F46E5]" />
                  Recent Transfers
                </h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-50">
                    <History className="w-16 h-16 mb-4" />
                    <p>No transfers yet — share something!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((record) => (
                      <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-opacity-10 ${record.direction === 'sent' ? 'bg-indigo-500 text-indigo-500' : 'bg-emerald-500 text-emerald-500'}`}>
                             {record.direction === 'sent' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium truncate max-w-[200px]">{record.filename}</p>
                            <p className="text-xs text-[var(--text-secondary)]">
                               {new Date(record.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-black/5 dark:border-white/5 sm:border-0 pt-3 sm:pt-0">
                           <span className="font-mono text-sm">{formatBytes(record.size)}</span>
                           <span className={`text-xs px-2 py-1 rounded-full font-medium ${record.method === 'P2P' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                             {record.method}
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
