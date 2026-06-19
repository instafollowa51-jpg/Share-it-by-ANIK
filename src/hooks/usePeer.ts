import { useEffect, useState, useRef } from "react";
import Peer, { DataConnection } from "peerjs";
import { formatBytes } from "../lib/utils";

export type ConnectionState = "disconnected" | "connecting" | "waiting" | "connected";
export type TransferMode = "P2P" | "Relay" | null;

export interface TransferProgress {
  progress: number;
  speed: string;
  eta: string;
  bytesTransferred: number;
  totalBytes: number;
}

export function usePeer(identifier?: string) {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [conn, setConnState] = useState<DataConnection | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  const setConn = (connection: DataConnection | null) => {
    connRef.current = connection;
    setConnState(connection);
  };

  const [sessionId, setSessionId] = useState<string>("");
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [transferMode, setTransferMode] = useState<TransferMode>(null);
  const [progressInfo, setProgressInfo] = useState<TransferProgress | null>(null);
  const [receivedFiles, setReceivedFiles] = useState<{name: string, url: string, type: string, size: number}[]>([]);
  const [remoteReady, setRemoteReady] = useState(false);

  // Buffer state for receiving
  const [incomingMetadata, setIncomingMetadata] = useState<any>(null);
  const receivedChunks = useRef<ArrayBuffer[]>([]);
  const receivedBytes = useRef(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    // Generate a session ID
    const id = identifier || Math.random().toString(36).substring(2, 10).toUpperCase();
    setSessionId(id);

    const newPeer = new Peer(id, {
      debug: 1, // Change to 3 for detailed logging
    });

    newPeer.on("open", (openedId) => {
      console.log(`My peer ID is: ${openedId}`);
      setPeer(newPeer);
      setConnectionState("waiting");
    });

    newPeer.on("error", (err: any) => {
      console.error("PeerJS Error:", err);
      if (err.type === "peer-unavailable" || err.type === "network" || err.type === "server-error") {
        setConnectionState("waiting");
      } else if (err.type === "browser-incompatible" || err.type === "webrtc") {
        setConnectionState("disconnected");
      }
    });

    newPeer.on("disconnected", () => {
      setConnectionState("waiting");
    });

    newPeer.on("connection", (connection) => {
      console.log("Remote peer connected!");
      // If we're already connected to someone else, we might want to ignore or close the new one
      // Let's just setup the connection
      setupConnection(connection);
    });

    return () => {
      newPeer.destroy();
    };
  }, [identifier]);

  const connectToPeer = (otherId: string) => {
    if (!peer || connectionState === "connected") return;
    setConnectionState("connecting");
    const connection = peer.connect(otherId, { reliable: true });
    
    connection.on("error", (err) => {
       console.error("Connection error:", err);
       setConnectionState("waiting");
    });
    
    setupConnection(connection);
  };

  const setupConnection = (newConnection: DataConnection) => {
    if (connRef.current) {
       connRef.current.close();
    }
    setConn(newConnection);
    
    newConnection.on("open", () => {
      setConnectionState("connected");
      setTransferMode("P2P");
      newConnection.send({ type: "READY" });
    });

    newConnection.on("data", (data: any) => {
      if (data.type === "READY") {
        setRemoteReady(true);
      }
      if (data.type === "FILE_META") {
        setIncomingMetadata(data.meta);
        receivedChunks.current = [];
        receivedBytes.current = 0;
        startTime.current = Date.now();
        setProgressInfo({ progress: 0, speed: "0 B/s", eta: "--", bytesTransferred: 0, totalBytes: data.meta.size });
        newConnection.send({ type: "ACK_META" });
      }
      if (data.type === "FILE_CHUNK") {
        receivedChunks.current.push(data.chunk);
        receivedBytes.current += data.chunk.byteLength;
        
        // Update progress
        updateProgress(receivedBytes.current, incomingMetadata?.size || data.meta.size);

        if (data.isLast) {
          // Reconstruct file
          const blob = new Blob(receivedChunks.current, { type: data.meta.type });
          const url = URL.createObjectURL(blob);
          setReceivedFiles(prev => [...prev, { name: data.meta.name, url, type: data.meta.type, size: data.meta.size }]);
          setProgressInfo(null);
          newConnection.send({ type: "TRANSFER_COMPLETE", name: data.meta.name });
        }
      }
      if (data.type === "TRANSFER_COMPLETE") {
        setProgressInfo(null);
      }
    });

    newConnection.on("close", () => {
      setConnectionState("waiting");
      setConn(null);
    });

    newConnection.on("error", (err) => {
       console.error("Connection error event:", err);
       setConnectionState("waiting");
       setConn(null);
    });
  };

  const updateProgress = (transferred: number, total: number) => {
    const elapsedSeconds = (Date.now() - startTime.current) / 1000;
    const speedBytes = elapsedSeconds > 0 ? transferred / elapsedSeconds : 0;
    const remainingBytes = total - transferred;
    const etaSeconds = speedBytes > 0 ? remainingBytes / speedBytes : 0;
    
    setProgressInfo({
      progress: Math.min(100, Math.round((transferred / total) * 100)),
      speed: `${formatBytes(speedBytes)}/s`,
      eta: formatETA(etaSeconds),
      bytesTransferred: transferred,
      totalBytes: total,
    });
  };

  const formatETA = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const sendFileP2P = async (file: File) => {
    if (!connRef.current || connectionState !== "connected") return false;
    const activeConn = connRef.current;
    
    return new Promise<boolean>((resolve) => {
      startTime.current = Date.now();
      
      const chunkSize = 64 * 1024; // 64KB chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      
      const meta = { name: file.name, size: file.size, type: file.type, totalChunks };
      activeConn.send({ type: "FILE_META", meta });

      // In a real app we might use data channel buffering checks. 
      // Simplified blocking read loop.
      let offset = 0;
      let chunkIndex = 0;

      const readNext = () => {
        const slice = file.slice(offset, offset + chunkSize);
        const reader = new FileReader();

        reader.onload = (e) => {
          if (!e.target?.result) return;
          const isLast = chunkIndex === totalChunks - 1;
          
          activeConn.send({
            type: "FILE_CHUNK",
            meta: { ...meta },
            chunk: e.target.result,
            isLast
          });

          offset += chunkSize;
          chunkIndex++;
          updateProgress(offset, file.size);

          if (!isLast) {
             // Slight timeout to let UI breathe and not choke buffer immediately
             setTimeout(readNext, 1);
          } else {
             setProgressInfo(null);
             resolve(true);
          }
        };
        reader.readAsArrayBuffer(slice);
      };

      // Wait for ACK before sending chunks
      const handleAck = (data: any) => {
         if (data.type === "ACK_META") {
            activeConn.off("data", handleAck);
            readNext();
         }
      };
      
      activeConn.on("data", handleAck);
    });
  };

  return { peer, sessionId, connectionState, transferMode, progressInfo, setTransferMode, sendFileP2P, receivedFiles, remoteReady, connectToPeer };
}
