import { SquidWidget } from '@0xsquid/widget';
import { ConfigTheme } from '@0xsquid/widget/widget/core/types/config';
import { Box, Grid } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useIsDarkMode } from 'state/user/hooks';

const SwapCrossChain: React.FC = () => {
  const darkMode = useIsDarkMode();
  const darkModeStyle: ConfigTheme = {
    baseContent: '#f3ecec',
    neutralContent: '#696c80',
    base100: '#0f0e0e',
    base200: '#232531',
    base300: '#0f1720',
    error: '#ED6A5E',
    warning: '#FFB155',
    success: '#62C555',
    primary: '#558AC5',
    secondary: '#457cbb',
    secondaryContent: '#2e2d30',
    neutral: '#121319',
    roundedBtn: '26px',
    roundedBox: '1rem',
    roundedDropDown: '20rem',
    displayDivider: true,
  };
  const lightModeStyle: ConfigTheme = {
    baseContent: '#070002',
    neutralContent: '#070002',
    base100: '#FFFFFF',
    base200: '#e7e7e7',
    base300: '#FBF5FF',
    error: '#ED6A5E',
    warning: '#FFB155',
    success: '#62C555',
    primary: '#558AC5',
    secondary: '#457cbb',
    secondaryContent: '#F7F6FB',
    neutral: '#FFFFFF',
    roundedBtn: '26px',
    roundedBox: '1rem',
    roundedDropDown: '20rem',
    displayDivider: true,
  };
  useEffect(() => {
    // console.log('SwapCrossChain #init');
  }, []);

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
            companyName: 'Quickswap',
            apiUrl: 'https://api.0xsquid.com',
            style: darkMode ? darkModeStyle : lightModeStyle,
          }}
        />
      </Box>
    </Grid>
  );
};

export default SwapCrossChain;
