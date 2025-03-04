import React, { useCallback } from 'react';
import { CustomModal } from 'components';
import { ReportProblemOutlined } from '@material-ui/icons';
import { Currency, currencyEquals, Trade } from '@uniswap/sdk';
import { styled } from '@material-ui/styles';
import { Box, Button } from '@material-ui/core';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIsV4 } from 'state/application/hooks';
import { useDerivedSwapInfo, useSwapState } from 'state/swap/hooks';
import { Field, SwapDelay } from 'state/swap/actions';
import { useCurrency } from 'hooks/Tokens';
import { useBestV3TradeExactOut } from 'hooks/v3/useBestV3Trade';
import { useBestV3TradeExactIn } from 'hooks/v3/useBestV3Trade';
import { useSwapActionHandlers } from 'state/swap/v3/hooks';

interface NoLiquiditySwapConfirmationProps {
  isOpen: boolean;
  parsedAmount: any;
  onClose: () => void;
  inputValue: string;
  outputValue: string;
}
export const NoLiquiditySwapConfirmation: React.FC<NoLiquiditySwapConfirmationProps> = ({
  isOpen,
  parsedAmount,
  onClose,
  inputValue,
  outputValue,
}) => {
  const { t } = useTranslation();
  const { isV4 } = useIsV4();
  const history = useHistory();

  const { currencies } = useDerivedSwapInfo();
  const { onUserInput } = useSwapActionHandlers();
  const { independentField } = useSwapState();

  const inputCurrencyId = currencies[Field.INPUT] as any;
  const outputCurrencyId = currencies[Field.OUTPUT] as any;
  const inputCurrency = useCurrency(inputCurrencyId.address);
  const outputCurrency = useCurrency(outputCurrencyId.address);

  const isExactIn: boolean = independentField === Field.INPUT;

  const bestV3TradeExactIn = useBestV3TradeExactIn(
    isExactIn ? parsedAmount : undefined,
    outputCurrency as any,
    isV4,
  );

  const bestV3TradeExactOut = useBestV3TradeExactOut(
    inputCurrency as any,
    !isExactIn ? parsedAmount : undefined,
    isV4,
  );
  const v3Trade =
    (isExactIn ? bestV3TradeExactIn : bestV3TradeExactOut) ?? undefined;
  const handleV3Market = () => {
    if (inputValue) onUserInput(Field.INPUT, inputValue);
    if (outputValue) onUserInput(Field.OUTPUT, outputValue);
    const currentPath = history.location.pathname + history.location.search;
    let redirectPath = '';
    redirectPath = currentPath.replace(`swapIndex=0`, `swapIndex=2`);
    history.push(redirectPath);
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
          <p className='text-center'>
            {v3Trade?.state === 0
              ? t('availableLiquidityInV3')
              : t('seekingLiquidityinV3')}
          </p>
        </Box>
        <Box mt={3} className='flex items-center justify-between'>
          <Button onClick={() => handleV3Market()}>Yes</Button>
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
