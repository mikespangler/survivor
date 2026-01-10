/**
 * Typography Tokens - Survivor Fantasy League Design System
 * Extracted from Figma Style Guide
 */

export const fonts = {
  heading: '"Survivant", "Bebas Neue", sans-serif',
  body: '"Nunito", system-ui, sans-serif',
  display: '"Fredoka", sans-serif',
};

export const fontSizes = {
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px - Body S
  md: '1rem',         // 16px - Body M
  lg: '1.125rem',     // 18px - Body L, H4
  xl: '1.25rem',      // 20px - Body XL, H3
  '2xl': '1.5rem',    // 24px
  '3xl': '2rem',      // 32px
  '4xl': '2.5rem',    // 40px - H2
  '5xl': '3rem',      // 48px - H1
  '6xl': '4.5rem',    // 72px - Hero
};

export const lineHeights = {
  tight: '1',
  snug: '1.1',
  normal: '1.4',
  relaxed: '1.625',
  hero: '80px',
  h1: '48px',
  h2: '48px',
  h3: '28px',
  h4: '28px',
  bodyXl: '28px',
  bodyL: '28px',
  bodyM: '26px',
  bodyS: '20px',
};

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const letterSpacings = {
  tighter: '-2px',    // Hero
  tight: '-1.2px',    // H1, H2
  normal: '0',
  wide: '0.7px',      // Badge uppercase
};

// Text style presets matching Figma
export const textStyles = {
  hero: {
    fontFamily: 'heading',
    fontSize: '6xl',
    lineHeight: 'hero',
    letterSpacing: 'tighter',
    fontWeight: 'normal',
  },
  h1: {
    fontFamily: 'heading',
    fontSize: '5xl',
    lineHeight: 'h1',
    letterSpacing: 'tight',
    fontWeight: 'normal',
  },
  h2: {
    fontFamily: 'display',
    fontSize: '4xl',
    lineHeight: 'h2',
    letterSpacing: 'tight',
    fontWeight: 'bold',
  },
  h3: {
    fontFamily: 'heading',
    fontSize: 'xl',
    lineHeight: 'h3',
    letterSpacing: '-0.5px',
    fontWeight: 'normal',
  },
  h4: {
    fontFamily: 'display',
    fontSize: 'lg',
    lineHeight: 'h4',
    letterSpacing: '-0.45px',
    fontWeight: 'bold',
  },
  bodyXl: {
    fontFamily: 'body',
    fontSize: 'xl',
    lineHeight: 'bodyXl',
    fontWeight: 'medium',
  },
  bodyL: {
    fontFamily: 'body',
    fontSize: 'lg',
    lineHeight: 'bodyL',
    fontWeight: 'medium',
  },
  bodyM: {
    fontFamily: 'body',
    fontSize: 'md',
    lineHeight: 'bodyM',
    fontWeight: 'medium',
  },
  bodyS: {
    fontFamily: 'body',
    fontSize: 'sm',
    lineHeight: 'bodyS',
    fontWeight: 'medium',
  },
};
