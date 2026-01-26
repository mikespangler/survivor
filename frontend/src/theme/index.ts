/**
 * Survivor Fantasy League Design System
 * 
 * Main theme configuration combining all tokens and component styles.
 * Based on Figma Style Guide.
 */

import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Token imports
import { colors, gradients } from './tokens/colors';
import { fonts, fontSizes, lineHeights, fontWeights, letterSpacings, textStyles } from './tokens/typography';
import { space, radii, sizes, zIndices } from './tokens/spacing';
import { shadows } from './tokens/shadows';

// Component imports
import { Button } from './components/button';
import { Card } from './components/card';
import { Badge, Tag } from './components/badge';
import { Heading } from './components/heading';
import { Text } from './components/text';

// Theme configuration
const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

// Global styles
const styles = {
  global: {
    'html, body': {
      bg: 'bg.primary',
      color: 'text.primary',
      fontFamily: 'body',
      lineHeight: 'normal',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    '*::placeholder': {
      color: 'text.secondary',
    },
    '*, *::before, *::after': {
      borderColor: 'border.default',
    },
    // Scrollbar styling
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: 'bg.primary',
    },
    '::-webkit-scrollbar-thumb': {
      bg: 'border.default',
      borderRadius: 'full',
    },
    '::-webkit-scrollbar-thumb:hover': {
      bg: 'text.secondary',
    },
  },
};

// Semantic tokens for light/dark mode support (currently dark-first)
const semanticTokens = {
  colors: {
    'bg.primary': { default: '#14181F' },
    'bg.secondary': { default: '#1D222A' },
    'bg.overlay': { default: 'rgba(43, 48, 59, 0.5)' },
    'text.primary': { default: '#F8F6F2' },
    'text.secondary': { default: '#818898' },
    'text.muted': { default: 'rgba(248, 246, 242, 0.8)' },
    'text.button': { default: '#14181F' },
    'border.default': { default: 'rgba(48, 53, 65, 0.5)' },
    'border.accent': { default: 'rgba(240, 101, 66, 0.2)' },
  },
};

// Combine everything into the theme
export const theme = extendTheme({
  config,
  styles,
  semanticTokens,
  
  // Tokens
  colors,
  fonts,
  fontSizes,
  lineHeights,
  fontWeights,
  letterSpacings,
  textStyles,
  space,
  radii,
  sizes,
  zIndices,
  shadows,

  // Component styles
  components: {
    Button,
    Card,
    Badge,
    Tag,
    Heading,
    Text,
    // Additional component overrides
    Container: {
      baseStyle: {
        maxW: 'container.2xl',
        px: { base: 4, md: 8, lg: '100px' },
      },
    },
    Link: {
      baseStyle: {
        color: 'text.muted',
        _hover: {
          color: 'text.primary',
          textDecoration: 'none',
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          color: 'text.primary',
          _placeholder: { color: 'text.secondary' },
        },
      },
      variants: {
        outline: {
          field: {
            bg: 'transparent',
            borderColor: 'border.default',
            color: 'text.primary',
            _hover: { borderColor: 'text.secondary' },
            _focus: { borderColor: 'brand.primary', boxShadow: 'none' },
          },
        },
        filled: {
          field: {
            bg: 'bg.secondary',
            borderColor: 'border.default',
            _hover: {
              bg: 'bg.overlay',
            },
            _focus: {
              bg: 'bg.secondary',
              borderColor: 'brand.primary',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Select: {
      baseStyle: {
        field: {
          color: 'text.primary',
        },
        icon: {
          color: 'text.secondary',
        },
      },
      variants: {
        outline: {
          field: {
            bg: 'transparent',
            borderColor: 'border.default',
            color: 'text.primary',
            _hover: { borderColor: 'text.secondary' },
            _focus: { borderColor: 'brand.primary', boxShadow: 'none' },
          },
        },
      },
    },
    Textarea: {
      baseStyle: {
        color: 'text.primary',
        _placeholder: { color: 'text.secondary' },
      },
      variants: {
        outline: {
          bg: 'transparent',
          borderColor: 'border.default',
          _hover: { borderColor: 'text.secondary' },
          _focus: { borderColor: 'brand.primary', boxShadow: 'none' },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        color: 'text.primary',
        fontWeight: 'medium',
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            color: 'text.secondary',
            borderColor: 'border.default',
          },
          td: {
            color: 'text.primary',
            borderColor: 'border.default',
          },
        },
      },
    },
    Spinner: {
      baseStyle: {
        color: 'brand.primary',
      },
    },
    Alert: {
      baseStyle: {
        container: {
          bg: 'bg.secondary',
          borderWidth: '1px',
          borderColor: 'border.default',
        },
        title: {
          color: 'text.primary',
        },
        description: {
          color: 'text.secondary',
        },
        icon: {
          color: 'text.primary',
        },
      },
      variants: {
        subtle: (props: { status: string }) => {
          const { status } = props;
          const colorMap: Record<string, string> = {
            info: 'blue.500',
            warning: 'orange.500',
            success: 'green.500',
            error: 'red.500',
          };
          return {
            container: {
              bg: 'bg.secondary',
              borderColor: colorMap[status] || 'border.default',
            },
          };
        },
      },
      defaultProps: {
        variant: 'subtle',
      },
    },
  },
});

// Export gradients for manual use
export { gradients };

// Export type for TypeScript support
export type Theme = typeof theme;

export default theme;
