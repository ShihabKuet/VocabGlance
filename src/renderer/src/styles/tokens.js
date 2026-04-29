/**
 * VocabGlance Design Tokens
 * Two complete theme palettes — dark (default) and light.
 * Components never hardcode colors; they always consume from ThemeContext.
 */

export const darkTheme = {
  name: 'dark',

  gold:        '#C9912A',
  goldDim:     'rgba(201, 145, 42, 0.12)',
  goldBorder:  'rgba(201, 145, 42, 0.26)',

  bg:          '#0D0F14',
  surface:     '#131620',
  surface2:    '#1A1D28',
  surface3:    '#21253A',

  textPrimary: '#EAE6DC',
  textMuted:   '#6E6B65',
  textSubtle:  '#9A968E',

  border:      '#252833',

  // Popup specific
  popupBg:     'rgba(10, 12, 18, 0.97)',
  popupBorder: 'rgba(201, 145, 42, 0.44)',
  popupShadow: '0 0 0 1px rgba(201,145,42,0.06), 0 28px 72px rgba(0,0,0,0.82)',

  // Header blur
  headerBg:    'rgba(13, 15, 20, 0.92)',

  danger:      '#C96060',
  dangerBg:    'rgba(168, 50, 50, 0.10)',
  dangerBorder:'rgba(168, 50, 50, 0.25)',
  success:     '#6BA86A',
}

export const lightTheme = {
  name: 'light',

  gold:        '#A67420',
  goldDim:     'rgba(166, 116, 32, 0.10)',
  goldBorder:  'rgba(166, 116, 32, 0.30)',

  bg:          '#F0EDE8',
  surface:     '#FAFAF8',
  surface2:    '#EDEBE6',
  surface3:    '#E4E1DA',

  textPrimary: '#1A1814',
  textMuted:   '#7A776F',
  textSubtle:  '#5A574F',

  border:      '#D8D4CC',

  // Popup specific
  popupBg:     'rgba(250, 248, 244, 0.98)',
  popupBorder: 'rgba(166, 116, 32, 0.35)',
  popupShadow: '0 0 0 1px rgba(166,116,32,0.08), 0 28px 72px rgba(0,0,0,0.18)',

  // Header blur
  headerBg:    'rgba(240, 237, 232, 0.92)',

  danger:      '#C04040',
  dangerBg:    'rgba(168, 50, 50, 0.08)',
  dangerBorder:'rgba(168, 50, 50, 0.22)',
  success:     '#4A884A',
}

export const fonts = {
  serif: "'Playfair Display', Georgia, serif",
  sans:  "'DM Sans', -apple-system, sans-serif",
  mono:  "'Fira Code', 'Consolas', monospace",
}

export const radii = {
  sm:    6,
  md:    9,
  lg:    12,
  xl:    16,
  '2xl': 20,
  full:  9999,
}

export const spacing = {
  xs:    4,
  sm:    8,
  md:    12,
  lg:    16,
  xl:    24,
  '2xl': 32,
}
