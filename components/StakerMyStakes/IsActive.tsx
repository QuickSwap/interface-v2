import React from 'react';
import { useToken } from 'hooks/TokensV3';
import { unwrappedToken } from 'utils/unwrappedToken';
import './index.scss';
import { usePool } from 'hooks/usePools';
import { Box } from '@material-ui/core';
import { useV3PositionFromTokenId } from 'hooks/v3/useV3Positions';
import { useTranslation } from 'react-i18next';

export function IsActive({ el }: { el: any }) {
  const { t } = useTranslation();
  const { position: positionDetails } = useV3PositionFromTokenId(el.id);

  const token0Address = positionDetails?.token0;
  const token1Address = positionDetails?.token1;
  const tickLower = positionDetails?.tickLower;
  const tickUpper = positionDetails?.tickUpper;

  const token0 = useToken(token0Address);
  const token1 = useToken(token1Address);

  //TODO: This isn't work we are returning undefined always, maybe due to the type of token
  const currency0 = token0 ? unwrappedToken(token0) : undefined;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;

  //   // construct Position from details returned
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined);

  // check if price is within range
  const outOfRange: boolean =
    pool && tickLower && tickUpper
      ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper
      : false;

  return (
    <Box className='flex items-center'>
      <Box
        mr='6px'
        className={`v3-stake-active-dot ${
          outOfRange ? 'bg-error' : 'bg-success'
        }`}
      />
      <p className='weight-600'>{outOfRange ? t('outrange') : t('inrange')}</p>
    </Box>
  );
}
