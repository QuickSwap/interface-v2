import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import './index.scss';
import { formatNumber } from 'utils';
import { CurrencyLogo } from 'components';
import { Button } from '@material-ui/core';
import IncreaseDefiedgeLiquidityModal from '../IncreaseDefiedgeLiquidityModal';
import WithdrawDefiedgeLiquidityModal from '../WithdrawDefiedgeLiquidityModal';
import { useDefiedgeStrategyData } from 'hooks/v3/useDefiedgeStrategyData';

const DefiedgeLPItemDetails: React.FC<{ defiedgePosition: any }> = ({
  defiedgePosition,
}) => {
  const { t } = useTranslation();
  const { totalSupply, amount0, amount1 } = useDefiedgeStrategyData(
    defiedgePosition.id,
  );

  const balance0 =
    amount0 && totalSupply && amount0 * (defiedgePosition.share / totalSupply);
  const balance1 =
    amount1 && totalSupply && amount1 * (defiedgePosition.share / totalSupply);

  const [showAddLPModal, setShowAddLPModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  return (
    <Box>
      {showAddLPModal && (
        <IncreaseDefiedgeLiquidityModal
          open={showAddLPModal}
          onClose={() => setShowAddLPModal(false)}
          position={{ ...defiedgePosition, balance0, balance1 }}
        />
      )}
      {showWithdrawModal && (
        <WithdrawDefiedgeLiquidityModal
          open={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          position={{ ...defiedgePosition, balance0, balance1 }}
        />
      )}
      <Box className='flex justify-between'>
        <small>{t('myLiquidity')}</small>
        <small>
          {/* $
          {defiedgePosition.balanceUSD
            ? formatNumber(Number(defiedgePosition.balanceUSD))
            : 0}{' '} */}
          {defiedgePosition.share ? formatNumber(defiedgePosition.share) : 0}{' '}
          DES
        </small>
      </Box>
      <Box className='flex justify-between' mt={1}>
        {defiedgePosition.token0 && (
          <Box className='flex items-center'>
            <Box className='flex' mr={1}>
              <CurrencyLogo currency={defiedgePosition.token0} size='24px' />
            </Box>
            <small>
              {t('pooled')} {defiedgePosition.token0.symbol}
            </small>
          </Box>
        )}
        <Box className='flex items-center'>
          <small>{balance0 ? formatNumber(balance0) : 0}</small>
          <Box ml='6px'>
            {/* <Badge text={`${formatNumber(token0PooledPercent)}%`} /> */}
          </Box>
        </Box>
      </Box>
      <Box className='flex justify-between' mt={1}>
        {defiedgePosition.token1 && (
          <Box className='flex items-center'>
            <Box className='flex' mr={1}>
              <CurrencyLogo currency={defiedgePosition.token1} size='24px' />
            </Box>
            <small>
              {t('pooled')} {defiedgePosition.token1.symbol}
            </small>
          </Box>
        )}
        <Box className='flex items-center'>
          <small>{balance1 ? formatNumber(balance1) : 0}</small>
          <Box ml='6px'>
            {/* <Badge text={`${formatNumber(100 - token0PooledPercent)}%`} /> */}
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
  );
};

export default DefiedgeLPItemDetails;
