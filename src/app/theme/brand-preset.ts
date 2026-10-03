import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { color } from '@kaptajn-kasper/brand';

const { brand } = color;

// PrimeNG's "primary" is the app's accent colour, which is the brand purple
// (the brand's tertiary colour). Shades taken from @kaptajn-kasper/brand are
// referenced by name; the others are app-specific steps between them.
const accent = {
  50: '#f3ecf7',
  100: '#e6d8ef',
  200: brand.purple[200],
  300: '#b98ad4',
  400: '#9a66bf',
  500: '#7b4da6',
  600: '#6a3f91',
  700: brand.purple[700],
  800: '#4d3060',
  900: brand.purple[900],
  950: '#2e1a3a',
};

// Neutral surfaces: brand slate/teal tints, plus app-specific extremes.
const surface = {
  0: brand.white,
  50: '#f8f6fa',
  100: '#f3ecf7',
  200: '#e6d8ef',
  300: brand.slate[100],
  400: brand.teal[200],
  500: color.light.onPrimaryContainer,
  600: brand.slate[700],
  700: brand.slate[800],
  800: '#3a4a4e',
  900: '#2a3436',
  950: '#1a2224',
};

export const BrandPreset = definePreset(Aura, {
  semantic: {
    primary: accent,
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: brand.white,
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        surface,
      },
      dark: {
        primary: {
          color: '{primary.400}',
          contrastColor: brand.white,
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
        },
        surface,
      },
    },
  },
});
