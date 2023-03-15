import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import './index.scss';
import { formatNumber } from 'utils';
import { CurrencyLogo } from 'components';
import Badge from 'components/v3/Badge';
import { Button } from '@material-ui/core';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';
import IncreaseGammaLiquidityModal from '../IncreaseGammaLiquidityModal';
import WithdrawGammaLiquidityModal from '../WithdrawGammaLiquidityModal';
import { JSBI, Token } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useTokenBalance } from 'state/wallet/hooks';

const GammaLPItemDetails: React.FC<{ gammaPosition: any }> = ({
  gammaPosition,
}) => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const lpToken = chainId
    ? new Token(chainId, gammaPosition.pairAddress, 18)
    : undefined;
  const lpTokenBalance = useTokenBalance(account ?? undefined, lpToken);
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
            ? formatNumber(gammaPosition.shares / 10 ** 18)
            : 0}{' '}
          LP)
        </small>
      </Box>
      <Box className='flex justify-between' mt={1}>
        {gammaPosition.token0 && (
          <Box className='flex items-center'>
            <Box className='flex' mr={1}>
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
          <Box ml='6px'>
            <Badge text={`${formatNumber(token0PooledPercent)}%`} />
          </Box>
        </Box>
      </Box>
      <Box className='flex justify-between' mt={1}>
        {gammaPosition.token1 && (
          <Box className='flex items-center'>
            <Box className='flex' mr={1}>
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
          disabled={
            gammaPosition.farming &&
            (!lpTokenBalance ||
              JSBI.equal(lpTokenBalance.numerator, JSBI.BigInt('0')))
          }
          onClick={() => setShowWithdrawModal(true)}
        >
          <small>{t('withdraw')}</small>
        </Button>
      </Box>
    </Box>
  );
};

export default GammaLPItemDetails;
