/**
 * Color Tokens - Survivor Fantasy League Design System
 * Extracted from Figma Style Guide
 */

export const colors = {
  // Brand Colors
  brand: {
    primary: '#F06542',      // Orange Primary - CTAs, badges, icons, accents
    shadow: '#C34322',       // Orange Shadow - Button drop shadows, depth
    purple: '#6B7ECB',       // Purple Accent - Gradients, secondary accents
    yellow: '#F9C31F',       // Yellow - Gradient endpoints
  },

  // Background Colors
  bg: {
    primary: '#14181F',      // Dark Primary - Main background, page base
    secondary: '#1D222A',    // Dark Secondary - Footer, elevated surfaces, cards
    overlay: 'rgba(43, 48, 59, 0.5)',  // Dark Overlay - Pills, semi-transparent overlays
    card: '#1D222A',         // Card background base
  },

  // Text Colors
  text: {
    primary: '#F8F6F2',      // Text Primary - Headings, primary body text
    secondary: '#818898',    // Text Secondary - Descriptions, secondary content
    muted: 'rgba(248, 246, 242, 0.8)', // Text Muted - Navigation, disabled states
    button: '#14181F',       // Text Button - Text on orange buttons
  },

  // Border Colors
  border: {
    default: 'rgba(48, 53, 65, 0.5)',  // Border Default - Card borders, dividers
    accent: 'rgba(240, 101, 66, 0.2)', // Accent border for badges
  },

  // Semantic Colors (for Chakra color schemes)
  survivor: {
    50: 'rgba(240, 101, 66, 0.05)',
    100: 'rgba(240, 101, 66, 0.1)',
    200: 'rgba(240, 101, 66, 0.15)',
    300: 'rgba(240, 101, 66, 0.3)',
    400: '#F06542',
    500: '#F06542',
    600: '#C34322',
    700: '#9A3019',
    800: '#6D2212',
    900: '#40140B',
  },

  // Secondary button colors
  dark: {
    50: '#3A4150',
    100: '#353B48',
    200: '#303541',
    300: '#2B303B',
    400: '#262B35',
    500: '#1D222A',
    600: '#14181F',
    700: '#0C0E12',
    800: '#070809',
    900: '#000000',
  },
};

// Gradient definitions (for use in CSS)
export const gradients = {
  card: 'linear-gradient(138deg, #212630 0%, #191D24 100%)',
  textOrangePurple: 'linear-gradient(-85deg, #F06542 1%, #6B7ECB 82%)',
  textOrangeYellow: 'linear-gradient(128deg, #F06542 0%, #F9C31F 100%)',
};
