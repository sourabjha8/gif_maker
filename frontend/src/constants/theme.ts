// Design tokens — derived from design_style.md (Framer-style dark system)
export const colors = {
  bg: 'bg-[#090909]', // canvas
  surface: 'bg-[#141414]', // surface-1
  surface2: 'bg-[#1c1c1c]', // surface-2 (lift for "selected" states)
  border: 'border-[#262626]', // hairline
  borderSoft: 'border-[#1a1a1a]', // hairline-soft
  textPrimary: 'text-[#ffffff]', // ink
  textSecondary: 'text-[#999999]', // ink-muted
  link: 'text-[#0099ff]', // accent-blue — signal only: links, focus, selection
  linkHover: 'hover:text-[#33aaff]',
  transition: 'transition-all duration-200 ease-out',
};

// Every primary CTA is a white pill on dark canvas — never a chromatic fill.
export const buttonPrimary = 'bg-white text-black hover:bg-[#f2f2f2]';
// Secondary actions live as charcoal pills.
export const buttonSecondary = `${colors.surface} ${colors.textPrimary} hover:bg-[#1c1c1c]`;

export const radius = {
  xs: 'rounded-[4px]',
  sm: 'rounded-[6px]',
  md: 'rounded-[10px]',
  lg: 'rounded-[15px]',
  xl: 'rounded-[20px]',
  xxl: 'rounded-[30px]',
  pill: 'rounded-full',
  full: 'rounded-full',
};

// Typography hierarchy (Inter Variable stand-in for GT Walsheim; tight negative tracking on display sizes).
export const typography = {
  displayMd: 'font-semibold tracking-[-0.03em]',
  headline: 'font-bold tracking-[-0.02em]',
  subhead: 'font-normal tracking-[-0.01em]',
  bodySm: 'font-medium tracking-[-0.01em]',
  caption: 'font-medium tracking-[-0.01em]',
  micro: 'font-normal tracking-[-0.01em]',
  button: 'font-medium tracking-[-0.01em]',
};
