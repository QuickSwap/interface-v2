import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import styles from 'styles/pages/pools/AutomaticLPItemDetails.module.scss';
import { formatNumber } from 'utils';
import { CurrencyLogo } from 'components';
import IncreaseDefiedgeLiquidityModal from './IncreaseDefiedgeLiquidityModal';
import WithdrawDefiedgeLiquidityModal from './WithdrawDefiedgeLiquidityModal';
import { useDefiedgeStrategyData } from 'hooks/v3/useDefiedgeStrategyData';
import { formatUnits } from 'ethers/lib/utils';

const DefiedgeLPItemDetails: React.FC<{ defiedgePosition: any }> = ({
  defiedgePosition,
}) => {
  const { t } = useTranslation();
  const { totalSupply, amount0, amount1 } = useDefiedgeStrategyData(
    defiedgePosition.id,
  );

  const amount0Number = amount0
    ? Number(formatUnits(amount0, defiedgePosition?.token0?.decimals))
    : 0;
  const amount1Number = amount1
    ? Number(formatUnits(amount1, defiedgePosition?.token1?.decimals))
    : 0;
  const balance0 =
    amount0 &&
    totalSupply &&
    amount0Number * (defiedgePosition.share / totalSupply);
  const balance1 =
    amount1 &&
    totalSupply &&
    amount1Number * (defiedgePosition.share / totalSupply);

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
          {defiedgePosition.share ? formatNumber(defiedgePosition.share) : 0}{' '}
          DES
        </small>
      </Box>
      <Box className='flex justify-between' mt={1}>
        {defiedgePosition.token0 && (
          <Box className='flex items-center'>
            <Box className='flex' mr={1}>
              <CurrencyLogo currency={defiedgePosition.token0} />
            </Box>
            <small>
              {t('pooled')} {defiedgePosition.token0.symbol}
            </small>
          </Box>
        )}
        <Box className='flex items-center'>
          <small>{balance0 ? formatNumber(balance0) : 0}</small>
        </Box>
      </Box>
      <Box className='flex justify-between' mt={1}>
        {defiedgePosition.token1 && (
          <Box className='flex items-center'>
            <Box className='flex' mr={1}>
              <CurrencyLogo currency={defiedgePosition.token1} />
            </Box>
            <small>
              {t('pooled')} {defiedgePosition.token1.symbol}
            </small>
          </Box>
        )}
        <Box className='flex items-center'>
          <small>{balance1 ? formatNumber(balance1) : 0}</small>
        </Box>
      </Box>
      <Box mt={2} className={styles.liquidityItemButtons}>
        <Button
          className={styles.liquidityItemButton}
          onClick={() => setShowAddLPModal(true)}
        >
          <small>{t('addLiquidity')}</small>
        </Button>
        <Button
          className={styles.liquidityItemButton}
          onClick={() => setShowWithdrawModal(true)}
          disabled={defiedgePosition.lpAmount <= 0}
        >
          <small>{t('withdraw')}</small>
        </Button>
      </Box>
    </Box>
  );
};

export default DefiedgeLPItemDetails;
