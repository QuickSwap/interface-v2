import React from 'react';
import { Pair } from '@uniswap/v2-sdk';
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { RowBetween, RowFixed } from '../Row';
import { TYPE } from 'theme/index';
import { FiatValue } from './FiatValue';

import {
  Aligner,
  AutoColumnStyled,
  Container,
  CurrencySelect,
  FiatRow,
  FixedContainer,
  InputPanel,
  InputRow,
  MaxButton,
  NumericalInputStyled,
  StyledTokenName,
} from './styled';
import { useActiveWeb3React } from 'hooks';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';
import Loader from 'components/Loader';
import { WrappedCurrency } from 'models/types/Currency';
import CurrencyLogo from 'components/CurrencyLogo';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import DoubleCurrencyLogo from 'components/DoubleCurrencyLogo';
import CurrencySearchModal from 'components/CurrencySearchModal';
import { Box } from '@material-ui/core';
import NumericalInput from 'components/NumericalInput';
import { useTranslation } from 'react-i18next';

interface CurrencyInputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  onMax?: () => void;
  showMaxButton: boolean;
  label?: ReactNode;
  onCurrencySelect?: (currency: Currency) => void;
  currency?: WrappedCurrency | null;
  hideBalance?: boolean;
  pair?: Pair | null;
  hideInput?: boolean;
  otherCurrency?: Currency | null;
  fiatValue?: CurrencyAmount<Token> | null;
  priceImpact?: Percent;
  id: string;
  showCommonBases?: boolean;
  showCurrencyAmount?: boolean;
  disableNonToken?: boolean;
  showBalance?: boolean;
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode;
  locked?: boolean;
  hideCurrency?: boolean;
  centered?: boolean;
  disabled: boolean;
  shallow: boolean;
  swap: boolean;
  page?: string;
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  currency,
  otherCurrency,
  id,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  fiatValue,
  priceImpact,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  showBalance,
  hideCurrency = false,
  centered = false,
  disabled,
  shallow = false,
  swap = false,
  page,
  ...rest
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { account } = useActiveWeb3React();
  const { t } = useTranslation();

  const balance = useCurrencyBalance(
    account ?? undefined,
    currency ?? undefined,
  );

  const currentPrice = useUSDCPrice(currency ?? undefined);

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  const balanceString = useMemo(() => {
    if (!balance) return 'Loading...';

    const _balance = balance.toFixed();

    if (_balance.split('.')[0].length > 10) {
      return _balance.slice(0, 7) + '...';
    }

    if (+balance.toFixed() === 0) {
      return '0';
    }
    if (+balance.toFixed() < 0.0001) {
      return '< 0.0001';
    }

    return +balance.toFixed(3);
  }, [balance]);

  return (
    <InputPanel id={id} hideInput={hideInput} {...rest}>
      {locked && (
        <FixedContainer
          style={{ height: `${page === 'pool' ? '40px' : '80px'}` }}
        >
          <AutoColumnStyled
            gap='sm'
            justify='center'
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              marginTop: '18px',
              position: 'absolute',
              bottom: '10%',
            }}
          >
            {/* <Lock /> */}
            <TYPE.label fontSize='14px'>
              Price is outside specified price range. Single-asset deposit only.
            </TYPE.label>
          </AutoColumnStyled>
        </FixedContainer>
      )}

      <Box id={id} className='bg-secondary2 swapBox'>
        <Box mb={2}>
          <Box>
            <Box
              className={`currencyButton  ${'token-select-background-v3'}  ${
                currency ? 'currencySelected' : 'noCurrency'
              }`}
              onClick={() => {
                if (onCurrencySelect) {
                  setModalOpen(true);
                }
              }}
            >
              {currency ? (
                <Box className='flex w-100 justify-between items-center'>
                  <Box className='flex'>
                    <CurrencyLogo
                      size={'25px'}
                      currency={currency as WrappedCurrency}
                    ></CurrencyLogo>
                    <p>{currency?.symbol}</p>
                  </Box>
                </Box>
              ) : (
                <p>{t('selectToken')}</p>
              )}
            </Box>
          </Box>

          <Box className='inputWrapper'>
            <NumericalInput
              value={value}
              align='right'
              placeholder='0.00'
              onUserInput={(val) => {
                if (val === '.') val = '0.';
                onUserInput(val);
              }}
            />
          </Box>
        </Box>
        <Box className='flex justify-between'>
          <Box display='flex'>
            <small className='text-secondary'>
              {'balance'}: {balance?.toSignificant(5)}
            </small>

            {account && currency && true && (
              <Box
                className='maxWrapper'
                onClick={() => {
                  console.log('handle half');
                }}
              >
                <small>50%</small>
              </Box>
            )}
            {account && currency && showMaxButton && (
              <Box className='maxWrapper' marginLeft='20px' onClick={onMax}>
                <small>{'max'}</small>
              </Box>
            )}
          </Box>

          <small className='text-secondary'>${balanceString}</small>
        </Box>
      </Box>

      {onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          // TODO: Consider adding support for V3 Functionality
          // showCurrencyAmount={showCurrencyAmount}
          // disableNonToken={disableNonToken}
        />
      )}
    </InputPanel>
  );
}
