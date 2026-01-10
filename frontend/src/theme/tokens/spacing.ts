/**
 * Spacing & Layout Tokens - Survivor Fantasy League Design System
 * Extracted from Figma Style Guide
 */

// Spacing scale (following Figma's documented scale)
export const space = {
  px: '1px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  2: '0.5rem',       // 8px - Tight
  3: '0.75rem',      // 12px - Small
  4: '1rem',         // 16px - Medium
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px - Content
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px - Cards
  10: '2.5rem',      // 40px
  12: '3rem',        // 48px
  16: '4rem',        // 64px - Sections
  20: '5rem',        // 80px - Large
  24: '6rem',        // 96px
  32: '8rem',        // 128px - Pages
};

// Border radius tokens
export const radii = {
  none: '0',
  sm: '4px',
  md: '12px',        // Small buttons
  lg: '16px',        // Badges
  xl: '20px',        // Large buttons
  '2xl': '24px',     // Cards
  full: '9999px',    // Pills
};

// Container & grid settings
export const sizes = {
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',  // Max width from Figma
  },
};

// Z-index scale
export const zIndices = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};
