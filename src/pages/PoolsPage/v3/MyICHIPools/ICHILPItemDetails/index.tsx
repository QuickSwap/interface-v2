import React, { useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import './index.scss';
import { formatNumber } from 'utils';
import { CurrencyLogo } from 'components';
import IncreaseICHILiquidityModal from '../IncreaseICHILiquidityModal';
import WithdrawICHILiquidityModal from '../WithdrawICHILiquidityModal';
import { ICHIVault } from 'hooks/useICHIData';

const ICHILPItemDetails: React.FC<{ position: ICHIVault }> = ({ position }) => {
  const { t } = useTranslation();
  const token0Balance = position.token0Balance ?? 0;
  const token1Balance = position.token1Balance ?? 0;
  const [showAddLPModal, setShowAddLPModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  return (
    <Box>
      {showAddLPModal && (
        <IncreaseICHILiquidityModal
          open={showAddLPModal}
          onClose={() => setShowAddLPModal(false)}
          position={position}
        />
      )}
      {showWithdrawModal && (
        <WithdrawICHILiquidityModal
          open={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          position={position}
        />
      )}
      <Box className='flex justify-between'>
        <small>{t('myLiquidity')}</small>
        <small>{formatNumber(position.balance)} LP</small>
      </Box>
      <Box className='flex justify-between' mt={1}>
        <Box className='flex items-center'>
          <Box className='flex' mr={1}>
            <CurrencyLogo currency={position.token0} size='24px' />
          </Box>
          <small>
            {t('pooled')} {position.token0?.symbol}
          </small>
        </Box>
        <Box className='flex items-center'>
          <small>{formatNumber(token0Balance)}</small>
        </Box>
      </Box>
      <Box className='flex justify-between' mt={1}>
        <Box className='flex items-center'>
          <Box className='flex' mr={1}>
            <CurrencyLogo currency={position.token1} size='24px' />
          </Box>
          <small>
            {t('pooled')} {position.token1?.symbol}
          </small>
        </Box>
        <Box className='flex items-center'>
          <small>{formatNumber(token1Balance)}</small>
        </Box>
      </Box>
      <Box mt={2} className='ichi-liquidity-item-buttons'>
        <Button
          className='ichi-liquidity-item-button'
          onClick={() => setShowAddLPModal(true)}
        >
          <small>{t('addLiquidity')}</small>
        </Button>
        <Button
          className='ichi-liquidity-item-button'
          disabled={!position.balance}
          onClick={() => setShowWithdrawModal(true)}
        >
          <small>{t('withdraw')}</small>
        </Button>
      </Box>
    </Box>
  );
};

export default ICHILPItemDetails;
