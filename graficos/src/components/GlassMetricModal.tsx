import React, { useState, useEffect } from 'react';
import { ModalData } from '../types';

interface GlassMetricModalProps {
  isOpen: boolean;
  data: ModalData | null;
  onClose: () => void;
  onTogglePause?: (nodeId: string) => void;
  isPaused?: boolean;
}

export const GlassMetricModal: React.FC<GlassMetricModalProps> = ({
  isOpen,
  data,
  onClose,
  onTogglePause,
  isPaused = false,
}) => {
  const [downloadingLogs, setDownloadingLogs] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const handleDownloadLogs = () => {
    setDownloadingLogs(true);
    setTimeout(() => {
      setDownloadingLogs(false);
      setDownloadComplete(true);

      // Create dummy log file download
      const logContent = `--- TELEMETRÍA LOG REPORT ---
Nodo ID: ${data.nodeId}
Fecha: ${new Date().toISOString()}
Estado: ${isPaused ? 'Pausado' : 'En Línea / Óptimo'}
Carga Actual: ${data.val}
Ancho de Banda: ${data.bandwidth} GB/s
Latencia: ${data.latency} ms
Paquetes Transmitidos: ${data.packets}
Tasa de Errores: ${data.errorRate}
Temperatura: ${data.temperature}
Categoría: ${data.category}
------------------------------
System telemetry logs verified.
`;
      const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `telemetry-log-${data.nodeId.toLowerCase()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => setDownloadComplete(false), 2500);
    }, 800);
  };

  const getStatusDotColor = () => {
    if (isPaused) return 'bg-slate-400';
    if (data.statusType === 'warning') return 'bg-amber-500 animate-pulse';
    if (data.statusType === 'critical') return 'bg-rose-500 animate-ping';
    return 'bg-emerald-500 animate-pulse';
  };

  const getStatusText = () => {
    if (isPaused) return 'Pausado Manualmente';
    if (data.statusType === 'warning') return 'Alerta / Umbral Alto';
    if (data.statusType === 'critical') return 'Carga Crítica / Desbalance';
    return 'En Línea / Óptimo';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ease-out"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-node-title"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Main Glass Dialog */}
      <div className="relative w-full max-w-3xl glass-modal-panel shadow-modal-glass rounded-3xl p-6 sm:p-8 transform transition-all duration-300 ease-out max-h-[92vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-white/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full shadow-sm ${getStatusDotColor()}`} />
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-600">
                {getStatusText()}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/80 border border-white/60 font-semibold text-slate-800 shadow-xs">
                {data.category}
              </span>
            </div>
            <h2 id="modal-node-title" className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {data.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">{data.subtitle}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-sm border border-white/80 transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 6 Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 my-6">
          {/* Load */}
          <div className="p-3.5 rounded-2xl glass-modal-subcard shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Carga Actual</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">{data.val}</span>
              <span className={`text-[11px] font-semibold ${data.statusType === 'critical' ? 'text-rose-600' : 'text-emerald-600'}`}>
                {data.loadDelta}
              </span>
            </div>
            <span className="text-[11px] text-slate-600 mt-1">Capacidad asignada</span>
          </div>

          {/* Bandwidth */}
          <div className="p-3.5 rounded-2xl glass-modal-subcard shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Ancho de Banda</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">{data.bandwidth}</span>
              <span className="text-xs text-slate-500 font-semibold">GB/s</span>
            </div>
            <span className="text-[11px] text-slate-600 mt-1">Máx: 6.00 GB/s</span>
          </div>

          {/* Latency */}
          <div className="p-3.5 rounded-2xl glass-modal-subcard shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Latencia Actual</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">{data.latency}</span>
              <span className="text-xs text-slate-500 font-semibold">ms</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1">Óptima (SLO &lt; 20ms)</span>
          </div>

          {/* Packets */}
          <div className="p-3.5 rounded-2xl glass-modal-subcard shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Paquetes Transmitidos</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">{data.packets}</span>
              <span className="text-xs text-slate-500 font-semibold">req</span>
            </div>
            <span className="text-[11px] text-slate-600 mt-1">Ventana de 60 min</span>
          </div>

          {/* Error rate */}
          <div className="p-3.5 rounded-2xl glass-modal-subcard shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Tasa de Errores</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold ${data.statusType === 'critical' ? 'text-rose-600' : 'text-emerald-700'}`}>
                {data.errorRate}
              </span>
            </div>
            <span className="text-[11px] text-slate-600 mt-1">Cluster auto-recuperado</span>
          </div>

          {/* Temp / Uptime */}
          <div className="p-3.5 rounded-2xl glass-modal-subcard shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Temp. / Uptime</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">{data.temperature}</span>
              <span className="text-xs text-slate-500 font-semibold">/ 99.98%</span>
            </div>
            <span className="text-[11px] text-slate-600 mt-1">Refrigeración pasiva</span>
          </div>
        </div>

        {/* 2 Micro-Charts inside Modal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Sparkline 24H */}
          <div className="p-4 rounded-2xl glass-modal-subcard shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">Distribución de Actividad (Últimas 24H)</span>
              <span className="text-[11px] font-semibold text-slate-500">Muestreo horario</span>
            </div>
            <div className="flex items-end justify-between gap-1.5 h-20 pt-2 px-1">
              {[40, 30, 25, 50, 75, 85, 90, 70, 80, 95, 65, 55].map((hVal, idx) => (
                <div
                  key={idx}
                  className={`w-full rounded-t-sm transition-colors ${
                    idx === 9 ? 'bg-indigo-500/80 hover:bg-indigo-600' : 'bg-slate-300/40 hover:bg-slate-400'
                  }`}
                  style={{ height: `${hVal}%` }}
                  title={`${idx * 2}:00 - ${hVal}%`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-200/50">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:59</span>
            </div>
          </div>

          {/* Comparative vs Global Average */}
          <div className="p-4 rounded-2xl glass-modal-subcard shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">Comparación vs. Promedio General</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                {data.efficiencyBadge}
              </span>
            </div>
            <div className="space-y-3 my-auto py-1">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>{data.nodeId !== 'GLOBAL-SLA' ? `Región ${data.nodeId} (Esta Región)` : 'Objetivo Actual'}</span>
                  <span>{data.val}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200/60 p-0.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${data.gradClass}`}
                    style={{ width: `${data.numericVal}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Promedio 16 Regiones</span>
                  <span>68.6%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200/60 p-0.5 overflow-hidden">
                  <div className="h-full rounded-full bg-slate-400 transition-all duration-700" style={{ width: '68.6%' }} />
                </div>
              </div>
            </div>
            <span className="text-[11px] text-slate-600 mt-2 block">
              Umbral óptimo garantizado bajo balance dinámico.
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-5 border-t border-white/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTogglePause && onTogglePause(data.nodeId)}
              className="px-4 py-2 rounded-full bg-white/80 hover:bg-white text-slate-800 text-xs font-semibold shadow-sm border border-white transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span className={`material-symbols-outlined text-[16px] ${isPaused ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isPaused ? 'play_circle' : 'pause_circle'}
              </span>
              {isPaused ? 'Reanudar Balanceo' : 'Pausar Balanceo'}
            </button>

            <button
              onClick={handleDownloadLogs}
              disabled={downloadingLogs}
              className="px-4 py-2 rounded-full bg-white/80 hover:bg-white text-slate-800 text-xs font-semibold shadow-sm border border-white transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-75"
            >
              <span className={`material-symbols-outlined text-[16px] ${downloadingLogs ? 'animate-spin' : downloadComplete ? 'text-emerald-600' : 'text-slate-700'}`}>
                {downloadingLogs ? 'sync' : downloadComplete ? 'check_circle' : 'description'}
              </span>
              {downloadingLogs ? 'Descargando...' : downloadComplete ? 'Logs Guardados' : 'Descargar Logs'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-all ml-auto active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
