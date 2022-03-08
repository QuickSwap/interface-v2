import React, { useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Box, Typography, Checkbox } from '@material-ui/core';
import { Replay } from '@material-ui/icons';
import { CustomSwitch } from 'components';
import { AdvancedChart } from 'react-tradingview-embed';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  checkWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginRight: 16,
    '& .MuiCheckbox-root': {
      padding: 2,
    },
    '& p': {
      textTransform: 'uppercase',
    },
  },
}));

const SwapProChartTrade: React.FC = () => {
  const classes = useStyles();

  const [infoPos, setInfoPos] = useState('left');

  const infoPosItems = [
    {
      text: 'LEFT',
      onClick: () => setInfoPos('left'),
      condition: infoPos === 'left',
    },
    {
      text: 'RIGHT',
      onClick: () => setInfoPos('right'),
      condition: infoPos === 'right',
    },
    {
      text: 'NONE',
      onClick: () => setInfoPos('none'),
      condition: infoPos === 'none',
    },
  ];

  console.log('ccc');

  return (
    <>
      <Box display='flex' alignItems='center' flexWrap='wrap' padding='8px'>
        <Box className={classes.checkWrapper}>
          <Checkbox />
          <Typography variant='body2'>chart</Typography>
        </Box>
        <Box className={classes.checkWrapper}>
          <Checkbox />
          <Typography variant='body2'>trades</Typography>
        </Box>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>INFO:</Typography>
          <Box ml={1}>
            <CustomSwitch width={190} height={30} items={infoPosItems} />
          </Box>
        </Box>
        <Box display='flex' ml={1}>
          <Replay />
        </Box>
      </Box>
      <Box>
        <AdvancedChart
          widgetProps={{ theme: 'dark', symbol: 'QUICKSWAP:QUICKOM' }}
        />
      </Box>
    </>
  );
};

export default React.memo(SwapProChartTrade);
