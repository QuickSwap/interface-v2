import React from 'react';
import { Currency } from '@uniswap/sdk';
import { Box } from '@material-ui/core';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { CurrencySearchModal, NumericalInput } from 'components';
import { useActiveWeb3React } from 'hooks';
import useUSDCPrice from 'utils/useUSDCPrice';
import { formatTokenAmount } from 'utils';
import 'components/styles/CurrencyInput.scss';
import { useTranslation } from 'react-i18next';
import CurrencySelect from 'components/CurrencySelect';

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
  bgClass?: string;
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
  bgClass,
  id,
}) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    currency,
  );
  const usdPrice = Number(useUSDCPrice(currency)?.toSignificant() ?? 0);

  return (
    <Box
      id={id}
      className={`swapBox${showPrice ? ' priceShowBox' : ''} ${bgClass ??
        'bg-secondary2'}`}
    >
      <Box className='flex justify-between' mb={2}>
        <p>{title || `${t('youPay')}:`}</p>
        <Box display='flex'>
          {account && currency && showHalfButton && (
            <Box className='maxWrapper' onClick={onHalf}>
              <small>50%</small>
            </Box>
          )}
          {account && currency && showMaxButton && (
            <Box className='maxWrapper' marginLeft='20px' onClick={onMax}>
              <small>{t('max')}</small>
            </Box>
          )}
        </Box>
      </Box>
      <Box mb={2}>
        <CurrencySelect
          id={id}
          currency={currency}
          otherCurrency={otherCurrency}
          handleCurrencySelect={handleCurrencySelect}
        />
        <Box className='inputWrapper'>
          <NumericalInput
            value={amount}
            align='right'
            placeholder='0.00'
            onUserInput={(val) => {
              setAmount(val);
            }}
          />
        </Box>
      </Box>
      <Box className='flex justify-between'>
        <small className='text-secondary'>
          {t('balance')}: {formatTokenAmount(selectedCurrencyBalance)}
        </small>
        <small className='text-secondary'>
          ${(usdPrice * Number(amount)).toLocaleString()}
        </small>
      </Box>
    </Box>
  );
};

export default CurrencyInput;
