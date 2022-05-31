import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Checkbox } from '@material-ui/core';
import { Replay } from '@material-ui/icons';
import { CustomSwitch } from 'components';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(({ palette }) => ({
  swapFilter: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: 8,
    '& p': {
      textTransform: 'uppercase',
    },
  },
  checkWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginRight: 16,
    '& .MuiCheckbox-root': {
      padding: 2,
      '& svg path': {
        fill: palette.text.primary,
      },
    },
  },
  replayButton: {
    cursor: 'pointer',
    display: 'flex',
    marginLeft: 8,
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
  const { t } = useTranslation();
  const swapPositions = [t('left'), t('right'), t('none')];

  const infoPosItems = swapPositions.map((pos) => {
    return {
      text: pos,
      onClick: () => setInfoPos(pos),
      condition: infoPos === pos,
    };
  });

  return (
    <Box className={classes.swapFilter}>
      <Box className={classes.checkWrapper}>
        <Checkbox
          checked={showChart}
          disabled={!showTrades}
          onChange={(evt) => setShowChart(evt.target.checked)}
        />
        <Typography variant='body2'>{t('chart')}</Typography>
      </Box>
      <Box className={classes.checkWrapper}>
        <Checkbox
          checked={showTrades}
          disabled={!showChart}
          onChange={(evt) => setShowTrades(evt.target.checked)}
        />
        <Typography variant='body2'>{t('trades')}</Typography>
      </Box>
      <Box display='flex' alignItems='center'>
        <Typography variant='body2'>{t('info')}:</Typography>
        <Box ml={1}>
          <CustomSwitch width={190} height={30} items={infoPosItems} />
        </Box>
      </Box>
      <Box
        className={classes.replayButton}
        onClick={() => {
          setInfoPos(t('right'));
          setShowChart(true);
          setShowTrades(true);
        }}
      >
        <Replay />
      </Box>
    </Box>
  );
};

export default SwapProFilter;
