import React, { useState } from 'react';
import { ChannelNode, ModalData } from '../types';

interface PillBarsCardProps {
  channels: ChannelNode[];
  onOpenModal: (data: ModalData) => void;
}

export const PillBarsCard: React.FC<PillBarsCardProps> = ({ channels, onOpenModal }) => {
  const [activeTimeframe, setActiveTimeframe] = useState<string>('Tiempo Real');

  // Compute aggregate stats dynamically
  const totalValue = channels.reduce((sum, ch) => sum + ch.value, 0);
  const avgPercent = channels.length > 0 ? (totalValue / channels.length).toFixed(1) : '68.6';
  const availablePercent = (100 - parseFloat(avgPercent)).toFixed(1);

  const handleBarClick = (channel: ChannelNode) => {
    onOpenModal({
      nodeId: channel.id,
      title: `Detalle Regional: ${channel.name} (${channel.id})`,
      subtitle: `Telemetría en tiempo real y asignación de ancho de banda para la región ${channel.name}.`,
      category: channel.category,
      val: `${channel.value}%`,
      gradClass: channel.gradClass,
      numericVal: channel.value,
      bandwidth: channel.bandwidthGbps.toFixed(2),
      latency: channel.latencyMs.toFixed(1),
      packets: `${channel.packetsMillions.toFixed(1)}M`,
      errorRate: `${channel.errorRatePercent.toFixed(2)}%`,
      temperature: `${channel.temperatureC}°C`,
      loadDelta: channel.value >= 85 ? '+14.2%' : channel.value <= 35 ? '-12.0%' : '+3.5%',
      efficiencyBadge: channel.value >= 85 ? '+26.4% Pico Máx' : channel.value <= 35 ? '-33.6% Subutilizado' : '+11.8% Eficiencia',
      statusType: channel.value >= 85 ? 'warning' : channel.value <= 35 ? 'critical' : 'optimal',
    });
  };

  return (
    <section
      className="w-full rounded-2xl p-6 sm:p-8 lg:p-10 glass-card shadow-glass relative overflow-hidden"
      data-purpose="pill-bars-chart"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 text-slate-800 text-xs font-semibold mb-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
            {channels.length} Puntos de Control / En Vivo
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Distribución de Capacidad y Actividad por Canal
          </h2>
          <p className="text-sm text-slate-700 mt-0.5">
            Respuesta proporcional y asignación de ancho de banda por nodo en tiempo real. Haga clic en cualquier barra para ver el desglose modal.
          </p>
        </div>

        {/* Timeframe selector tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/60 shadow-sm self-start md:self-auto">
          {['Tiempo Real', '1H', '24H', '7D'].map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                activeTimeframe === tf
                  ? 'font-semibold bg-white text-slate-900 shadow-sm'
                  : 'font-medium text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Scroll Capsule Container (18 Pill Bars) */}
      <div className="w-full overflow-x-auto pb-4 pt-2 scrollbar-none">
        <div className="flex justify-between items-end gap-2 sm:gap-3 w-full min-w-[760px] h-[260px] px-1">
          {channels.map((ch) => (
            <div
              key={ch.id}
              onClick={() => handleBarClick(ch)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBarClick(ch);
                }
              }}
              className="flex flex-col items-center flex-1 max-w-[44px] group interactive-pill focus:outline-none"
              role="button"
              tabIndex={0}
              title={`Ver detalle de la región ${ch.name} (${ch.id}): ${ch.value}%`}
            >
              {/* Outer Capsule Slot */}
              <div className="w-full h-[200px] rounded-full glass-pill-slot shadow-pill-depth p-1 flex flex-col justify-end overflow-hidden relative">
                {/* Inner Filled Bar */}
                <div
                  className={`w-full rounded-full ${ch.gradClass} shadow-md flex items-center justify-center transition-all duration-500 group-hover:brightness-110`}
                  style={{ height: `${ch.value}%` }}
                >
                  <span className="text-[10px] sm:text-[11px] font-bold text-white drop-shadow-sm select-none">
                    {ch.value}%
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 mt-2 text-center group-hover:text-slate-950">
                {ch.id}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Legend & Aggregates */}
      <div className="mt-8 pt-6 border-t border-white/50 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-700">
        {/* Category color badges */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full grad-crimson"></span>
            <span>Carga Crítica</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full grad-emerald"></span>
            <span>Rendimiento Óptimo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full grad-amber"></span>
            <span>Umbral Alto</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full grad-purple"></span>
            <span>Procesamiento L2</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full grad-blue"></span>
            <span>Balance Concurrente</span>
          </div>
        </div>

        {/* Global summary metrics */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <span>
            Promedio Global: <strong className="text-slate-900 font-bold">{avgPercent}%</strong>
          </span>
          <span className="text-slate-400">|</span>
          <span>
            Capacidad Disponible: <strong className="text-emerald-700 font-bold">{availablePercent}%</strong>
          </span>
        </div>
      </div>
    </section>
  );
};
