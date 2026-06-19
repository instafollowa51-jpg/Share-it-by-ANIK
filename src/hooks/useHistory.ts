import { useState, useEffect } from "react";

export type TransferRecord = {
  id: string;
  filename: string;
  size: number;
  direction: "sent" | "received";
  method: "P2P" | "Relay";
  timestamp: number;
  status: "completed" | "failed";
};

export function useHistory() {
  const [history, setHistory] = useState<TransferRecord[]>([]);

  useEffect(() => {
    const loaded = localStorage.getItem("shareit_history");
    if (loaded) {
      try {
        setHistory(JSON.parse(loaded));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const addRecord = (record: TransferRecord) => {
    setHistory((prev) => {
      const newHistory = [record, ...prev];
      localStorage.setItem("shareit_history", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("shareit_history");
  };

  return { history, addRecord, clearHistory };
}
