import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Info } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

export function ShareCard({ sessionId, connectionState }: { sessionId: string; connectionState: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}?id=${sessionId}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      className="glass-card w-full p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden shadow-[0_8px_32px_rgba(79,70,229,0.1)]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex flex-col items-center w-full mb-2">
        <h3 className="font-bold text-lg">Share Connection</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Scan or copy to connect devices instantly</p>
      </div>
      
      <div className="p-6 bg-white rounded-2xl shadow-sm mb-2 relative group cursor-pointer" onClick={copyUrl}>
        <div className="absolute inset-0 bg-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm backdrop-saturate-200">
           <span className="font-bold text-gray-900 bg-white/90 px-3 py-1 rounded-full shadow-lg text-sm flex items-center gap-2">
             {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
             {copied ? "Copied Link!" : "Copy Link"}
           </span>
        </div>
        <QRCodeSVG 
          value={shareUrl} 
          size={150}
          level="L" 
          fgColor="#0F172A"
          bgColor="#FFFFFF"
        />
      </div>

      <div 
        onClick={copyUrl}
        className="glass-pill px-6 py-3 flex items-center justify-between gap-4 w-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors group mb-2"
        title="Click to copy link"
      >
        <span className="font-mono font-medium tracking-wider text-xl group-hover:text-[#4F46E5] transition-colors text-[var(--text-primary)]">
          {sessionId}
        </span>
        {copied ? (
          <Check className="w-5 h-5 text-emerald-500" />
        ) : (
          <Copy className="w-5 h-5 text-[var(--text-secondary)]" />
        )}
      </div>
      
      <p className="text-sm text-[var(--text-secondary)] mt-2 flex items-center gap-2">
        {connectionState === "connected" ? (
          <>
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></span>
            Connected to peer
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></span>
            Waiting for receiver...
          </>
        )}
      </p>
    </motion.div>
  );
}
