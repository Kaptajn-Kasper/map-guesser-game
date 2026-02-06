import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const BrandPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f3ecf7',
      100: '#e6d8ef',
      200: '#d0b1e3',
      300: '#b98ad4',
      400: '#9a66bf',
      500: '#7b4da6',
      600: '#6a3f91',
      700: '#5b426c',
      800: '#4d3060',
      900: '#432b54',
      950: '#2e1a3a',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8f6fa',
          100: '#f3ecf7',
          200: '#e6d8ef',
          300: '#cfe7ed',
          400: '#abdee5',
          500: '#8bc6d4',
          600: '#52686d',
          700: '#4c6267',
          800: '#3a4a4e',
          900: '#2a3436',
          950: '#1a2224',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f8f6fa',
          100: '#f3ecf7',
          200: '#e6d8ef',
          300: '#cfe7ed',
          400: '#abdee5',
          500: '#8bc6d4',
          600: '#52686d',
          700: '#4c6267',
          800: '#3a4a4e',
          900: '#2a3436',
          950: '#1a2224',
        },
      },
    },
  },
});
