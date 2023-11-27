import { Box } from '@material-ui/core';
import { DoubleCurrencyLogo } from 'components';
import { ICHIVault } from 'hooks/useICHIData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from 'utils';
import { Check } from '@material-ui/icons';

const SingleTokenPoolCard: React.FC<{
  vault: ICHIVault;
  onClick: () => void;
  selected: boolean;
  unselected: boolean;
}> = ({ vault, onClick, selected, unselected }) => {
  const { t } = useTranslation();

  return (
    <Box
      className={`singleTokenPoolCard ${
        selected
          ? 'singleTokenPoolCardSelected'
          : unselected
          ? 'singleTokenPoolCardUnSelected'
          : ''
      }`}
      onClick={onClick}
    >
      <Box width='80%' className='flex items-center'>
        <Box className='singleTokenPoolCardCheck'>{selected && <Check />}</Box>
        <DoubleCurrencyLogo
          currency0={vault.token0}
          currency1={vault.token1}
          size={18}
        />
        <small>
          {vault.token0?.symbol}/{vault.token1?.symbol}
        </small>
        <Box className='singleTokenPoolFee'>
          {formatNumber(vault.fee)}% {t('fee')}
        </Box>
      </Box>
      <Box width='20%'>{}%</Box>
    </Box>
  );
};

export default SingleTokenPoolCard;
