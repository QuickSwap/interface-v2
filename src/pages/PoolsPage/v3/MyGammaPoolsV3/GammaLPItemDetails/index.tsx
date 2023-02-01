import React, { useState } from 'react';
import { Box, Button } from 'theme/components';
import { useTranslation } from 'react-i18next';
import './index.scss';
import { formatNumber } from 'utils';
import { CurrencyLogo } from 'components';
import Badge from 'components/v3/Badge';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';
import { formatUnits } from 'ethers/lib/utils';
import IncreaseGammaLiquidityModal from '../IncreaseGammaLiquidityModal';
import WithdrawGammaLiquidityModal from '../WithdrawGammaLiquidityModal';

const GammaLPItemDetails: React.FC<{ gammaPosition: any }> = ({
  gammaPosition,
}) => {
  const { t } = useTranslation();
  const token0USDPrice = useUSDCPrice(gammaPosition?.token0);
  const token0PooledPercent =
    token0USDPrice &&
    gammaPosition &&
    gammaPosition.balance0 &&
    Number(gammaPosition.balanceUSD) > 0
      ? ((Number(token0USDPrice.toSignificant()) * gammaPosition.balance0) /
          gammaPosition.balanceUSD) *
        100
      : 0;

  const [showAddLPModal, setShowAddLPModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  return (
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
          $
          {gammaPosition.balanceUSD
            ? formatNumber(Number(gammaPosition.balanceUSD))
            : 0}{' '}
          (
          {gammaPosition.shares
            ? formatNumber(formatUnits(gammaPosition.shares.toString(), 18))
            : 0}{' '}
          LP)
        </small>
      </Box>
      <Box className='flex justify-between' margin='8px 0 0'>
        {gammaPosition.token0 && (
          <Box className='flex items-center'>
            <Box className='flex' margin='0 8px 0 0'>
              <CurrencyLogo currency={gammaPosition.token0} size='24px' />
            </Box>
            <small>
              {t('pooled')} {gammaPosition.token0.symbol}
            </small>
          </Box>
        )}
        <Box className='flex items-center'>
          <small>
            {gammaPosition.balance0 ? formatNumber(gammaPosition.balance0) : 0}
          </small>
          <Box margin='0 0 0 6px'>
            <Badge text={`${formatNumber(token0PooledPercent)}%`} />
          </Box>
        </Box>
      </Box>
      <Box className='flex justify-between' margin='8px 0 0'>
        {gammaPosition.token1 && (
          <Box className='flex items-center'>
            <Box className='flex' margin='0 8px 0 0'>
              <CurrencyLogo currency={gammaPosition.token1} size='24px' />
            </Box>
            <small>
              {t('pooled')} {gammaPosition.token1.symbol}
            </small>
          </Box>
        )}
        <Box className='flex items-center'>
          <small>
            {gammaPosition.balance1 ? formatNumber(gammaPosition.balance1) : 0}
          </small>
          <Box margin='0 0 0 6px'>
            <Badge text={`${formatNumber(100 - token0PooledPercent)}%`} />
          </Box>
        </Box>
      </Box>
      <Box margin='16px 0 0' className='gamma-liquidity-item-buttons'>
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
  );
};

export default GammaLPItemDetails;
