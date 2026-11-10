import React from 'react';

interface StatusBarFooterProps {
  efficiencyRate: number;
  lastSyncSec: number;
  onRefreshData: () => void;
  isRefreshing: boolean;
  onOpenExportReport: () => void;
}

export const StatusBarFooter: React.FC<StatusBarFooterProps> = ({
  efficiencyRate,
  lastSyncSec,
  onRefreshData,
  isRefreshing,
  onOpenExportReport,
}) => {
  return (
    <footer className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-full glass-card shadow-glass">
      <div className="flex items-center gap-3 px-3">
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
        </span>
        <span className="text-sm text-slate-800 font-medium">
          Infraestructura Operando al{' '}
          <strong className="font-bold text-emerald-700">{efficiencyRate.toFixed(2)}%</strong> de Eficiencia
        </span>
        <span className="hidden md:inline text-slate-400">•</span>
        <span className="hidden md:inline text-xs text-slate-600">
          Última sincronización: hace {lastSyncSec} {lastSyncSec === 1 ? 'segundo' : 'segundos'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="px-5 py-2.5 rounded-full bg-white/70 hover:bg-white text-slate-800 text-xs font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95 disabled:opacity-75"
        >
          <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>
            sync
          </span>
          Actualizar Datos
        </button>

        <button
          onClick={onOpenExportReport}
          className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 active:scale-95 hover:shadow-lg"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Exportar Reporte
        </button>
      </div>
    </footer>
  );
};
