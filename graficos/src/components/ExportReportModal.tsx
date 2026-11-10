import React, { useState } from 'react';
import { ChannelNode } from '../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: ChannelNode[];
  efficiencyRate: number;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  channels,
  efficiencyRate,
}) => {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalVal = channels.reduce((acc, c) => acc + c.value, 0);
  const avgLoad = (totalVal / channels.length).toFixed(1);

  const generateReportJSON = () => {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        overallEfficiency: `${efficiencyRate.toFixed(2)}%`,
        averageLoad: `${avgLoad}%`,
        activeChannelsCount: channels.length,
        channels: channels.map((c) => ({
          id: c.id,
          name: c.name,
          loadPercent: `${c.value}%`,
          category: c.category,
          bandwidthGbps: c.bandwidthGbps,
          latencyMs: c.latencyMs,
          errorRatePercent: c.errorRatePercent,
          temperatureC: c.temperatureC,
        })),
      },
      null,
      2
    );
  };

  const generateReportCSV = () => {
    const headers = 'ID,Nombre,Carga %,Categoria,AnchoDeBanda_GBps,Latencia_ms,ErrorRate_Percent,Temp_C\n';
    const rows = channels
      .map(
        (c) =>
          `${c.id},"${c.name}",${c.value},"${c.category}",${c.bandwidthGbps},${c.latencyMs},${c.errorRatePercent},${c.temperatureC}`
      )
      .join('\n');
    return headers + rows;
  };

  const reportText = format === 'json' ? generateReportJSON() : generateReportCSV();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `telemetry-report-${Date.now()}.${format}`;
    const mime = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([reportText], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />

      <div className="relative w-full max-w-2xl glass-modal-panel shadow-modal-glass rounded-3xl p-6 sm:p-8 transform transition-all z-10">
        <div className="flex items-center justify-between pb-4 border-b border-white/70">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700">
              Generador de Informes
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Exportar Reporte de Telemetría</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="my-5 space-y-4">
          <div className="flex items-center justify-between bg-white/50 p-2.5 rounded-xl border border-white/70">
            <span className="text-xs font-semibold text-slate-700">Formato de exportación:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat('json')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  format === 'json' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white/70 text-slate-700 hover:bg-white'
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setFormat('csv')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  format === 'csv' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white/70 text-slate-700 hover:bg-white'
                }`}
              >
                CSV
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="w-full h-60 p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-auto leading-relaxed scrollbar-thin">
              {reportText}
            </pre>
          </div>
        </div>

        <div className="pt-4 border-t border-white/70 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-full bg-white/80 hover:bg-white text-slate-800 text-xs font-semibold shadow-sm border border-white transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copiado' : 'Copiar Portapapeles'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Descargar .{format}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
