import { useState, useEffect, useCallback } from 'react';
import { INITIAL_CHANNELS } from './data';
import { ChannelNode, ModalData } from './types';
import { RadialGaugesCard } from './components/RadialGaugesCard';
import { WaveChartCard } from './components/WaveChartCard';
import { PillBarsCard } from './components/PillBarsCard';
import { StatusBarFooter } from './components/StatusBarFooter';
import { GlassMetricModal } from './components/GlassMetricModal';
import { ExportReportModal } from './components/ExportReportModal';

export default function App() {
  const [channels, setChannels] = useState<ChannelNode[]>(INITIAL_CHANNELS);
  const [optimizadaVal, setOptimizadaVal] = useState<number>(68);
  const [enLineaVal, setEnLineaVal] = useState<number>(94);
  const [efficiencyRate, setEfficiencyRate] = useState<number>(99.98);
  const [lastSyncSec, setLastSyncSec] = useState<number>(3);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals state
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSec((prev) => (prev >= 60 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Function to simulate refreshing telemetry data with smooth variations
  const handleRefreshData = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setChannels((prevChannels) =>
        prevChannels.map((ch) => {
          if (ch.paused) return ch;
          // Random slight fluctuation between -5% and +5%
          const delta = Math.floor(Math.random() * 11) - 5;
          const newVal = Math.min(98, Math.max(15, ch.value + delta));
          return {
            ...ch,
            value: newVal,
            bandwidthGbps: parseFloat(((newVal / 100) * 5.8).toFixed(2)),
            latencyMs: parseFloat((8 + newVal * 0.08).toFixed(1)),
          };
        })
      );

      // Fluctuate radial gauges slightly
      setOptimizadaVal((prev) => Math.min(95, Math.max(50, prev + (Math.floor(Math.random() * 5) - 2))));
      setEnLineaVal((prev) => Math.min(99, Math.max(88, prev + (Math.floor(Math.random() * 3) - 1))));
      setEfficiencyRate(99.95 + Math.random() * 0.04);
      setLastSyncSec(0);
      setIsRefreshing(false);
    }, 600);
  }, []);

  const handleOpenModal = (data: ModalData) => {
    setModalData(data);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleTogglePause = (nodeId: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === nodeId ? { ...ch, paused: !ch.paused } : ch))
    );
    if (modalData && modalData.nodeId === nodeId) {
      setModalData((prev) => (prev ? { ...prev, isPaused: !prev.isPaused } : null));
    }
  };

  // Find if current inspected channel is paused
  const isCurrentChannelPaused = channels.find((c) => c.id === modalData?.nodeId)?.paused ?? false;

  return (
    <div className="min-h-screen p-4 sm:p-8 lg:p-12 flex flex-col justify-center items-center">
      {/* Main Container - NO text above blocks as requested */}
      <main className="w-full max-w-7xl mx-auto space-y-8" data-purpose="metrics-showcase-container">
        
        {/* Top Row: 2 Glassmorphic Blocks (Radial Gauges & Wave Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          <RadialGaugesCard
            onOpenModal={handleOpenModal}
            onRefreshGauges={handleRefreshData}
            isRefreshing={isRefreshing}
            optimizadaVal={optimizadaVal}
            enLineaVal={enLineaVal}
          />

          <WaveChartCard onOpenModal={handleOpenModal} />
        </div>

        {/* Bottom Main Row: Full-width 18 Capsule Pill Bars Block */}
        <PillBarsCard channels={channels} onOpenModal={handleOpenModal} />

        {/* Action & Status Bar */}
        <StatusBarFooter
          efficiencyRate={efficiencyRate}
          lastSyncSec={lastSyncSec}
          onRefreshData={handleRefreshData}
          isRefreshing={isRefreshing}
          onOpenExportReport={() => setIsExportModalOpen(true)}
        />
      </main>

      {/* Interactive Detail Inspect Modal */}
      <GlassMetricModal
        isOpen={isModalOpen}
        data={modalData}
        onClose={handleCloseModal}
        onTogglePause={handleTogglePause}
        isPaused={isCurrentChannelPaused}
      />

      {/* Export Telemetry Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        channels={channels}
        efficiencyRate={efficiencyRate}
      />
    </div>
  );
}
