import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid } from '@material-ui/core';
import { CustomModal, DualCurrencyPanel } from 'components';
import BillImage from 'assets/images/bonds/quickBond.jpg';
import BondTokenDisplay from './BondTokenDisplay';
import { useTranslation } from 'react-i18next';
import { formatNumber } from 'utils';
import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { useActiveWeb3React } from 'hooks';
import { Currency, Percent } from '@uniswap/sdk-core';
import { BigNumber, ContractReceipt } from 'ethers';
import {
  useDerivedZapInfo,
  useZapActionHandlers,
  useZapState,
} from 'state/zap/hooks';
import { Field } from 'state/zap/actions';
import { useCurrency } from 'hooks/v3/Tokens';
import { Bond, DualCurrencySelector } from 'types/bond';
import {
  LiquidityDex,
  dexToZapMapping,
  ZapVersion,
} from '@ape.swap/apeswap-lists';
import useGetWidoQuote from 'state/zap/providers/wido/useGetWidoQuote';
import { NATIVE_TOKEN_ADDRESS } from 'constants/v3/addresses';
import { useV2Pair } from 'hooks/v3/useV2Pairs';
import BondActions from './BondActions';
import {
  BillReferenceData,
  usePostBillReference,
} from 'hooks/bond/usePostBondReference';
import useBuyBond from 'hooks/bond/useBuyBond';
import { useUserZapSlippageTolerance } from 'state/user/hooks';
import { useSignTransaction } from 'state/transactions/hooks';
import { useZapCallback } from 'hooks/bond/useZapCallback';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { ZapType } from 'constants/index';
import { formatUnits } from 'ethers/lib/utils';
import { ChainId } from '@uniswap/sdk';
import UserBondModalView from './UserBondModalView';

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
  const { chainId, account, provider } = useActiveWeb3React();
  const [pendingTrx, setPendingTrx] = useState(false);
  const { recipient, typedValue } = useZapState();
  const { zap, zapRouteState } = useDerivedZapInfo();
  const { onCurrencySelection, onUserInput } = useZapActionHandlers();
  const [zapSlippage, setZapSlippage] = useUserZapSlippageTolerance();
  const { signTransaction } = useSignTransaction();
  const [bondId, setBondId] = useState('');
  const [txSubmitted, setTxSubmitted] = useState(false);
  const routerQuery = useParsedQueryString();
  const { mutate: postBillReference } = usePostBillReference();

  const maxPrice = BigNumber.from(bond.price ?? '0')
    .mul(102)
    .div(100);
  const { callback: zapCallback } = useZapCallback(
    zap,
    ZapType.ZAP_T_BILL,
    zapSlippage,
    recipient,
    bond.contractAddress[chainId] || '',
    maxPrice.toString(),
  );

  const originalSlippage = useMemo(() => {
    return zapSlippage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { onBuyBond } = useBuyBond(
    bond.contractAddress[chainId] ?? '',
    typedValue,
    bond.price ?? '',
    bond.lpToken?.decimals?.[chainId],
  );

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
  const available = BigNumber.from(bond?.maxTotalPayOut ?? '0')
    .sub(BigNumber.from(bond?.totalPayoutGiven ?? '0'))
    .div(BigNumber.from(10).pow(token3Obj?.decimals?.[chainId] ?? 18));
  const thresholdToShow =
    bond && bond.earnTokenPrice && bond.earnTokenPrice > 0
      ? 5 / bond.earnTokenPrice
      : 0;
  const safeAvailable = Number(available) - thresholdToShow;
  const singlePurchaseLimit = Number(
    BigNumber.from(bond?.maxPayoutTokens ?? 0).div(
      BigNumber.from(10).pow(token3Obj?.decimals?.[chainId] ?? 18),
    ),
  );
  const displayAvailable =
    singlePurchaseLimit > safeAvailable ? singlePurchaseLimit : safeAvailable;

  const consideredValue = currencyB
    ? typedValue
    : zap?.pairOut?.liquidityMinted?.toExact();
  const bondPrice = bond ? Number(formatUnits(bond.price ?? 0)) : 0;
  const bondValue = bondPrice > 0 ? Number(consideredValue) / bondPrice : 0;

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

  const searchForBillId = useCallback(
    (resp: ContractReceipt, billNftAddress: string) => {
      const { logs } = resp;
      const findBillNftLog = logs.find(
        (log: any) =>
          log.address.toLowerCase() === billNftAddress.toLowerCase(),
      );
      if (findBillNftLog) {
        const getBillNftIndex =
          findBillNftLog.topics[findBillNftLog.topics.length - 1];
        const convertHexId = parseInt(getBillNftIndex, 16);
        setBondId(convertHexId.toString());
      }
    },
    [setBondId],
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

  const {
    address: inputTokenAddress = '',
    decimals = 18,
    chainId: inputTokenChainId,
  } = inputCurrency ?? {};

  const bondContractAddress = bond?.contractAddress[chainId] || '';

  const isInputCurrencyPrincipal = !!(
    principalToken &&
    principalToken.isToken &&
    inputTokenAddress.toLowerCase() === principalToken.address.toLowerCase()
  );
  const zapVersion = isInputCurrencyPrincipal
    ? ZapVersion.ZapV1
    : lpTokenZapVersion;

  const { data: widoQuote } = useGetWidoQuote({
    inputTokenAddress: inputTokenAddress,
    inputTokenDecimals: decimals,
    toTokenAddress: bondContractAddress,
    zapVersion,
    fromChainId: inputTokenChainId as ChainId,
    toChainId: chainId,
  });

  const {
    data: widoNativeChainTokenQuote,
    isLoading: isWidoNativeChainTokenLoading,
  } = useGetWidoQuote({
    inputTokenAddress: NATIVE_TOKEN_ADDRESS,
    inputTokenDecimals: decimals,
    toTokenAddress: bondContractAddress,
    zapVersion: lpTokenZapVersion,
    fromChainId: inputTokenChainId as ChainId,
    toChainId: chainId,
  });

  const { isSupported: isWidoNativeChainTokenSupported = false } =
    widoNativeChainTokenQuote ?? {};
  const { to, data, value, isSupported: isWidoSupported = false } =
    widoQuote ?? {};

  const getIsZapCurrDropdownEnabled = (): boolean => {
    if (lpTokenZapVersion === ZapVersion.Wido) {
      return isWidoNativeChainTokenSupported;
    }
    return (
      bond?.billType !== 'reserve' && lpTokenZapVersion !== ZapVersion.External
    );
  };

  const rawPriceImpact = Number(zap?.totalPriceImpact?.toFixed(2) ?? '0') * 100;
  const priceImpact = useMemo(() => new Percent(rawPriceImpact, 10_000), [
    rawPriceImpact,
  ]);

  const getLPDisabled =
    (lpTokenZapVersion === ZapVersion.Wido && isWidoNativeChainTokenLoading) ||
    !account;
  const shouldSendToExternalLpUrl =
    lpTokenZapVersion === ZapVersion.External ||
    (lpTokenZapVersion === ZapVersion.Wido && !isWidoNativeChainTokenSupported);
  const sendToExternalLpUrl = () => {
    if (bond?.lpToken.getLpUrl?.[chainId]) {
      window.open(bond?.lpToken.getLpUrl?.[chainId], '_blank');
    } else {
      throw new Error('External lp url not found. Please contact support');
    }
  };
  const getLP = () => {
    if (shouldSendToExternalLpUrl) {
      return sendToExternalLpUrl();
    }
  };

  const billNftAddress =
    bond && bond.billNnftAddress ? bond.billNnftAddress[chainId] : undefined;

  const handleBuy = useCallback(async () => {
    if (!provider || !chainId || !billNftAddress || !account) return;
    setPendingTrx(true);
    if (zapVersion === ZapVersion.Wido && isWidoSupported) {
      signTransaction({
        dataToSign: { to, data, value },
        txInfo: { summary: 'Signing Wido buy Tx' },
      })
        .then((hash: any) => {
          setPendingTrx(true);
          setZapSlippage(originalSlippage);
          provider
            ?.waitForTransaction(hash)
            .then((receipt) => {
              const { logs } = receipt;
              const findBillNftLog = logs.find(
                (log) =>
                  log.address.toLowerCase() === billNftAddress.toLowerCase(),
              );
              const getBillNftIndex =
                findBillNftLog?.topics[findBillNftLog.topics.length - 1];
              const convertHexId = parseInt(getBillNftIndex ?? '', 16);
              setBondId(convertHexId.toString());
              const billsReference: Partial<BillReferenceData> = {
                chainId,
                transactionHash: hash,
                referenceId: routerQuery?.referenceId?.toString(),
                billContract: bond?.contractAddress?.[chainId],
              };
              postBillReference(billsReference);
            })
            .catch((e) => {
              console.error(e);
              setPendingTrx(false);
              setTxSubmitted(false);
            });
        })
        .catch((e: any) => {
          setZapSlippage(originalSlippage);
          console.error(e);
          setPendingTrx(false);
          setTxSubmitted(false);
        });
      return;
    }
    setTxSubmitted(true);
    if (zapVersion === ZapVersion.ZapV1 || isInputCurrencyPrincipal) {
      if (currencyB) {
        await onBuyBond()
          .then((resp: any) => {
            searchForBillId(resp, billNftAddress ?? '');
            const billsReference: Partial<BillReferenceData> = {
              chainId,
              transactionHash: resp?.transactionHash,
              referenceId: routerQuery?.referenceId?.toString(),
              billContract: bond?.contractAddress?.[chainId],
            };
            postBillReference(billsReference);
          })
          .catch((e: any) => {
            console.error(e);
            setPendingTrx(false);
            setTxSubmitted(false);
          });
      } else {
        await zapCallback()
          .then((hash: any) => {
            setPendingTrx(true);
            setZapSlippage(originalSlippage);
            const billsReference: Partial<BillReferenceData> = {
              chainId,
              transactionHash: hash,
              referenceId: routerQuery?.referenceId?.toString(),
              billContract: bond?.contractAddress?.[chainId],
            };
            postBillReference(billsReference);
            provider
              ?.waitForTransaction(hash)
              .then((receipt) => {
                const { logs } = receipt;
                const findBillNftLog = logs.find(
                  (log) =>
                    log.address.toLowerCase() === billNftAddress.toLowerCase(),
                );
                const getBillNftIndex =
                  findBillNftLog?.topics[findBillNftLog.topics.length - 1];
                const convertHexId = parseInt(getBillNftIndex ?? '', 16);
                setBondId(convertHexId.toString());
              })
              .catch((e) => {
                console.error(e);
                setPendingTrx(false);
                setTxSubmitted(false);
              });
          })
          .catch((e: any) => {
            setZapSlippage(originalSlippage);
            console.error(e);
            setPendingTrx(false);
            setTxSubmitted(false);
          });
      }
    }
  }, [
    provider,
    chainId,
    billNftAddress,
    account,
    zapVersion,
    isWidoSupported,
    isInputCurrencyPrincipal,
    signTransaction,
    to,
    data,
    value,
    setZapSlippage,
    originalSlippage,
    routerQuery?.referenceId,
    bond?.contractAddress,
    postBillReference,
    currencyB,
    onBuyBond,
    searchForBillId,
    zapCallback,
  ]);

  return (
    <CustomModal open={open} onClose={onClose} modalWrapper='bondModalWrapper'>
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
                  {stakeLP ? `/${token2Obj?.symbol}` : ''}
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
              <Box my='12px' className='flex justify-between'>
                <small>
                  {t('bondValue')} {formatNumber(bondValue)}{' '}
                  {bond?.earnToken?.symbol}
                </small>
                <small>
                  {t('maxPerBond')} {formatNumber(displayAvailable)}{' '}
                  {bond?.earnToken?.symbol}
                </small>
              </Box>
              <Box className='bondModalButtonsWrapper'>
                {stakeLP && (
                  <Box width='49%'>
                    <Button disabled={getLPDisabled} onClick={getLP}>
                      {t('getLP')}
                    </Button>
                  </Box>
                )}
                <Box width={stakeLP ? '49%' : '100%'}>
                  <BondActions
                    bond={bond}
                    zap={zap}
                    zapRouteState={zapRouteState}
                    handleBuy={handleBuy}
                    bondValue={bondValue}
                    value={typedValue}
                    purchaseLimit={displayAvailable.toString()}
                    balance={selectedCurrencyBalance?.toExact() ?? ''}
                    pendingTrx={pendingTrx}
                    errorMessage={
                      zapSlippage &&
                      zapSlippage.lessThan(priceImpact ?? '0') &&
                      !currencyB
                        ? 'Change Slippage'
                        : null
                    }
                    isWidoSupported={isWidoSupported}
                    widoQuote={widoQuote}
                    zapVersion={zapVersion}
                    inputTokenAddress={inputTokenAddress}
                    inputTokenDecimals={decimals}
                    toTokenAddress={bondContractAddress}
                    inputTokenChainId={inputTokenChainId as ChainId}
                    isInputCurrencyPrincipal={isInputCurrencyPrincipal}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}
    </CustomModal>
  );
};

export default BuyBondModal;
