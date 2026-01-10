/**
 * Heading Component Styles - Survivor Fantasy League Design System
 */

import { defineStyleConfig } from '@chakra-ui/react';

export const Heading = defineStyleConfig({
  baseStyle: {
    fontFamily: 'heading',
    fontWeight: 'normal',
    color: 'text.primary',
  },
  sizes: {
    // Hero - 72px
    '4xl': {
      fontSize: '6xl',
      lineHeight: 'hero',
      letterSpacing: 'tighter',
    },
    // H1 - 48px
    '3xl': {
      fontSize: '5xl',
      lineHeight: 'h1',
      letterSpacing: 'tight',
    },
    // H2 - 40px (uses Fredoka)
    '2xl': {
      fontFamily: 'display',
      fontWeight: 'bold',
      fontSize: '4xl',
      lineHeight: 'h2',
      letterSpacing: 'tight',
    },
    // H3 - 20px
    xl: {
      fontSize: 'xl',
      lineHeight: 'h3',
      letterSpacing: '-0.5px',
    },
    // H4 - 18px (uses Fredoka)
    lg: {
      fontFamily: 'display',
      fontWeight: 'bold',
      fontSize: 'lg',
      lineHeight: 'h4',
      letterSpacing: '-0.45px',
    },
    md: {
      fontFamily: 'display',
      fontWeight: 'bold',
      fontSize: 'md',
      lineHeight: 'normal',
    },
    sm: {
      fontFamily: 'display',
      fontWeight: 'bold',
      fontSize: 'sm',
      lineHeight: 'normal',
    },
  },
  defaultProps: {
    size: 'xl',
  },
});
