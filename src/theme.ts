import {
  createTheme,
  responsiveFontSizes,
  ThemeOptions,
} from '@material-ui/core';
import { merge } from 'lodash';

// colors
const primary = '#1DAED6';
const secondary = '#344252';

const black = '#000000';
const white = '#ffffff';

const textPrimary = 'rgba(255, 255, 255, 0.87)';
const bgColor = '#021221';

const successMain = '#2464F4';
const successDark = '#1DB2D5';

const divider = '#EEE';

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
  ...args: object[]
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
        dark: primary,
      },
      secondary: {
        main: secondary,
        dark: secondary,
      },
      common: {
        black,
        white,
      },
      text: {
        primary: textPrimary,
        secondary: white,
        hint: white,
      },
      background: {
        default: bgColor,
        paper: white,
      },
      success: {
        main: successMain,
        dark: successDark,
      },
      divider: divider,
    },
    typography: {
      htmlFontSize: 16,
      fontFamily: 'DM Sans',
      fontSize: 14,
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
            opacity: 0.8
          }
        },
      },
      MuiContainer: {
        root: {
          paddingLeft: '40px !important',
          paddingRight: '40px !important',  
        }
      }
    },
  }),
);

const theme = { mainTheme };

export default theme;
