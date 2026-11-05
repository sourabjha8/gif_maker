export interface Frame {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  beforeImage: string | null;
  afterImage: string | null;
  sliderPosition?: number;
  sliderDirection?: 'ltr' | 'rtl' | 'ttb' | 'btt';
  // Where the reveal animation/export starts from (0-100%), instead of always starting at 0.
  sliderOffset?: number;
  duration: number; // seconds
  pauseDuration: number; // seconds
  animationStyle: 'smooth' | 'linear' | 'elastic' | 'bounce';
}
