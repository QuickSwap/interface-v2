import React from 'react';
import { Currency, ETHER, currencyEquals } from '@uniswap/sdk';
import { NativeCurrency } from '@uniswap/sdk-core';
import { WrappedTokenInfo } from 'state/lists/v3/wrappedTokenInfo';
import { TokenInfo } from '@uniswap/token-lists';
import { Box } from '@material-ui/core';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { NumericalInput } from 'components';
import { useActiveWeb3React } from 'hooks';
import useUSDCPrice from 'utils/useUSDCPrice';
import { formatTokenAmount } from 'utils';
import 'components/styles/CurrencyInput.scss';
import { useTranslation } from 'react-i18next';
import CurrencySelect from 'components/CurrencySelect';
import { default as useUSDCPriceV3 } from 'hooks/v3/useUSDCPrice';
import { WMATIC_EXTENDED } from 'constants/v3/addresses';

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
  color?: string;
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
  color,
  id,
}) => {
  const { t } = useTranslation();
  const { account, chainId } = useActiveWeb3React();
  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    currency,
  );
  const usdPriceV2 = Number(useUSDCPrice(currency)?.toSignificant() ?? 0);
  const currencyV3 =
    chainId && currency
      ? currencyEquals(currency, ETHER)
        ? ({
            ...ETHER,
            isNative: true,
            isToken: false,
            wrapped: WMATIC_EXTENDED[chainId],
          } as NativeCurrency)
        : new WrappedTokenInfo(currency as TokenInfo)
      : undefined;
  const usdPriceV3Obj = useUSDCPriceV3(currencyV3);
  const usdPriceV3 = Number(usdPriceV3Obj?.toSignificant() ?? 0);
  const usdPrice = usdPriceV3 || usdPriceV2;

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
            color={color}
            placeholder='0.00'
            onUserInput={(val) => {
              setAmount(val);
            }}
          />
        </Box>
      </Box>
      <Box className='flex justify-between'>
        <small className={`${color ? `text-${color}` : 'text-secondary'}}`}>
          {t('balance')}: {formatTokenAmount(selectedCurrencyBalance)}
        </small>
        <small className={`${color ? `text-${color}` : 'text-secondary'}}`}>
          ${(usdPrice * Number(amount)).toLocaleString('us')}
        </small>
      </Box>
    </Box>
  );
};

export default CurrencyInput;
