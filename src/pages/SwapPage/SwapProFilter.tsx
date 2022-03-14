import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Checkbox } from '@material-ui/core';
import { Replay } from '@material-ui/icons';
import { CustomSwitch } from 'components';

const useStyles = makeStyles(() => ({
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

interface SwapProFilterProps {
  infoPos: string;
  setInfoPos: (pos: string) => void;
  showChart: boolean;
  setShowChart: (value: boolean) => void;
  showTrades: boolean;
  setShowTrades: (value: boolean) => void;
}

const SwapProFilter: React.FC<SwapProFilterProps> = ({
  infoPos,
  setInfoPos,
  showChart,
  setShowChart,
  showTrades,
  setShowTrades,
}) => {
  const classes = useStyles();

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

  return (
    <Box display='flex' alignItems='center' flexWrap='wrap' padding='8px'>
      <Box className={classes.checkWrapper}>
        <Checkbox
          checked={showChart}
          disabled={!showTrades}
          onChange={(evt) => setShowChart(evt.target.checked)}
        />
        <Typography variant='body2'>chart</Typography>
      </Box>
      <Box className={classes.checkWrapper}>
        <Checkbox
          checked={showTrades}
          disabled={!showChart}
          onChange={(evt) => setShowTrades(evt.target.checked)}
        />
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
  );
};

export default SwapProFilter;
