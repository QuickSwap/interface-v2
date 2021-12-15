import {
  createTheme,
  responsiveFontSizes,
  ThemeOptions,
} from '@material-ui/core';
import { merge } from 'lodash';

// colors
const primary = '#448aff';
const primaryDark = '#1C2938';
const secondary = '#344252';
const secondaryLight = '#252833';
const secondaryDark = '#282d3d';
const secondaryContrast = '#121319';

const black = '#000000';
const white = '#ffffff';

const textPrimary = '#c7cad9';
const textSecondary = '#696c80';
const textDisabled = '#626680';
const textHint = '#636780';
const bgColor = '#12131a';
const bgPalette = '#1b1e29';

const successMain = '#0fc679';
const successDark = '#1DB2D5';

const errorMain = '#ff5252';
const errorDark = '#f00';

const divider = 'rgba(130, 177, 255, 0.08)';

// breakpoints
const xl = 1920;
const lg = 1280;
const md = 960;
const sm = 700;
const xs = 0;

// spacing
const spacing = 8;

function createQuickTheme(
  custom: any,
  options?: ThemeOptions | undefined,
  ...args: any[]
) {
  return createTheme(merge(custom, options), ...args);
}

export const mainTheme = responsiveFontSizes(
  createQuickTheme({
    palette: {
      action: {
        disabledBackground: '',
        disabled: 'set color of text here',
      },
      primary: {
        main: primary,
        dark: primaryDark,
      },
      secondary: {
        main: secondary,
        light: secondaryLight,
        dark: secondaryDark,
        contrastText: secondaryContrast,
      },
      common: {
        black,
        white,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        disabled: textDisabled,
        hint: textHint,
      },
      background: {
        default: bgColor,
        paper: bgPalette,
      },
      success: {
        main: successMain,
        dark: successDark,
      },
      error: {
        main: errorMain,
        dark: errorDark,
      },
      divider: divider,
    },
    typography: {
      htmlFontSize: 16,
      fontFamily: "'Inter', sans-serif",
      fontSize: 14,
      h1: {
        fontSize: 60,
        fontWeight: 'bold',
        lineHeight: 0.93,
      },
      h2: {
        fontSize: 40,
        fontWeight: 'bold',
        lineHeight: 1.2,
      },
      h3: {
        fontSize: 30,
        fontWeight: 'bold',
        lineHeight: 1.33,
      },
      h4: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 1.5,
      },
      h5: {
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 1.5,
      },
      h6: {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: 20,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: 18,
        lineHeight: 1.56,
      },
      body1: {
        fontSize: 16,
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body2: {
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.57,
      },
      caption: {
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.33,
      },
      overLine: {
        fontSize: 13,
        fontWeight: 'bold',
        lineHeight: 1.69,
      },
    },
    spacing,
    breakpoints: {
      values: {
        xl,
        lg,
        md,
        sm,
        xs,
      },
    },
    overrides: {
      MuiButton: {
        root: {
          fontSize: 14,
          fontWeight: 'bold',
          lineHeight: '20px',
          textTransform: 'none',
          backgroundColor: primary,
          color: white,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: primary,
            opacity: 0.8,
          },
          '&$disabled': {
            opacity: 0.3,
          },
        },
        secondary: {
          background: secondary,
        },
        textPrimary: {
          background: `linear-gradient(to bottom, ${primary}, #004ce6)`,
          borderRadius: 50,
          color: white,
        },
      },
      MuiContainer: {
        root: {
          paddingLeft: '40px !important',
          paddingRight: '40px !important',
        },
      },
    },
  }),
);

const theme = { mainTheme };

export default theme;
