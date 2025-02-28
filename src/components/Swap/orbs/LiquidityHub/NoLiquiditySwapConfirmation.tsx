import React, { useCallback } from 'react';
import { CustomModal } from 'components';
import { ReportProblemOutlined } from '@material-ui/icons';
import { Currency, currencyEquals, Trade } from '@uniswap/sdk';
import { styled } from '@material-ui/styles';
import { Box, Button } from '@material-ui/core';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NoLiquiditySwapConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  inputAddress: string;
  outputAddress: string;
}
export const NoLiquiditySwapConfirmation: React.FC<NoLiquiditySwapConfirmationProps> = ({
  isOpen,
  onClose,
  inputAddress,
  outputAddress,
}) => {
  const history = useHistory();
  const { t } = useTranslation();

  const handleUseV3 = () => {
    history.push(
      `/swap?swapIndex=2&currency0=${inputAddress}&currency1=${outputAddress}`,
    );
  };
  return (
    <StyledNoLiquiditySwapConfirmationModal
      open={isOpen}
      modalWrapper='txModalWrapper'
    >
      <Box paddingX={3} paddingY={4}>
        <Box className='flex items-center justify-center'>
          <Box className='flex' mr={1}>
            <ReportProblemOutlined />
          </Box>
          <h5 className='text-center'>{t('noLiquidityinFound')}</h5>
        </Box>
        <Box mt={2}>
          <p className='text-center'>{t('useMarketV3')}</p>
        </Box>
        <Box mt={3} className='flex items-center justify-between'>
          <Button onClick={() => handleUseV3()}>Yes</Button>
          <Button onClick={() => onClose()}>No</Button>
        </Box>{' '}
      </Box>
    </StyledNoLiquiditySwapConfirmationModal>
  );
};
const StyledNoLiquiditySwapConfirmationModal = styled(CustomModal)({
  '& .customModalBackdrop': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
