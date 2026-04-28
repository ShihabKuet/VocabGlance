/**
 * VocabGlance Design Tokens
 * Single source of truth for all colors, typography, and spacing.
 * Import this wherever you need consistent values.
 */

export const colors = {
  /** Gold accent – brand color */
  gold:     '#C9912A',
  goldDim:  'rgba(201, 145, 42, 0.12)',
  goldBorder:'rgba(201, 145, 42, 0.26)',

  /** Backgrounds */
  bg:       '#0D0F14',   // deepest background
  surface:  '#131620',   // card / panel surface
  surface2: '#1A1D28',   // elevated surface, inputs
  surface3: '#21253A',   // hover states

  /** Text */
  textPrimary:  '#EAE6DC',
  textMuted:    '#6E6B65',
  textSubtle:   '#9A968E',

  /** Borders */
  border:   '#252833',

  /** Semantic */
  danger:       '#C96060',
  dangerBg:     'rgba(168, 50, 50, 0.10)',
  dangerBorder: 'rgba(168, 50, 50, 0.25)',
  success:      '#6BA86A',
}

export const fonts = {
  serif:  "'Playfair Display', Georgia, serif",
  sans:   "'DM Sans', -apple-system, sans-serif",
  mono:   "'Fira Code', 'Consolas', monospace",
}

export const radii = {
  sm:   6,
  md:   9,
  lg:   12,
  xl:   16,
  '2xl':20,
  full: 9999,
}

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  '2xl':32,
}
