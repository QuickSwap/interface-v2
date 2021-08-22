import {
  createTheme,
  responsiveFontSizes,
  ThemeOptions,
} from '@material-ui/core';
import { merge } from 'lodash';

// colors
const primary = '#1DAED6';
const secondaryDark = 'rgb(40, 145, 249)';
const primaryDark = '#1C2938';
const secondary = '#344252';

const black = '#000000';
const white = '#ffffff';

const textPrimary = 'rgba(255, 255, 255, 0.87)';
const bgColor = '#021221';
const bgColor1 ='rgb(247, 248, 250)'

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
        dark: primaryDark,
      },
      secondary: {
        main: secondary,
        dark: secondaryDark,
      },
      common: {
        black,
        white,
      },
      text: {
        primary: textPrimary,
        secondary: white,
        hint: bgColor1,
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
      fontFamily: 'Ubuntu',
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
          },
          '&$disabled': {
            opacity: 0.3
          }
        },
        secondary: {
          background: secondary
        },
        textPrimary: {
          background: `transparent linear-gradient(279deg, ${successMain} 0%, ${successDark} 100%) 0% 0% no-repeat padding-box`,
          borderRadius: 50,
          color: white
        }
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
