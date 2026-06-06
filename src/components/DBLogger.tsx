/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../db/databaseService';
import { Database, Terminal, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function DBLogger() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = () => {
    setLogs(dbService.getLogs());
  };

  useEffect(() => {
    fetchLogs();
    // Poll logs every second to show live changes as users insert/delete items
    const interval = setInterval(fetchLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    dbService.clearLogs();
    setLogs([]);
  };

  return (
    <div 
      className="fixed bottom-4 left-4 z-40 transition-all duration-300 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a] overflow-hidden"
      style={{ width: isOpen ? '450px' : '220px' }}
      id="db-logger-container"
    >
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
        className="w-full h-11 px-4 flex items-center justify-between text-xs font-mono font-medium transition-colors bg-gray-50 hover:bg-gray-100 dark:bg-[#1e293b] dark:hover:bg-[#334155] text-gray-700 dark:text-gray-300 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        id="btn-toggle-logger"
      >
        <span className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>کنسول هماهنگی دیتابیس</span>
        </span>
        <span className="flex items-center gap-2">
          {isOpen ? (
            <>
              <button 
                onClick={handleClear}
                title="پاک کردن لاگ‌ها"
                className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors focus:outline-none"
                id="btn-clear-db-logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ChevronDown className="w-4 h-4" />
            </>
          ) : (
            <>
              <span className="bg-emerald-500/15 text-emerald-500 text-[10px] px-1.5 py-0.5 rounded-full">
                {logs.length}
              </span>
              <ChevronUp className="w-4 h-4" />
            </>
          )}
        </span>
      </div>

      {/* Log list */}
      {isOpen && (
        <div className="h-64 overflow-y-auto p-3 font-mono text-[10px] space-y-2 bg-gray-950 text-[#38bdf8] leading-relaxed select-all" dir="ltr" id="db-logger-logs">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8 italic font-sans">هیچ ردی کدی صادر نشده است. فعالیتی در برنامه انجام دهید.</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="border-b border-gray-900 pb-1.5 last:border-0">
                <div className="flex items-center justify-between text-gray-400 text-[9px] mb-0.5">
                  <span className="flex items-center gap-1 font-bold">
                    <Terminal className="w-3 h-3 text-emerald-400" />
                    <span className={
                      log.type === 'SQLITE' ? 'text-amber-400' :
                      log.type === 'INDEXEDDB' ? 'text-[#38bdf8]' : 'text-gray-300'
                    }>
                      [{log.type}]
                    </span>
                  </span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="text-gray-200 select-all whitespace-pre-wrap font-mono font-medium">
                  {log.query}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
