/**
 * Text Component Styles - Survivor Fantasy League Design System
 */

import { defineStyleConfig } from '@chakra-ui/react';

export const Text = defineStyleConfig({
  baseStyle: {
    fontFamily: 'body',
    color: 'text.primary',
  },
  variants: {
    // Body styles
    bodyXl: {
      fontSize: 'xl',
      lineHeight: 'bodyXl',
      fontWeight: 'medium',
    },
    bodyL: {
      fontSize: 'lg',
      lineHeight: 'bodyL',
      fontWeight: 'medium',
    },
    bodyM: {
      fontSize: 'md',
      lineHeight: 'bodyM',
      fontWeight: 'medium',
    },
    bodyS: {
      fontSize: 'sm',
      lineHeight: 'bodyS',
      fontWeight: 'medium',
    },
    // Secondary/muted text
    secondary: {
      fontSize: 'md',
      lineHeight: 'bodyM',
      fontWeight: 'medium',
      color: 'text.secondary',
    },
    // Caption/label style
    caption: {
      fontSize: 'xs',
      lineHeight: 'normal',
      fontWeight: 'medium',
      color: 'text.secondary',
    },
    // Gradient text (Orange to Purple)
    gradient: {
      bgGradient: 'linear(-85deg, #F06542 1%, #6B7ECB 82%)',
      bgClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    // Gradient text (Orange to Yellow)
    gradientWarm: {
      bgGradient: 'linear(128deg, #F06542 0%, #F9C31F 100%)',
      bgClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  },
  defaultProps: {
    variant: 'bodyM',
  },
});
