import React from 'react';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { GlobalConst } from 'constants/index';
import { DoubleCurrencyLogo } from 'components';
import { formatCompact, getDaysCurrentYear } from 'utils';
import cx from 'classnames';
import { useCurrency } from 'hooks/Tokens';

const useStyles = makeStyles(({ palette }) => ({
  liquidityMain: {
    '& p': {
      color: palette.text.secondary,
      fontWeight: 600,
    },
  },
  liquidityFilter: {
    '& p': {
      cursor: 'pointer',
      marginRight: 20,
      '&.active': {
        color: palette.primary.main,
      },
    },
  },
  liquidityContent: {
    border: `1px solid ${palette.secondary.dark}`,
    borderRadius: '10px',
    marginBottom: '20px',
    '& p': {
      color: palette.text.primary,
    },
  },
}));

const LiquidityPoolRow: React.FC<{
  pair: any;
  key: number;
}> = ({ pair, key }) => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const daysCurrentYear = getDaysCurrentYear();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const dayVolumeUSD =
    Number(
      pair.oneDayVolumeUSD ? pair.oneDayVolumeUSD : pair.oneDayVolumeUntracked,
    ) *
    GlobalConst.utils.FEEPERCENT *
    daysCurrentYear *
    100;
  const trackReserveUSD = Number(
    pair.oneDayVolumeUSD ? pair.trackedReserveUSD : pair.reserveUSD,
  );
  const apy =
    isNaN(dayVolumeUSD) || trackReserveUSD === 0
      ? 0
      : dayVolumeUSD / trackReserveUSD;
  const liquidity = pair.trackedReserveUSD
    ? pair.trackedReserveUSD
    : pair.reserveUSD;
  const volume = pair.oneDayVolumeUSD
    ? pair.oneDayVolumeUSD
    : pair.oneDayVolumeUntracked;
  const token0 = useCurrency(pair.token0.id);
  const token1 = useCurrency(pair.token1.id);
  return (
    <Box
      key={key}
      display='flex'
      flexWrap='wrap'
      className={cx(classes.liquidityContent, classes.liquidityMain)}
      padding={2}
    >
      <Box display='flex' alignItems='center' width={isMobile ? 1 : 0.5}>
        <DoubleCurrencyLogo
          currency0={token0 ?? undefined}
          currency1={token1 ?? undefined}
          size={28}
        />
        <Typography variant='body2' style={{ marginLeft: 12 }}>
          {pair.token0.symbol.toUpperCase()} /{' '}
          {pair.token1.symbol.toUpperCase()}
        </Typography>
      </Box>
      <Box
        width={isMobile ? 1 : 0.2}
        mt={isMobile ? 2.5 : 0}
        display='flex'
        justifyContent='space-between'
      >
        {isMobile && (
          <Typography variant='body2' style={{ color: palette.text.secondary }}>
            TVL
          </Typography>
        )}
        <Typography variant='body2'>${formatCompact(liquidity)}</Typography>
      </Box>
      <Box
        width={isMobile ? 1 : 0.15}
        mt={isMobile ? 1 : 0}
        display='flex'
        justifyContent='space-between'
      >
        {isMobile && (
          <Typography variant='body2' style={{ color: palette.text.secondary }}>
            24H Volume
          </Typography>
        )}
        <Typography variant='body2'>${formatCompact(volume)}</Typography>
      </Box>
      <Box
        width={isMobile ? 1 : 0.15}
        mt={isMobile ? 1 : 0}
        display='flex'
        justifyContent={isMobile ? 'space-between' : 'flex-end'}
      >
        {isMobile && (
          <Typography variant='body2' style={{ color: palette.text.secondary }}>
            APY
          </Typography>
        )}
        <Typography
          variant='body2'
          align='right'
          style={{
            color: apy < 0 ? palette.error.main : palette.success.main,
          }}
        >
          {apy.toFixed(2)}%
        </Typography>
      </Box>
    </Box>
  );
};

export default LiquidityPoolRow;
