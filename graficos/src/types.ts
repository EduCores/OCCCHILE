export type CategoryType = 
  | 'Carga Crítica'
  | 'Rendimiento Óptimo'
  | 'Umbral Alto'
  | 'Procesamiento L2'
  | 'Balance Concurrente';

export interface ChannelNode {
  id: string; // e.g., 'C-01'
  name: string; // e.g., 'Canal C-01'
  value: number; // percentage e.g., 65
  category: CategoryType;
  color: string; // hex e.g., '#d61f3c'
  gradClass: string; // e.g., 'grad-crimson'
  bandwidthGbps: number;
  latencyMs: number;
  packetsMillions: number;
  errorRatePercent: number;
  temperatureC: number;
  uptimePercent: number;
  paused?: boolean;
}

export interface ModalData {
  nodeId: string;
  title: string;
  subtitle: string;
  category: string;
  val: string;
  gradClass: string;
  numericVal: number;
  bandwidth: string;
  latency: string;
  packets: string;
  errorRate: string;
  temperature: string;
  loadDelta: string;
  efficiencyBadge: string;
  statusType: 'optimal' | 'warning' | 'critical';
  isPaused?: boolean;
}
