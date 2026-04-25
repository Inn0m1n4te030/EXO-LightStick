export const COLORS = {
  bg: '#050505',
  surface1: '#0A0A0A',
  surface2: '#141414',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.18)',
  text: '#FFFFFF',
  textDim: 'rgba(255,255,255,0.6)',
  textFaint: 'rgba(255,255,255,0.3)',
  pearlBlue: '#A6C1EE',
  glow: 'rgba(166,193,238,0.6)',
  success: '#00FF9D',
  warning: '#FFB800',
  error: '#FF3366',
};

export type MemberColor = {
  id: string;
  name: string;
  color: string;
};

export const MEMBER_COLORS: MemberColor[] = [
  { id: 'official', name: 'EXO Pearl', color: '#A6C1EE' },
  { id: 'xiumin', name: 'Xiumin', color: '#99CCFF' },
  { id: 'suho', name: 'Suho', color: '#0066CC' },
  { id: 'lay', name: 'Lay', color: '#CC99FF' },
  { id: 'baekhyun', name: 'Baekhyun', color: '#FFFFFF' },
  { id: 'chen', name: 'Chen', color: '#FFFF66' },
  { id: 'chanyeol', name: 'Chanyeol', color: '#FF3333' },
  { id: 'do', name: 'D.O.', color: '#B0B0B0' },
  { id: 'kai', name: 'Kai', color: '#8B0000' },
  { id: 'sehun', name: 'Sehun', color: '#66CC99' },
];

export const PATTERNS = [
  { id: 'solid', name: 'Solid', desc: 'Steady glow' },
  { id: 'blink', name: 'Blink', desc: 'On/off rhythm' },
  { id: 'pulse', name: 'Pulse', desc: 'Soft heartbeat' },
  { id: 'strobe', name: 'Strobe', desc: 'Fast flash' },
  { id: 'rainbow', name: 'Rainbow', desc: 'Color flow' },
  { id: 'wave', name: 'Wave', desc: 'Breathing wave' },
];
