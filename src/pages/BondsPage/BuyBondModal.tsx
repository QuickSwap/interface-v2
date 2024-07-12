import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import { CustomModal, DualCurrencyPanel } from 'components';
import BillImage from 'assets/images/bonds/quickBond.jpg';
import BondTokenDisplay from './BondTokenDisplay';
import { useTranslation } from 'react-i18next';
import { formatNumber } from 'utils';
import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { useActiveWeb3React } from 'hooks';
import { Currency } from '@uniswap/sdk-core';
import { useZapActionHandlers, useZapState } from 'state/zap/hooks';
import { Field } from 'state/zap/actions';
import { useCurrency } from 'hooks/v3/Tokens';
import { Bond, DualCurrencySelector, PurchasePath } from 'types/bond';
import {
  LiquidityDex,
  dexToZapMapping,
  ZapVersion,
} from '@ape.swap/apeswap-lists';
import { NATIVE_TOKEN_ADDRESS, ZAP_ADDRESS } from 'constants/v3/addresses';
import { useV2Pair } from 'hooks/v3/useV2Pairs';
import BondActions from './BondActions';
import UserBondModalView from './UserBondModalView';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';

interface BuyBondModalProps {
  open: boolean;
  onClose: () => void;
  bond: Bond;
}

const BuyBondModal: React.FC<BuyBondModalProps> = ({ bond, open, onClose }) => {
  const token1Obj = bond.token;
  const token2Obj =
    bond.billType === 'reserve' ? bond.earnToken : bond.quoteToken;
  const token3Obj = bond.earnToken;
  const stakeLP = bond.billType !== 'reserve';
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const { typedValue } = useZapState();
  const { onCurrencySelection, onUserInput } = useZapActionHandlers();
  const [bondId, setBondId] = useState('');
  const [txSubmitted, setTxSubmitted] = useState(false);

  const billCurrencyA = useCurrency(bond?.token.address[chainId]);
  const billCurrencyB = useCurrency(bond?.quoteToken.address[chainId]);
  const billsCurrencies = useMemo(() => {
    if (!billCurrencyA) return;
    return {
      currencyA: billCurrencyA,
      currencyB: billCurrencyB ?? undefined,
    };
  }, [billCurrencyA, billCurrencyB]);
  const [currencyA, setCurrencyA] = useState(billsCurrencies?.currencyA);
  const [currencyB, setCurrencyB] = useState(billsCurrencies?.currencyB);
  const billCurrencyLoaded = !!billsCurrencies;

  useEffect(() => {
    if (billsCurrencies) {
      setCurrencyA(billsCurrencies.currencyA);
      setCurrencyB(billsCurrencies.currencyB);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billCurrencyLoaded]);

  const inputCurrencies = useMemo(() => {
    const currencies = [];
    if (currencyA) {
      currencies.push(currencyA);
    }
    if (currencyB) {
      currencies.push(currencyB);
    }
    return currencies;
  }, [currencyA, currencyB]);

  const discountEarnTokenPrice =
    bond && bond?.earnTokenPrice
      ? bond?.earnTokenPrice -
        bond?.earnTokenPrice * ((bond?.discount ?? 0) / 100)
      : 0;
  const principalToken = useCurrency(bond?.lpToken.address[chainId]);

  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    inputCurrencies[1]
      ? principalToken ?? currencyA ?? undefined
      : currencyA ?? undefined,
  );

  const onHandleValueChange = useCallback(
    (val: string) => {
      onUserInput(Field.INPUT, val);
    },
    [onUserInput],
  );

  const handleMaxInput = useCallback(() => {
    onHandleValueChange(
      maxAmountSpend(selectedCurrencyBalance)?.toExact() ?? '',
    );
  }, [onHandleValueChange, selectedCurrencyBalance]);

  const handleCurrencySelect = useCallback(
    (currency: DualCurrencySelector) => {
      setCurrencyA(currency?.currencyA);
      setCurrencyB(currency?.currencyB);
      onHandleValueChange('');
      if (!currency?.currencyB) {
        if (currency.currencyA) {
          onCurrencySelection(Field.INPUT, [currency.currencyA]);
        }
        if (billsCurrencies) {
          const currencies: Currency[] = [];
          if (billsCurrencies.currencyA) {
            currencies.push(billsCurrencies.currencyA);
          }
          if (billsCurrencies.currencyB) {
            currencies.push(billsCurrencies.currencyB);
          }
          onCurrencySelection(Field.OUTPUT, currencies);
        }
      }
    },
    [billsCurrencies, onCurrencySelection, onHandleValueChange],
  );

  const liquidityDex =
    bond?.lpToken.liquidityDex?.[chainId] || LiquidityDex.ApeSwapV2;
  const dexToZapMappingAny = dexToZapMapping as any;
  const lpTokenZapVersion = dexToZapMappingAny[liquidityDex]?.[
    chainId
  ] as ZapVersion;
  const [, pair] = useV2Pair(currencyA ?? undefined, currencyB ?? undefined);

  const getInputCurrency = () => {
    if (currencyB && pair && lpTokenZapVersion === ZapVersion.ZapV1) {
      return pair.liquidityToken;
    }

    if (currencyB && lpTokenZapVersion !== ZapVersion.ZapV1) {
      return principalToken?.wrapped;
    }

    if (currencyA?.isNative) {
      return { ...currencyA, address: NATIVE_TOKEN_ADDRESS };
    }

    return currencyA;
  };

  const inputCurrency = getInputCurrency();

  const { address: inputTokenAddress = '' } = inputCurrency ?? {};

  const getIsZapCurrDropdownEnabled = (): boolean => {
    return (
      bond?.billType !== 'reserve' && lpTokenZapVersion !== ZapVersion.External
    );
  };

  const pathSelector = (): PurchasePath => {
    switch (true) {
      case inputTokenAddress === bond.lpToken.address[chainId]:
        return PurchasePath.LpPurchase;
      case lpTokenZapVersion === ZapVersion.ZapV1:
        console.error('Apeswap native zap deprecated');
        return PurchasePath.ApeZap;
      case lpTokenZapVersion === ZapVersion.SoulZap:
        return PurchasePath.SoulZap;
      case lpTokenZapVersion === ZapVersion.SoulZapApi:
        return PurchasePath.SoulZapApi;
      default:
        return PurchasePath.Loading;
    }
  };

  return (
    <CustomModal open={open} onClose={onClose} modalWrapper='bondModalWrapper'>
      <CloseIcon className='bondModalClose' onClick={onClose} />
      {bond && bondId ? (
        <UserBondModalView bond={bond} billId={bondId} onDismiss={onClose} />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={6}>
            <img src={BillImage} width='100%' />
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <Box className='flex' mb={2}>
              <Box className='bondTypeTag'>{bond.billType}</Box>
            </Box>
            <Box className='flex items-center'>
              <BondTokenDisplay
                token1Obj={token1Obj}
                token2Obj={token2Obj}
                token3Obj={token3Obj}
                stakeLP={stakeLP}
              />
              <Box className='flex' mx='12px'>
                <h6 className='weight-600 text-gray32'>
                  {token1Obj?.symbol}
                  {stakeLP ? `/${token2Obj?.symbol}` : ''} {` -> `}
                  {stakeLP ? token3Obj?.symbol : token2Obj?.symbol}
                </h6>
              </Box>
            </Box>
            <Box mt={2}>
              <small className='text-secondary'>
                {bond.earnToken?.symbol} {t('marketPrice')}&nbsp;
                <span style={{ textDecoration: 'line-through' }}>
                  ${formatNumber(bond?.earnTokenPrice ?? 0)}
                </span>
              </small>
              <Box mt='4px' className='flex items-center'>
                <BondTokenDisplay token1Obj={bond.earnToken} />
                <Box ml={1}>
                  <h4 className='font-bold text-white'>
                    ${formatNumber(discountEarnTokenPrice)} (
                    {formatNumber(bond?.discount ?? 0)}% {t('discount')})
                  </h4>
                </Box>
              </Box>
              {billsCurrencies && (
                <Box mt={2}>
                  <DualCurrencyPanel
                    handleMaxInput={handleMaxInput}
                    onUserInput={onHandleValueChange}
                    value={typedValue}
                    onCurrencySelect={handleCurrencySelect}
                    inputCurrencies={
                      bond?.billType !== 'reserve'
                        ? inputCurrencies
                        : [inputCurrencies[0]]
                    }
                    lpList={[billsCurrencies]}
                    principalToken={principalToken ?? null}
                    enableZap={getIsZapCurrDropdownEnabled()}
                    lpUsdVal={bond?.lpPrice}
                  />
                </Box>
              )}
              <BondActions
                purchasePath={pathSelector()}
                bond={bond}
                onBillId={setBondId}
                inputTokenAddress={inputTokenAddress}
                onTransactionSubmitted={setTxSubmitted}
              />
            </Box>
          </Grid>
        </Grid>
      )}
    </CustomModal>
  );
};

export default BuyBondModal;
