/**
 * Card Component Styles - Survivor Fantasy League Design System
 * 
 * Feature cards with gradient background and border
 */

import { cardAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(cardAnatomy.keys);

const baseStyle = definePartsStyle({
  container: {
    bg: 'bg.secondary',
    borderRadius: '2xl',
    border: '2px solid',
    borderColor: 'border.default',
    boxShadow: 'card',
    overflow: 'hidden',
  },
  header: {
    p: 6,
    borderBottom: '2px solid',
    borderColor: 'border.default',
  },
  body: {
    p: 6,
  },
  footer: {
    p: 6,
    borderTop: '2px solid',
    borderColor: 'border.default',
  },
});

const variants = {
  // Feature card with gradient background
  feature: definePartsStyle({
    container: {
      bgGradient: 'linear(138deg, #212630 0%, #191D24 100%)',
      borderRadius: '2xl',
      border: '2px solid',
      borderColor: 'border.default',
      boxShadow: 'card',
    },
  }),
  // Elevated card (same as feature but more prominent)
  elevated: definePartsStyle({
    container: {
      bgGradient: 'linear(138deg, #212630 0%, #191D24 100%)',
      borderRadius: '2xl',
      border: '2px solid',
      borderColor: 'border.default',
      boxShadow: 'card',
    },
  }),
  // Simple card with solid background
  solid: definePartsStyle({
    container: {
      bg: 'bg.secondary',
      borderRadius: '2xl',
      border: '2px solid',
      borderColor: 'border.default',
    },
  }),
  // Outline only
  outline: definePartsStyle({
    container: {
      bg: 'transparent',
      borderRadius: '2xl',
      border: '2px solid',
      borderColor: 'border.default',
    },
  }),
};

export const Card = defineMultiStyleConfig({
  baseStyle,
  variants,
  defaultProps: {
    variant: 'solid',
  },
});
