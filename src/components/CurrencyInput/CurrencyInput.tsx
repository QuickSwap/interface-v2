import React, { useCallback, useState } from 'react';
import { Currency } from '@uniswap/sdk';
import { Box } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { CurrencySearchModal, CurrencyLogo, NumericalInput } from 'components';
import { useActiveWeb3React } from 'hooks';
import useUSDCPrice from 'utils/useUSDCPrice';
import { formatTokenAmount } from 'utils';
import 'components/styles/CurrencyInput.scss';

interface CurrencyInputProps {
  title?: string;
  handleCurrencySelect: (currency: Currency) => void;
  currency: Currency | undefined;
  otherCurrency?: Currency | undefined;
  amount: string;
  setAmount: (value: string) => void;
  onMax?: () => void;
  onHalf?: () => void;
  showHalfButton?: boolean;
  showMaxButton?: boolean;
  showPrice?: boolean;
  bgColor?: string;
  id?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  handleCurrencySelect,
  currency,
  otherCurrency,
  amount,
  setAmount,
  onMax,
  onHalf,
  showMaxButton,
  showHalfButton,
  title,
  showPrice,
  bgColor,
  id,
}) => {
  const { palette } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const { account } = useActiveWeb3React();
  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    currency,
  );
  const usdPrice = Number(useUSDCPrice(currency)?.toSignificant() ?? 0);

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  return (
    <Box
      id={id}
      className={`swapBox${showPrice ? ' priceShowBox' : ''}`}
      bgcolor={bgColor ?? palette.secondary.dark}
    >
      <Box display='flex' justifyContent='space-between' mb={2}>
        <p>{title || 'You Pay:'}</p>
        <Box display='flex'>
          {account && currency && showHalfButton && (
            <Box className='maxWrapper' onClick={onHalf}>
              <small>50%</small>
            </Box>
          )}
          {account && currency && showMaxButton && (
            <Box className='maxWrapper' marginLeft='20px' onClick={onMax}>
              <small>MAX</small>
            </Box>
          )}
        </Box>
      </Box>
      <Box mb={2}>
        <Box
          className={`currencyButton ${
            currency ? 'currencySelected' : 'noCurrency'
          }`}
          onClick={handleOpenModal}
        >
          {currency ? (
            <>
              <CurrencyLogo currency={currency} size={'28px'} />
              <p className='token-symbol-container'>{currency?.symbol}</p>
            </>
          ) : (
            <p>Select a token</p>
          )}
        </Box>
        <Box className='inputWrapper'>
          <NumericalInput
            value={amount}
            align='right'
            color={palette.text.secondary}
            placeholder='0.00'
            onUserInput={(val) => {
              setAmount(val);
            }}
          />
        </Box>
      </Box>
      <Box
        display='flex'
        justifyContent='space-between'
        className='balanceSection'
      >
        <small>Balance: {formatTokenAmount(selectedCurrencyBalance)}</small>
        <small>${(usdPrice * Number(amount)).toLocaleString()}</small>
      </Box>
      {modalOpen && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={() => {
            setModalOpen(false);
          }}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={currency}
          showCommonBases={true}
          otherSelectedCurrency={otherCurrency}
        />
      )}
    </Box>
  );
};

export default CurrencyInput;
