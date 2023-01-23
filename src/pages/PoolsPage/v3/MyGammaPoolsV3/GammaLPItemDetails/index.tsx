import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import './index.scss';
import { formatNumber } from 'utils';
import { CurrencyLogo } from 'components';
import Badge from 'components/v3/Badge';
import { Button } from '@material-ui/core';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';
import { formatUnits } from 'ethers/lib/utils';
import IncreaseGammaLiquidityModal from '../IncreaseGammaLiquidityModal';
import WithdrawGammaLiquidityModal from '../WithdrawGammaLiquidityModal';

const GammaLPItemDetails: React.FC<{ gammaPosition: any }> = ({
  gammaPosition,
}) => {
  const { t } = useTranslation();
  const token0USDPrice = useUSDCPrice(gammaPosition.token0);
  const token0PooledPercent = token0USDPrice
    ? ((Number(token0USDPrice.toSignificant()) * gammaPosition.balance0) /
        gammaPosition.balanceUSD) *
      100
    : 0;

  const [showAddLPModal, setShowAddLPModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  return gammaPosition ? (
    <Box>
      {showAddLPModal && (
        <IncreaseGammaLiquidityModal
          open={showAddLPModal}
          onClose={() => setShowAddLPModal(false)}
          position={gammaPosition}
        />
      )}
      {showWithdrawModal && (
        <WithdrawGammaLiquidityModal
          open={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          position={gammaPosition}
        />
      )}
      <Box className='flex justify-between'>
        <small>{t('myLiquidity')}</small>
        <small>
          ${formatNumber(gammaPosition.balanceUSD)} (
          {formatNumber(formatUnits(gammaPosition.shares, 18))} LP)
        </small>
      </Box>
      <Box className='flex justify-between' mt={1}>
        <small>
          {t('profit')} / {t('loss')}
        </small>
        <small
          className={
            gammaPosition.returns.hypervisorReturnsUSD > 0
              ? 'text-success'
              : 'text-error'
          }
        >
          {gammaPosition.returns.hypervisorReturnsUSD > 0
            ? '+'
            : gammaPosition.returns.hypervisorReturnsUSD < 0
            ? '-'
            : ''}
          ${formatNumber(Math.abs(gammaPosition.returns.hypervisorReturnsUSD))}
        </small>
      </Box>
      <Box className='flex justify-between' mt={1}>
        <Box className='flex items-center'>
          <Box className='flex' mr={1}>
            <CurrencyLogo currency={gammaPosition.token0} size='24px' />
          </Box>
          <small>
            {t('pooled')} {gammaPosition.token0.symbol}
          </small>
        </Box>
        <Box className='flex items-center'>
          <small>{formatNumber(gammaPosition.balance0)}</small>
          <Box ml='6px'>
            <Badge text={`${formatNumber(token0PooledPercent)}%`} />
          </Box>
        </Box>
      </Box>
      <Box className='flex justify-between' mt={1}>
        <Box className='flex items-center'>
          <Box className='flex' mr={1}>
            <CurrencyLogo currency={gammaPosition.token1} size='24px' />
          </Box>
          <small>
            {t('pooled')} {gammaPosition.token1.symbol}
          </small>
        </Box>
        <Box className='flex items-center'>
          <small>{formatNumber(gammaPosition.balance1)}</small>
          <Box ml='6px'>
            <Badge text={`${formatNumber(100 - token0PooledPercent)}%`} />
          </Box>
        </Box>
      </Box>
      <Box mt={2} className='gamma-liquidity-item-buttons'>
        <Button
          className='gamma-liquidity-item-button'
          onClick={() => setShowAddLPModal(true)}
        >
          <small>{t('addLiquidity')}</small>
        </Button>
        <Button
          className='gamma-liquidity-item-button'
          onClick={() => setShowWithdrawModal(true)}
        >
          <small>{t('withdraw')}</small>
        </Button>
      </Box>
    </Box>
  ) : (
    <></>
  );
};

export default GammaLPItemDetails;
