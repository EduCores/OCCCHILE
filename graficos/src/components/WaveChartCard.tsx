import React, { useState } from 'react';
import { MONTHLY_VOLUME } from '../data';
import { ModalData } from '../types';

interface WaveChartCardProps {
  onOpenModal: (data: ModalData) => void;
}

export const WaveChartCard: React.FC<WaveChartCardProps> = ({ onOpenModal }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('Sep');
  const [hoveredDay, setHoveredDay] = useState<string | null>('THU');

  const currentMonthData = MONTHLY_VOLUME[selectedMonth] || MONTHLY_VOLUME['Sep'];

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleClickCard = () => {
    onOpenModal({
      nodeId: 'FLOW-WEEKLY',
      title: 'Volumen y Tendencia de Flujo Semanal',
      subtitle: `Análisis telemetry continuo para el mes de ${selectedMonth}. Pico registrado: ${currentMonthData.peak}.`,
      category: 'Tendencia Semanal',
      val: '82%',
      gradClass: 'grad-purple',
      numericVal: 82,
      bandwidth: '5.20',
      latency: '10.8',
      packets: '18.4M',
      errorRate: '0.02%',
      temperature: '42°C',
      loadDelta: currentMonthData.delta,
      efficiencyBadge: '+18.4% Flujo Estable',
      statusType: 'optimal',
    });
  };

  return (
    <article
      onClick={handleClickCard}
      className="lg:col-span-6 rounded-2xl p-6 sm:p-8 glass-card shadow-glass flex flex-col justify-between cursor-pointer hover:border-white transition-all group/wave"
      title="Haga clic para ver detalle de flujo semanal"
    >
      {/* Header with Month Selector */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
            Volumen Procesado
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {currentMonthData.volume}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 font-semibold">
              {currentMonthData.delta}
            </span>
          </div>
        </div>

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="appearance-none text-xs font-semibold text-slate-800 bg-white/70 hover:bg-white/90 transition-colors pl-3.5 pr-8 py-1.5 rounded-full shadow-sm cursor-pointer outline-none border-0 focus:ring-2 focus:ring-purple-400"
          >
            <option value="Sep">Sep</option>
            <option value="Ago">Ago</option>
            <option value="Jul">Jul</option>
            <option value="Jun">Jun</option>
          </select>
          <span className="material-symbols-outlined text-[16px] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600">
            keyboard_arrow_down
          </span>
        </div>
      </div>

      {/* Fluid Organic Wave Chart */}
      <div className="relative w-full h-56 my-2 flex flex-col justify-end">
        {/* Horizontal Grid lines with scale labels */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] text-slate-500/70 w-6 text-right">100</span>
            <div className="w-full h-px bg-white/50"></div>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] text-slate-500/70 w-6 text-right">80</span>
            <div className="w-full h-px bg-white/40"></div>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] text-slate-500/70 w-6 text-right">60</span>
            <div className="w-full h-px bg-white/35"></div>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] text-slate-500/70 w-6 text-right">40</span>
            <div className="w-full h-px bg-white/30"></div>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] text-slate-500/70 w-6 text-right">20</span>
            <div className="w-full h-px bg-white/20"></div>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] text-slate-500/70 w-6 text-right">0</span>
            <div className="w-full h-px bg-white/40"></div>
          </div>
        </div>

        {/* SVG Curve Spline with Gradient Fill */}
        <div className="relative w-full h-40 pl-9 pr-2">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 160">
            <defs>
              <linearGradient id="waveFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#b5179e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#d946ef" stopOpacity="0.25" />
              </linearGradient>

              <linearGradient id="waveStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#c026d3" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>

              <filter id="glow-pearl" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#7c3aed" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* Filled spline path */}
            <path
              d="M 0 160 
                 L 0 85 
                 C 25 80, 40 120, 65 120 
                 C 90 120, 115 35, 145 35 
                 C 175 35, 195 140, 225 140 
                 C 255 140, 275 105, 305 108 
                 C 330 110, 345 120, 365 100 
                 C 385 80, 395 38, 415 38 
                 C 435 38, 455 88, 475 75 
                 C 485 70, 495 65, 500 68 
                 L 500 160 Z"
              fill="url(#waveFill)"
            />

            {/* Stroke path */}
            <path
              d="M 0 85 
                 C 25 80, 40 120, 65 120 
                 C 90 120, 115 35, 145 35 
                 C 175 35, 195 140, 225 140 
                 C 255 140, 275 105, 305 108 
                 C 330 110, 345 120, 365 100 
                 C 385 80, 395 38, 415 38 
                 C 435 38, 455 88, 475 75 
                 C 485 70, 495 65, 500 68"
              fill="none"
              stroke="url(#waveStroke)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Floating Pearl Scrubber Dot at THU peak (x=415, y=38) */}
            <g className="cursor-pointer group-hover/wave:scale-125 transition-transform origin-center">
              <circle cx="415" cy="38" r="9" fill="#ffffff" filter="url(#glow-pearl)" />
              <circle cx="415" cy="38" r="3.5" fill="#8b5cf6" />
            </g>
          </svg>
        </div>

        {/* Week Day Axis */}
        <div className="flex justify-between pl-12 pr-4 pt-2 text-xs font-semibold text-slate-600">
          {currentMonthData.points.map((pt) => {
            const isSelected = hoveredDay === pt.day;
            return (
              <span
                key={pt.day}
                onMouseEnter={() => setHoveredDay(pt.day)}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'text-purple-700 font-bold underline decoration-2 underline-offset-4' : 'hover:text-slate-900'
                }`}
              >
                {pt.day}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer details */}
      <div className="pt-4 border-t border-white/50 flex items-center justify-between text-slate-700 text-xs">
        <span>
          Pico semanal: <strong>{currentMonthData.peak}</strong>
        </span>
        <span className="inline-flex items-center gap-1 text-purple-700 font-semibold hover:underline">
          Analítica de flujo
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </span>
      </div>
    </article>
  );
};
