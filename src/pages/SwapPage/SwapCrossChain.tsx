import { SquidWidget } from '@0xsquid/widget';
import { Box, Grid } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import React from 'react';

const SwapCrossChain: React.FC = () => {
  const { chainId } = useActiveWeb3React();

  const darkTheme = {
    borderRadius: {
      'button-lg-primary': '1.25rem',
      'button-lg-secondary': '1.25rem',
      'button-lg-tertiary': '1.25rem',
      'button-md-primary': '0.9375rem',
      'button-md-secondary': '0.9375rem',
      'button-md-tertiary': '0.9375rem',
      container: '1.25rem',
      input: '0.9375rem',
      'menu-sm': '0.65rem',
      'menu-lg': '0.65rem',
      modal: '1.25rem',
    },
    fontSize: {
      caption: '0.875rem',
      'body-small': '1.14375rem',
      'body-medium': '1.40625rem',
      'body-large': '1.75625rem',
      'heading-small': '2.1875rem',
      'heading-medium': '3.08125rem',
      'heading-large': '4.40625rem',
    },
    fontWeight: {
      caption: '400',
      'body-small': '400',
      'body-medium': '400',
      'body-large': '400',
      'heading-small': '400',
      'heading-medium': '400',
      'heading-large': '400',
    },
    fontFamily: {
      'squid-main': 'Geist, sans-serif',
    },
    boxShadow: {
      container:
        '0px 2px 4px 0px rgba(0, 0, 0, 0.20), 0px 5px 50px -1px rgba(0, 0, 0, 0.33)',
    },
    color: {
      'grey-100': '#FBFBFD',
      'grey-200': '#EDEFF3',
      'grey-300': '#D1D6E0',
      'grey-400': '#A7ABBE',
      'grey-500': '#8A8FA8',
      'grey-600': '#676B7E',
      'grey-700': '#4C515D',
      'grey-800': '#292C32',
      'grey-900': '#17191C',
      'royal-300': '#D9BEF4',
      'royal-400': '#B893EC',
      'royal-500': '#9E79D2',
      'royal-700': '#6B45A1',
      'status-positive': '#7AE870',
      'status-negative': '#FF4D5B',
      'status-partial': '#F3AF25',
      'highlight-700': '#E4FE53',
      'animation-bg': '#9E79D2',
      'animation-text': '#FBFBFD',
      'button-lg-primary-bg': '#9E79D2',
      'button-lg-primary-text': '#FBFBFD',
      'button-lg-secondary-bg': '#FBFBFD',
      'button-lg-secondary-text': '#292C32',
      'button-lg-tertiary-bg': '#292C32',
      'button-lg-tertiary-text': '#D1D6E0',
      'button-md-primary-bg': '#9E79D2',
      'button-md-primary-text': '#FBFBFD',
      'button-md-secondary-bg': '#FBFBFD',
      'button-md-secondary-text': '#292C32',
      'button-md-tertiary-bg': '#292C32',
      'button-md-tertiary-text': '#D1D6E0',
      'input-bg': '#17191C',
      'input-placeholder': '#676B7E',
      'input-text': '#D1D6E0',
      'input-selection': '#D1D6E0',
      'menu-bg': '#17191CA8',
      'menu-text': '#FBFBFDA8',
      'menu-backdrop': '#FBFBFD1A',
      'modal-backdrop': '#17191C54',
    },
  };

  return (
    <Grid style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box
        style={{
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <SquidWidget
          config={{
            integratorId: 'quickswap-swap-widget',
            apiUrl: 'https://apiplus.squidrouter.com',
            initialAssets: {
              from: {
                chainId: chainId.toString(),
                address: '0x0000000000000000000000000000000000000000',
              },
            },
            theme: darkTheme,
            themeType: 'dark',
            loadPreviousStateFromLocalStorage: true,
            preferDex: ['QUICKSWAP V3', 'Quickswap V2'],
          }}
        />
      </Box>
    </Grid>
  );
};

export default SwapCrossChain;
