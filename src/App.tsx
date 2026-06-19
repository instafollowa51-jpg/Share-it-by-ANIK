import * as React from "react";
import { useState, useEffect } from "react";
import { Moon, Sun, Upload, Download, ArrowLeft, QrCode } from "lucide-react";
import { DropZone } from "./components/DropZone";
import { FileList } from "./components/FileList";
import { ShareCard } from "./components/ShareCard";
import { ProgressCard } from "./components/ProgressCard";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { QRScanner } from "./components/QRScanner";
import { useTheme } from "./hooks/useTheme";
import { usePeer } from "./hooks/usePeer";
import { useHistory } from "./hooks/useHistory";
import { QRCodeSVG } from "qrcode.react";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { history, addRecord } = useHistory();
  
  const [role, setRole] = useState<"sender" | "receiver" | null>(null);
  const [sessionInput, setSessionInput] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const idFromUrl = urlParams.get("id");

  useEffect(() => {
    if (idFromUrl) {
      setSessionInput(idFromUrl);
      setRole("receiver");
    }
  }, [idFromUrl]);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Mesh Gradient Background Elements */}
      <div className="orb-1 pointer-events-none"></div>
      <div className="orb-2 pointer-events-none"></div>
      
      <div className="w-full max-w-[1024px] mx-auto p-4 md:p-8 flex flex-col relative z-10 pb-32 flex-1">
        <header className="flex justify-between items-center mb-8 md:mb-10 w-full">
          <div className="flex items-center gap-4">
            {role && (
               <button 
                 onClick={() => { setRole(null); setSessionInput(""); }}
                 className="p-3 bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
               >
                 <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
               </button>
            )}
            <div>
              <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">
                Share It
              </h1>
              <p className="text-[var(--text-secondary)] text-xs font-medium tracking-[0.2em] uppercase mt-1">by ANIK</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-3 bg-black/5 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-[var(--text-primary)] animate-[spin_350ms_ease-in-out_1]" /> : <Moon className="w-5 h-5 text-[var(--text-primary)] animate-[spin_350ms_ease-in-out_1]" />}
            </button>
          </div>
        </header>

        <main className="flex flex-col gap-6 w-full">
           {!role ? (
             <HomeView setRole={setRole} setSessionInput={setSessionInput} />
           ) : role === "sender" ? (
             <SenderView addHistoryRecord={addRecord} />
           ) : (
             <ReceiverView initialSessionId={sessionInput} addHistoryRecord={addRecord} />
           )}
        </main>

        <footer className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 z-10 w-full">
          <button 
            onClick={() => document.getElementById('history-trigger')?.click()}
            className="px-6 py-3 bg-black/5 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:bg-black/10 dark:hover:bg-white/10 hover:text-[var(--text-primary)] transition-all"
          >
            View Transfer History
          </button>
        </footer>
      </div>

      <HistoryDrawer history={history} />
    </div>
  );
}

function HomeView({ setRole, setSessionInput }: { setRole: any, setSessionInput: any }) {
  const [localInput, setLocalInput] = useState("");
  
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-12 w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
         <button onClick={() => setRole("sender")} className="group p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-gradient-to-br hover:from-indigo-500/10 hover:to-purple-500/10 transition-all flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
               <Upload className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Send Files</h2>
              <p className="text-sm text-[var(--text-secondary)]">Create a room and drop files to share</p>
            </div>
         </button>
         <button onClick={() => setRole("receiver")} className="group p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-teal-500/10 transition-all flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
               <Download className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Receive Files</h2>
              <p className="text-sm text-[var(--text-secondary)]">Join a room or scan QR code</p>
            </div>
         </button>
      </div>

      <div className="w-full relative max-w-md mx-auto">
        <div className="absolute inset-x-0 -top-4 flex justify-center">
           <span className="bg-[#FAFAFA] dark:bg-[#0F172A] px-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Or</span>
        </div>
        <div className="p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex">
           <input 
             type="text" 
             placeholder="Got a room code?"
             value={localInput}
             onChange={e => setLocalInput(e.target.value.toUpperCase())}
             className="flex-1 bg-transparent px-6 py-4 outline-none font-mono tracking-wider font-bold text-[var(--text-primary)]"
           />
           <button 
             onClick={() => {
                if (localInput) {
                   setSessionInput(localInput);
                   setRole("receiver");
                }
             }}
             className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 rounded-xl font-bold transition-colors m-1"
           >
             Join
           </button>
        </div>
      </div>
    </div>
  );
}

function SenderView({ addHistoryRecord }: { addHistoryRecord: any }) {
  const [files, setFiles] = useState<File[]>([]);
  const { peer, sessionId, connectionState, progressInfo, sendFileP2P, connectToPeer } = usePeer();
  const [relayStatus, setRelayStatus] = useState<"idle" | "uploading" | "completed" | "error">("idle");
  const [relayProgress, setRelayProgress] = useState(0);
  const [targetSessionId, setTargetSessionId] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    if (files.length > 0 && connectionState === "waiting" && relayStatus === "idle") {
      const timer = setTimeout(() => {
         uploadToRelay();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [files, connectionState, relayStatus]);

  const uploadToRelay = () => {
    if (files.length === 0) return;
    setRelayStatus("uploading");
    
    const formData = new FormData();
    formData.append("sessionId", sessionId);
    files.forEach(f => formData.append("files", f));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setRelayProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        setRelayStatus("completed");
        files.forEach(f => {
           addHistoryRecord({
             id: Math.random().toString(36).substring(2),
             filename: f.name,
             size: f.size,
             direction: "sent",
             method: "Relay",
             timestamp: Date.now(),
             status: "completed"
           });
        });
      } else {
        setRelayStatus("error");
      }
    };

    xhr.onerror = () => setRelayStatus("error");
    xhr.send(formData);
  };

  const handleSend = async () => {
    if (isTransferring) return;
    setIsTransferring(true);
    
    for (const file of files) {
       const success = await sendFileP2P(file);
       if (success) {
         addHistoryRecord({
            id: Math.random().toString(36).substring(2),
            filename: file.name,
            size: file.size,
            direction: "sent",
            method: "P2P",
            timestamp: Date.now(),
            status: "completed"
         });
       }
    }
    
    setIsTransferring(false);
    // Optionally clear files after send
    // setFiles([]);
  };

  const handleConnect = () => {
    if (targetSessionId && peer) {
      connectToPeer(targetSessionId);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full animate-in slide-in-from-bottom-8 duration-500">
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {connectionState !== "connected" && (
           <div className="glass-card p-6 flex flex-col gap-4 shadow-[0_8px_32px_rgba(79,70,229,0.1)] mb-2">
             <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-[var(--text-primary)]">Connect to Receiver (Optional)</h3>
                <button 
                  onClick={() => setShowScanner(!showScanner)}
                  className="p-2 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <QrCode className="w-5 h-5 text-indigo-500" />
                </button>
             </div>
             
             {showScanner && (
                <div className="mb-4">
                   <QRScanner onScan={(text) => {
                     let extractedId = text;
                     try {
                        if (text.includes("http")) {
                           const url = new URL(text);
                           extractedId = url.searchParams.get("id") || text;
                        }
                     } catch(e) {}
                     setTargetSessionId(extractedId);
                     setShowScanner(false);
                     if (peer) connectToPeer(extractedId);
                  }} />
                </div>
             )}

             <div className="flex gap-3">
               <input 
                 type="text" 
                 value={targetSessionId}
                 onChange={e => setTargetSessionId(e.target.value.toUpperCase())}
                 placeholder="Receiver's Session ID" 
                 className="flex-1 glass-pill px-4 py-2 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/5 dark:bg-black/5 text-sm"
               />
               <button 
                 onClick={handleConnect}
                 className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 rounded-xl font-bold transition-colors text-sm"
               >
                 Connect
               </button>
             </div>
           </div>
        )}

        <DropZone onFilesAdded={(f) => setFiles((prev) => [...prev, ...f])} />
        
        {files.length > 0 && (
           <FileList files={files} onRemove={isTransferring ? undefined : ((index) => setFiles(prev => prev.filter((_, i) => i !== index)))} />
        )}

        {files.length > 0 && connectionState === "connected" && (
           <button 
             onClick={handleSend} 
             disabled={isTransferring}
             className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white rounded-[12px] py-4 font-bold hover:-translate-y-1 hover:shadow-lg shadow-indigo-500/20 transition-all"
           >
             {isTransferring ? "Transferring..." : "Start Transfer"}
           </button>
        )}
      </div>

      <div className="lg:col-span-5 flex flex-col gap-6">
        <ShareCard sessionId={sessionId} connectionState={connectionState} />
        
        {relayStatus !== "idle" && connectionState !== "connected" && files.length > 0 && (
           <div className="glass-card p-6 shadow-[0_8px_32px_rgba(79,70,229,0.1)] border-t border-white/5">
             <div className="flex items-center gap-2 mb-2">
                 <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest flex items-center gap-2">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                   {relayStatus === "uploading" ? "Fallback to Relay Enabled (Offline receiver)" : 
                    relayStatus === "completed" ? "Saved to Cloud Relay" : "Relay Upload Failed"}
                 </span>
             </div>
             {relayStatus === "uploading" && (
               <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-4">
                 <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300" style={{ width: `${relayProgress}%` }} />
               </div>
             )}
             {relayStatus === "completed" && (
               <p className="text-xs text-[var(--text-secondary)] mt-2">
                 The receiver is offline. Files have been cached securely for 48 hours.
               </p>
             )}
           </div>
        )}

        {(connectionState === "connected" || progressInfo) && (
           <ProgressCard progress={progressInfo} connectionState={connectionState} />
        )}
      </div>
    </div>
  );
}

function ReceiverView({ initialSessionId, addHistoryRecord }: { initialSessionId: string, addHistoryRecord: any }) {
  const { peer, sessionId, connectionState, progressInfo, receivedFiles, connectToPeer } = usePeer();
  const [targetSessionId, setTargetSessionId] = useState(initialSessionId);
  const [relayFiles, setRelayFiles] = useState<any[]>([]);
  const [relayStatus, setRelayStatus] = useState<"loading" | "found" | "empty" | "error">("loading");
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (initialSessionId && peer) {
       connectToPeer(initialSessionId);
    }
  }, [initialSessionId, peer]);

  const handleConnect = () => {
    if (targetSessionId && peer) {
      connectToPeer(targetSessionId);
    }
  };

  useEffect(() => {
    // Proactively check backend for relay files if we have a target
    if (connectionState !== "connected" && targetSessionId) {
      fetch(`/api/session/${targetSessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.files && data.files.length > 0) {
            setRelayFiles(data.files.map((f: any) => ({
              name: f.name,
              size: f.size,
              url: `/api/download/${targetSessionId}/${f.name}`,
              type: "application/octet-stream"
           })));
            setRelayStatus("found");
          } else {
            setRelayStatus("empty");
          }
        })
        .catch(() => setRelayStatus("error"));
    }
  }, [targetSessionId, connectionState]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full animate-in slide-in-from-bottom-8 duration-500">
      <div className="lg:col-span-7 flex flex-col gap-6">

         {connectionState !== "connected" && (
           <div className="glass-card p-8 flex flex-col gap-4 shadow-[0_8px_32px_rgba(79,70,229,0.1)]">
             <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Join a Session</h2>
                <button 
                  onClick={() => setShowScanner(!showScanner)}
                  className="p-2 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <QrCode className="w-5 h-5 text-indigo-500" />
                </button>
             </div>
             
             {showScanner && (
                <div className="mb-4">
                   <QRScanner onScan={(text) => {
                     let extractedId = text;
                     try {
                        if (text.includes("http")) {
                           const url = new URL(text);
                           extractedId = url.searchParams.get("id") || text;
                        }
                     } catch(e) {}
                     setTargetSessionId(extractedId);
                     setShowScanner(false);
                     if (peer) connectToPeer(extractedId);
                  }} />
                </div>
             )}

             <div className="flex gap-3">
               <input 
                 type="text" 
                 value={targetSessionId}
                 onChange={e => setTargetSessionId(e.target.value.toUpperCase())}
                 placeholder="Enter Session ID to join" 
                 className="flex-1 glass-pill px-6 py-3 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/5 dark:bg-black/5"
               />
               <button 
                 onClick={handleConnect}
                 className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 rounded-xl font-bold transition-colors"
               >
                 Connect
               </button>
             </div>
             
             {/* Receiver Status */}
             <div className="mt-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center gap-3">
               {connectionState === "connecting" ? (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366F1] animate-pulse"></div>
               ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
               )}
               <span className="text-sm font-medium text-[var(--text-primary)]">
                 {connectionState === "connecting" ? `Connecting to ${targetSessionId}...` : "Ready to connect"}
               </span>
             </div>
           </div>
         )}

         {receivedFiles.length > 0 && (
           <div className="glass-card p-6 shadow-[0_8px_32px_rgba(79,70,229,0.1)]">
             <h3 className="font-bold mb-4">Received Files</h3>
             <FileList files={receivedFiles} isReceiver />
             <div className="mt-6 flex flex-col gap-2">
               {receivedFiles.length > 1 && (
                  <button 
                    className="block w-full text-center rounded-[12px] py-3 font-bold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-lg shadow-indigo-500/20 hover:-translate-y-[1px] transition-transform mb-2"
                    onClick={() => {
                       receivedFiles.forEach((file, idx) => {
                          setTimeout(() => {
                            const a = document.createElement("a");
                            a.href = file.url;
                            a.download = file.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }, idx * 250);
                       });
                    }}
                  >
                    Download All
                  </button>
               )}
               {receivedFiles.map((file, i) => (
                 <a 
                    key={i}
                    href={file.url} 
                    download={file.name}
                    className="block w-full text-center rounded-[12px] py-3 font-semibold bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    onClick={() => {
                      addHistoryRecord({
                         id: Math.random().toString(36).substring(2),
                         filename: file.name,
                         size: file.size,
                         direction: "received",
                         method: "P2P",
                         timestamp: Date.now(),
                         status: "completed"
                      });
                    }}
                 >
                   Save {file.name}
                 </a>
               ))}
             </div>
           </div>
         )}
      </div>

      <div className="lg:col-span-5 flex flex-col gap-6">
        <ShareCard sessionId={sessionId} connectionState={connectionState} />

        {(progressInfo || connectionState === "connected") && (
          <ProgressCard progress={progressInfo} connectionState={connectionState} />
        )}

        {relayFiles.length > 0 && connectionState !== "connected" && (
          <div className="glass-card p-6 shadow-[0_8px_32px_rgba(79,70,229,0.1)] border border-amber-500/20">
            <div className="flex justify-between items-start mb-4">
              <div>
                 <h3 className="font-bold text-white mb-1">Relay Files</h3>
                 <span className="text-[10px] uppercase tracking-widest font-bold text-[#94A3B8]">From Cloud Fallback</span>
              </div>
            </div>
            
            <FileList files={relayFiles} isReceiver />
            
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
               <span className="text-[10px] font-['JetBrains_Mono'] text-amber-500/80 uppercase tracking-tighter">
                 Expires in 48H
               </span>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {relayFiles.length > 1 && (
                 <button 
                   className="w-full text-center rounded-[12px] py-3 font-bold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-lg shadow-indigo-500/20 hover:-translate-y-[1px] transition-transform"
                   onClick={() => {
                      relayFiles.forEach((file, idx) => {
                         setTimeout(() => {
                           const a = document.createElement("a");
                           a.href = file.url;
                           a.download = file.name;
                           document.body.appendChild(a);
                           a.click();
                           document.body.removeChild(a);
                         }, idx * 250);
                      });
                   }}
                 >
                   Download All
                 </button>
              )}
              {relayFiles.map((file, i) => (
                <a 
                   key={i}
                   href={file.url} 
                   download={file.name}
                   className="block w-full text-center rounded-[12px] py-3 font-semibold bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                   onClick={() => {
                     addHistoryRecord({
                        id: Math.random().toString(36).substring(2),
                        filename: file.name,
                        size: file.size,
                        direction: "received",
                        method: "Relay",
                        timestamp: Date.now(),
                        status: "completed"
                     });
                   }}
                >
                  Save {file.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
