import { useState, useEffect, useRef } from 'react';
import { CommandLineIcon, PlayIcon, PauseIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function SystemLogsPage() {
  const [logs, setLogs] = useState([
    "[SYSTEM] Agent 22 Platform initialized",
    "[INFO] Connected to Database",
    "[INFO] Initialized Kafka Schema Registry connection",
    "[INFO] Loading standard architecture blueprints..."
  ]);
  const [isPaused, setIsPaused] = useState(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const messages = [
        "[INFO] Heartbeat check successful (api-gateway)",
        "[DEBUG] Fetching new generation requests",
        "[INFO] Synchronizing RAG embeddings with ChromaDB",
        "[WARN] Delayed response from vector store (210ms)",
        "[INFO] Validating schema registry compliance",
        "[DEBUG] Kafka brokers (dev-broker:9092) are healthy",
        "[INFO] Polling Kubernetes cluster status"
      ];
      
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      setLogs(prev => [...prev.slice(-100), `${timestamp} ${randomMsg}`]);
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">Platform Telemetry Logs</h1>
          <p className="text-text-secondary mt-1">Live streaming logs from Agent 22 orchestrator and services.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border shadow-sm ${
              isPaused ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button 
            onClick={() => setLogs([])}
            className="flex items-center gap-2 bg-white text-red-600 border border-gray-200 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <TrashIcon className="w-5 h-5" /> Clear
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#1E1E1E] rounded-xl shadow-lg border border-gray-800 overflow-hidden flex flex-col font-mono text-sm">
        <div className="bg-black/40 border-b border-gray-800 px-4 py-2 flex items-center gap-2 text-gray-400">
          <CommandLineIcon className="w-4 h-4" />
          <span>system-orchestrator.log</span>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-1">
          {logs.map((log, i) => {
            let color = 'text-gray-300';
            if (log.includes('[WARN]')) color = 'text-yellow-400';
            if (log.includes('[ERROR]')) color = 'text-red-500';
            if (log.includes('[SYSTEM]')) color = 'text-blue-400 font-bold';
            
            return (
              <div key={i} className={`${color} leading-relaxed break-all`}>
                {log}
              </div>
            );
          })}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
