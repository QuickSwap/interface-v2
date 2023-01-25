import React from 'react';
import { Box } from 'theme/components';
import { GlobalConst } from 'constants/index';
import { DoubleCurrencyLogo } from 'components';
import { formatCompact, getDaysCurrentYear } from 'utils';
import { useCurrency } from 'hooks/Tokens';
import { useTranslation } from 'react-i18next';
import { useIsXS } from 'hooks/useMediaQuery';

const LiquidityPoolRow: React.FC<{
  pair: any;
}> = ({ pair }) => {
  const daysCurrentYear = getDaysCurrentYear();
  const { t } = useTranslation();
  const isMobile = useIsXS();

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
    <Box className='liquidityContent'>
      <Box className='flex items-center' width={isMobile ? '100%' : '50%'}>
        <DoubleCurrencyLogo
          currency0={token0 ?? undefined}
          currency1={token1 ?? undefined}
          size={28}
        />
        <small style={{ marginLeft: 12 }}>
          {pair.token0.symbol.toUpperCase()} /{' '}
          {pair.token1.symbol.toUpperCase()}
        </small>
      </Box>
      <Box
        width={isMobile ? '100%' : '20%'}
        margin={isMobile ? '20px 0 0' : '0'}
        className='flex justify-between'
      >
        {isMobile && <small className='text-secondary'>{t('tvl')}</small>}
        <small>${formatCompact(liquidity)}</small>
      </Box>
      <Box
        width={isMobile ? '100%' : '15%'}
        margin={isMobile ? '8px 0 0' : '0'}
        className='flex justify-between'
      >
        {isMobile && <small className='text-secondary'>{t('24hVol')}</small>}
        <small>${formatCompact(volume)}</small>
      </Box>
      <Box
        width={isMobile ? '100%' : '15%'}
        margin={isMobile ? '8px 0 0' : '0'}
        className={`flex ${isMobile ? 'justify-between' : 'justify-end'}`}
      >
        {isMobile && <small className='text-secondary'>{t('apy')}</small>}
        <small
          className={`text-right ${apy < 0 ? 'text-error' : 'text-success'}`}
        >
          {apy.toFixed(2)}%
        </small>
      </Box>
    </Box>
  );
};

export default React.memo(LiquidityPoolRow);
