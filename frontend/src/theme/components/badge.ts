/**
 * Badge & Tag Component Styles - Survivor Fantasy League Design System
 * 
 * Accent Badge: Orange-tinted for important announcements
 * Neutral Pill: Subdued for tags and labels
 */

import { defineStyleConfig } from '@chakra-ui/react';

export const Badge = defineStyleConfig({
  baseStyle: {
    fontFamily: 'body',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 'wide',
    borderRadius: 'full',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizes: {
    sm: {
      fontSize: 'xs',
      px: 3,
      py: 1,
    },
    md: {
      fontSize: 'sm',
      px: 4,
      py: 1.5,
    },
    lg: {
      fontSize: 'sm',
      px: 6,
      py: 2,
    },
  },
  variants: {
    // Accent badge (orange tinted) for important announcements
    accent: {
      bg: 'rgba(240, 101, 66, 0.15)',
      color: 'brand.primary',
      border: '1px solid',
      borderColor: 'rgba(240, 101, 66, 0.2)',
    },
    // Subtle accent (lighter background)
    accentSubtle: {
      bg: 'rgba(240, 101, 66, 0.05)',
      color: 'brand.primary',
      border: '1px solid',
      borderColor: 'rgba(240, 101, 66, 0.2)',
    },
    // Neutral pill for tags and feature labels
    neutral: {
      bg: 'bg.overlay',
      color: 'text.muted',
      border: '1px solid',
      borderColor: 'border.default',
      fontWeight: 'semibold',
      textTransform: 'none',
    },
    // Solid brand badge
    solid: {
      bg: 'brand.primary',
      color: 'text.button',
    },
    // Number badge (for step indicators)
    number: {
      bg: 'brand.primary',
      color: 'text.button',
      borderRadius: 'lg',
      boxShadow: 'button-sm',
      fontFamily: 'display',
      fontWeight: 'bold',
      minW: '56px',
      h: '56px',
      fontSize: 'lg',
    },
  },
  defaultProps: {
    size: 'md',
    variant: 'accent',
  },
});

// Tag uses the same styles as Badge
export const Tag = defineStyleConfig({
  baseStyle: {
    container: {
      fontFamily: 'body',
      fontWeight: 'semibold',
      borderRadius: 'full',
    },
  },
  variants: {
    accent: {
      container: {
        bg: 'rgba(240, 101, 66, 0.15)',
        color: 'brand.primary',
        border: '1px solid',
        borderColor: 'rgba(240, 101, 66, 0.2)',
      },
    },
    neutral: {
      container: {
        bg: 'bg.overlay',
        color: 'text.muted',
        border: '1px solid',
        borderColor: 'border.default',
      },
    },
  },
  defaultProps: {
    variant: 'neutral',
  },
});
