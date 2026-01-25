/**
 * Button Component Styles - Survivor Fantasy League Design System
 * 
 * Primary: Orange with hard shadow (Survivant font)
 * Secondary: Dark with hard shadow (Survivant font)
 */

import { defineStyleConfig } from '@chakra-ui/react';

export const Button = defineStyleConfig({
  baseStyle: {
    fontFamily: 'heading',
    fontWeight: 'normal',
    borderRadius: 'xl',
    transition: 'all 0.2s ease',
    _active: {
      transform: 'translateY(2px)',
    },
  },
  sizes: {
    lg: {
      h: '64px',
      fontSize: 'lg',
      px: 8,
      borderRadius: 'xl',
    },
    md: {
      h: '48px',
      fontSize: 'md',
      px: 6,
      borderRadius: 'xl',
    },
    sm: {
      h: '36px',
      fontSize: 'sm',
      px: 4,
      borderRadius: 'md',
    },
  },
  variants: {
    // Primary orange button with hard shadow
    primary: {
      bg: 'brand.primary',
      color: 'text.button',
      boxShadow: 'button-lg',
      _hover: {
        bg: '#E85A3A',
        _disabled: {
          bg: 'brand.primary',
        },
      },
      _active: {
        boxShadow: 'none',
        transform: 'translateY(4px)',
      },
      _disabled: {
        bg: 'brand.primary',
        opacity: 0.5,
        cursor: 'not-allowed',
        boxShadow: 'none',
      },
    },
    // Primary small variant
    primarySm: {
      bg: 'brand.primary',
      color: 'text.button',
      boxShadow: 'button-sm',
      _hover: {
        bg: '#E85A3A',
        _disabled: {
          bg: 'brand.primary',
        },
      },
      _active: {
        boxShadow: 'none',
        transform: 'translateY(2px)',
      },
      _disabled: {
        bg: 'brand.primary',
        opacity: 0.5,
        cursor: 'not-allowed',
        boxShadow: 'none',
      },
    },
    // Secondary dark button with hard shadow
    secondary: {
      bg: '#2B2B31',
      color: 'text.primary',
      border: '1px solid black',
      boxShadow: 'button-secondary-lg',
      _hover: {
        bg: '#353540',
        _disabled: {
          bg: '#2B2B31',
        },
      },
      _active: {
        boxShadow: 'none',
        transform: 'translateY(4px)',
      },
      _disabled: {
        bg: '#2B2B31',
        opacity: 0.5,
        cursor: 'not-allowed',
        boxShadow: 'none',
      },
    },
    // Secondary small variant
    secondarySm: {
      bg: '#2B2B31',
      color: 'text.primary',
      border: '1px solid black',
      boxShadow: 'button-secondary-sm',
      _hover: {
        bg: '#353540',
        _disabled: {
          bg: '#2B2B31',
        },
      },
      _active: {
        boxShadow: 'none',
        transform: 'translateY(2px)',
      },
      _disabled: {
        bg: '#2B2B31',
        opacity: 0.5,
        cursor: 'not-allowed',
        boxShadow: 'none',
      },
    },
    // Outline variant - solid dark button without shadow (for tertiary actions)
    outline: {
      bg: 'bg.secondary',
      color: 'text.primary',
      border: '1px solid',
      borderColor: 'border.default',
      _hover: {
        bg: '#353540',
      },
      _disabled: {
        bg: 'bg.secondary',
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    // Solid variant - override Chakra's default colorScheme="orange" behavior
    solid: {
      bg: 'brand.primary',
      color: 'text.button',
      boxShadow: 'button-lg',
      _hover: {
        bg: '#E85A3A',
        _disabled: {
          bg: 'brand.primary',
        },
      },
      _active: {
        boxShadow: 'none',
        transform: 'translateY(4px)',
      },
      _disabled: {
        bg: 'brand.primary',
        opacity: 0.5,
        cursor: 'not-allowed',
        boxShadow: 'none',
      },
    },
    // Ghost variant - alias for outline
    ghost: {
      bg: 'bg.secondary',
      color: 'text.primary',
      border: '1px solid',
      borderColor: 'border.default',
      _hover: {
        bg: '#353540',
      },
      _disabled: {
        bg: 'bg.secondary',
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    // Link style button
    link: {
      bg: 'transparent',
      color: 'brand.primary',
      textDecoration: 'none',
      _hover: {
        textDecoration: 'underline',
      },
    },
  },
  defaultProps: {
    size: 'md',
    variant: 'primary',
  },
});
