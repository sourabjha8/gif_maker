// @ts-check
/**
 * build-tokens.mjs — single source of truth: design_tokens.json
 *
 * Reads frontend/design_tokens.json and regenerates:
 *   - packages/shared/tokens.ts        (the exported `tokens` object — fully generated)
 *   - app/globals.css                  (only the @theme region between the
 *                                        BEGIN/END GENERATED TOKENS markers)
 *
 * The JSON -> output mapping is intentionally irregular (e.g. JSON `bg-glass-base`
 * becomes the CSS var `--color-spatial-glass` and the TS key `bgGlassBase`), so the
 * name mappings below are explicit tables rather than a generic algorithm. Values
 * always come from the JSON; names/order/selection are fixed by these tables so the
 * generated output stays byte-stable for existing imports and Tailwind classes.
 *
 * Run: `node scripts/build-tokens.mjs` (also runs via `pnpm dev` / `pnpm build`).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'design_tokens.json');
const TOKENS_TS = join(ROOT, 'packages', 'shared', 'tokens.ts');
const GLOBALS_CSS = join(ROOT, 'app', 'globals.css');

const raw = JSON.parse(readFileSync(SOURCE, 'utf8'));
const DS = raw['Virtual XP'].tokens;

// ─── Value accessors ─────────────────────────────────────────────
const color = (group, name) => DS.Color[group][name].value;
const num = (group, name) => DS.Number[group][name].value;
const str = (group, name) => DS.String[group][name].value;

// ─── Mapping tables (JSON key -> output key / css suffix) ────────
// Spatial: [jsonKey, tsKey, cssSuffix | null]. null cssSuffix = not emitted to CSS.
const SPATIAL = [
  ['bg-base', 'bgBase', 'bg'],
  ['bg-glass-base', 'bgGlassBase', 'glass'],
  ['bg-glass-elevated', 'bgGlassElevated', 'glass-elevated'],
  ['border-glass', 'borderGlass', 'border'],
  ['border-elevated', 'borderElevated', 'border-elevated'],
  ['border-active', 'borderActive', 'active'],
  ['glow-glass', 'glowGlass', null],
];

// Typography scale: [jsonKey, key used in both TS and CSS var]
const TYPO = [
  ['H1', 'h1'],
  ['H2', 'h2'],
  ['H3', 'h3'],
  ['Title-Large', 'titleLarge'],
  ['Title-Medium', 'titleMedium'],
  ['Title-Small', 'titleSmall'],
  ['Body-Large', 'bodyLarge'],
  ['Body-Medium', 'bodyMedium'],
  ['Body-Small', 'bodySmall'],
  ['CTA', 'cta'],
];

const WEIGHTS = [
  ['Bold', 'bold'],
  ['SemiBold', 'semiBold'],
  ['Medium', 'medium'],
  ['Regular', 'regular'],
];

const SHADOWS = ['modal', 'card', 'element'];

// CSS-only ordering (differs from the TS object order, matches existing globals.css)
const CSS_SPACING_ORDER = ['tight', 'element', 'group', 'container'];
const CSS_RADIUS_ORDER = ['element', 'card', 'container', 'pill'];

const fontFamily = str('Typography', 'Font-Family');
const fontFallback = str('Typography', 'Font-Fallback');

// ─── tokens.ts generation ────────────────────────────────────────
function scaleLines(group, indent) {
  return Object.entries(DS.Color[group])
    .map(([k, v]) => `${indent}${k}: '${v.value}',`)
    .join('\n');
}

function generateTokensTs() {
  const spatialLines = SPATIAL.map(
    ([jsonKey, tsKey]) => `      ${tsKey}: '${color('Spatial', jsonKey)}',`,
  ).join('\n');

  const spacingLines = Object.entries(DS.Number.Spacing)
    .map(([k, v]) => `    ${k}: ${v.value},`)
    .join('\n');

  const radiusLines = Object.entries(DS.Number.Radius)
    .map(([k, v]) => `    ${k}: ${v.value},`)
    .join('\n');

  const sizeLines = TYPO.map(
    ([jsonKey, key]) => `      ${key}: ${num('Typography-Size', jsonKey)},`,
  ).join('\n');

  const weightLines = WEIGHTS.map(
    ([jsonKey, key]) => `      ${key}: '${num('Typography-Weight', jsonKey)}',`,
  ).join('\n');

  const lineHeightLines = TYPO.map(
    ([jsonKey, key]) => `      ${key}: ${num('Typography-LineHeight', jsonKey)},`,
  ).join('\n');

  const shadowLines = SHADOWS.map(
    (k) => `    ${k}: '${str('Shadow', k)}',`,
  ).join('\n');

  return `/**
 * Virtual XP Design Tokens
 *
 * AUTO-GENERATED from design_tokens.json by scripts/build-tokens.mjs.
 * Do not edit by hand — run \`pnpm build:tokens\` (also runs on \`pnpm dev\` / \`pnpm build\`).
 */

export const tokens = {
  colors: {
    primary: {
      blue: {
${scaleLines('Primary-Blue', '        ')}
      },
    },
    neutral: {
      greys: {
${scaleLines('Neutral-Greys', '        ')}
      },
    },
    spatial: {
${spatialLines}
    },
  },

  spacing: {
${spacingLines}
  },

  radius: {
${radiusLines}
  },

  blur: {
    standard: ${num('Blur', 'standard')},
  },

  typography: {
    fontFamily: '${fontFamily}, ${fontFallback}',
    size: {
${sizeLines}
    },
    weight: {
${weightLines}
    },
    lineHeight: {
${lineHeightLines}
    },
  },

  shadows: {
${shadowLines}
  },
};

export type Tokens = typeof tokens;
`;
}

// ─── globals.css @theme block generation ─────────────────────────
function generateThemeBlock() {
  const I = '  '; // two-space indent inside @theme
  const lines = [];

  lines.push(`${I}/* Colors - Primary Blue */`);
  for (const [k, v] of Object.entries(DS.Color['Primary-Blue'])) {
    lines.push(`${I}--color-primary-${k}: ${v.value};`);
  }
  lines.push('');

  lines.push(`${I}/* Colors - Neutral Greys */`);
  for (const [k, v] of Object.entries(DS.Color['Neutral-Greys'])) {
    lines.push(`${I}--color-neutral-${k}: ${v.value};`);
  }
  lines.push('');

  lines.push(`${I}/* Spatial Design / Glassmorphism */`);
  for (const [jsonKey, , cssSuffix] of SPATIAL) {
    if (cssSuffix === null) continue;
    lines.push(`${I}--color-spatial-${cssSuffix}: ${color('Spatial', jsonKey)};`);
  }
  lines.push('');

  lines.push(`${I}/* Spacing */`);
  for (const k of CSS_SPACING_ORDER) {
    lines.push(`${I}--spacing-${k}: ${num('Spacing', k)}px;`);
  }
  lines.push('');

  lines.push(`${I}/* Radius */`);
  for (const k of CSS_RADIUS_ORDER) {
    lines.push(`${I}--radius-${k}: ${num('Radius', k)}px;`);
  }
  lines.push('');

  lines.push(`${I}/* Typography Sizes */`);
  for (const [jsonKey, key] of TYPO) {
    lines.push(`${I}--text-${key}: ${num('Typography-Size', jsonKey)}px;`);
    lines.push(`${I}--text-${key}--line-height: ${num('Typography-LineHeight', jsonKey)}px;`);
  }
  lines.push('');

  lines.push(`${I}/* Shadows */`);
  for (const k of SHADOWS) {
    lines.push(`${I}--shadow-${k}: ${str('Shadow', k)};`);
  }
  lines.push('');

  lines.push(`${I}/* Fonts */`);
  lines.push(`${I}--font-sans: '${fontFamily}', ${fontFallback};`);

  return lines.join('\n');
}

// ─── Write tokens.ts ─────────────────────────────────────────────
writeFileSync(TOKENS_TS, generateTokensTs(), 'utf8');

// ─── Patch globals.css between markers ───────────────────────────
const BEGIN = '/* BEGIN GENERATED TOKENS';
const END = '/* END GENERATED TOKENS */';
const css = readFileSync(GLOBALS_CSS, 'utf8');

const markerRe = /[ \t]*\/\* BEGIN GENERATED TOKENS[\s\S]*?\/\* END GENERATED TOKENS \*\//;
if (!markerRe.test(css)) {
  console.error(
    `build-tokens: could not find the "${BEGIN} ... ${END}" markers in app/globals.css.\n` +
      'Add them inside the @theme block around the generated design-token variables and re-run.',
  );
  process.exit(1);
}

const beginMarker =
  '  /* BEGIN GENERATED TOKENS — source: design_tokens.json via scripts/build-tokens.mjs. ' +
  'Run `pnpm build:tokens` to regenerate. Do not edit by hand. */';
const endMarker = '  /* END GENERATED TOKENS */';
const replacement = `${beginMarker}\n${generateThemeBlock()}\n${endMarker}`;

const nextCss = css.replace(markerRe, replacement);
writeFileSync(GLOBALS_CSS, nextCss, 'utf8');

console.log('build-tokens: wrote packages/shared/tokens.ts and app/globals.css @theme block.');
