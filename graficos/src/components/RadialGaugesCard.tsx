import React from 'react';
import { ModalData } from '../types';

interface RadialGaugesCardProps {
  onOpenModal: (data: ModalData) => void;
  onRefreshGauges: () => void;
  isRefreshing: boolean;
  optimizadaVal: number;
  enLineaVal: number;
}

export const RadialGaugesCard: React.FC<RadialGaugesCardProps> = ({
  onOpenModal,
  onRefreshGauges,
  isRefreshing,
  optimizadaVal,
  enLineaVal,
}) => {
  // SVG stroke-dash calculations
  // Gauge 1: 46 radius => circumference = 2 * PI * 46 ≈ 289
  const circ1 = 289;
  const offset1 = circ1 * (1 - optimizadaVal / 100);

  // Gauge 2: 50 radius => circumference = 2 * PI * 50 ≈ 314
  const circ2 = 314;
  const offset2 = circ2 * (1 - enLineaVal / 100);

  const handleClickCard = () => {
    onOpenModal({
      nodeId: 'GLOBAL-SLA',
      title: 'Telemetría Operativa: Objetivos & SLA',
      subtitle: `Disponibilidad consolidada de todos los clusters (${enLineaVal}%) y fase activa (${optimizadaVal}%).`,
      category: 'Disponibilidad Global',
      val: `${enLineaVal}%`,
      gradClass: 'grad-emerald',
      numericVal: enLineaVal,
      bandwidth: '5.80',
      latency: '8.4',
      packets: '24.5M',
      errorRate: '0.04%',
      temperature: '41°C',
      loadDelta: '+3.2%',
      efficiencyBadge: '+14.2% Óptimo',
      statusType: 'optimal',
    });
  };

  return (
    <article
      onClick={handleClickCard}
      className="lg:col-span-6 rounded-2xl p-6 sm:p-8 glass-card shadow-glass flex flex-col justify-between cursor-pointer hover:border-white transition-all group/card"
      title="Haga clic para ver telemetría global"
    >
      {/* Block Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
            Telemetría Operativa
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover/card:text-slate-800 transition-colors">
            Objetivos & Disponibilidad
          </h2>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRefreshGauges();
          }}
          className="p-2 rounded-full bg-white/70 shadow-sm text-slate-700 inline-flex items-center justify-center group-hover/card:bg-white transition-all duration-300 hover:scale-110 active:scale-95"
          title="Actualizar indicadores"
        >
          <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : 'group-hover/card:rotate-180 transition-transform duration-500'}`}>
            sync
          </span>
        </button>
      </div>

      {/* Two Radial Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-auto py-4">
        {/* Gauge 1: Fase Operativa (68% default) */}
        <div className="flex flex-col items-center">
          <div className="relative w-44 h-44 rounded-full p-3.5 shadow-neumorph-inset bg-slate-200/40 flex items-center justify-center transition-transform group-hover/card:scale-105 duration-300">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="grad-ring-blue-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <circle
                cx="60"
                cy="60"
                r="46"
                fill="transparent"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="10"
              />
              <circle
                className="transition-all duration-1000 ease-out"
                cx="60"
                cy="60"
                r="46"
                fill="transparent"
                stroke="url(#grad-ring-blue-cyan)"
                strokeWidth="10"
                strokeDasharray={circ1}
                strokeDashoffset={offset1}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-7 rounded-full bg-white shadow-neumorph-float flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                {optimizadaVal}%
              </span>
              <span className="text-[11px] text-slate-500 font-semibold uppercase">
                Optimizada
              </span>
            </div>
          </div>
          <div className="text-center mt-4">
            <h3 className="text-sm font-bold text-slate-800">Fase Operativa</h3>
            <p className="text-xs text-slate-600">Consolidación de clusters</p>
          </div>
        </div>

        {/* Gauge 2: Disponibilidad SLA (94% default) */}
        <div className="flex flex-col items-center">
          <div className="relative w-44 h-44 rounded-full p-3.5 shadow-neumorph-inset bg-slate-200/40 flex items-center justify-center transition-transform group-hover/card:scale-105 duration-300">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="grad-ring-emerald-green" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ba74a" />
                  <stop offset="100%" stopColor="#047526" />
                </linearGradient>
              </defs>
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="5"
              />
              <circle
                className="transition-all duration-1000 ease-out"
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="url(#grad-ring-emerald-green)"
                strokeWidth="6"
                strokeDasharray={circ2}
                strokeDashoffset={offset2}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-7 rounded-full bg-white shadow-neumorph-float flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                {enLineaVal}%
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold uppercase">
                En Línea
              </span>
            </div>
          </div>
          <div className="text-center mt-4">
            <h3 className="text-sm font-bold text-slate-800">Disponibilidad SLA</h3>
            <p className="text-xs text-slate-600">Tolerancia activa a fallos</p>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-white/50 flex items-center justify-between text-slate-700 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          Respaldo geo-distribuido
        </span>
        <span className="font-semibold text-slate-800">Tasa de fallo: 0.04%</span>
      </div>
    </article>
  );
};
