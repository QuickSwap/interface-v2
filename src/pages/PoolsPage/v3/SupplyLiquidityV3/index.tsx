import React, { useCallback, useEffect, useState } from 'react';
import { useCurrency } from 'hooks/v3/Tokens';
import { useActiveWeb3React, useConnectWallet } from 'hooks';
import { useHistory, useParams } from 'react-router-dom';
import {
  useActivePreset,
  useV3DerivedMintInfo,
  useV3MintActionHandlers,
  useV3MintState,
} from 'state/mint/v3/hooks';
import { InitialPrice } from './containers/InitialPrice';
import { EnterAmounts } from './containers/EnterAmounts';
import { SelectPair } from './containers/SelectPair';
import { SelectRange } from './containers/SelectRange';

import { Currency } from '@uniswap/sdk-core';

import './index.scss';
import { WMATIC_EXTENDED } from 'constants/v3/addresses';
import {
  setInitialTokenPrice,
  setInitialUSDPrices,
  updateSelectedPreset,
} from 'state/mint/v3/actions';
import { Field } from 'state/mint/actions';
import {
  PriceFormats,
  PriceFormatToggler,
} from 'components/v3/PriceFomatToggler';
import { AddLiquidityButton } from './containers/AddLiquidityButton';
import { getGammaPairsForTokens, useIsSupportedNetwork } from 'utils';
import { useIsExpertMode } from 'state/user/hooks';
import { currencyId } from 'utils/v3/currencyId';
import { Box, Button, makeStyles } from '@material-ui/core';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { SettingsModal } from 'components';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import { useAppDispatch } from 'state/hooks';
import usePoolsRedirect from 'hooks/usePoolsRedirect';
import { CHAIN_INFO } from 'constants/v3/chains';
import { ChainId } from '@uniswap/sdk';
import { useTranslation } from 'react-i18next';
import { GlobalConst } from 'constants/index';
import SelectFeeTier from './containers/SelectFeeTier';
import { SelectDepositType } from 'pages/PoolsPage/v3/SupplyLiquidityV3/containers/SelectDepositType';
import { useSingleTokenVault } from 'state/singleToken/hooks';
import { SingleTokenSupplyLiquidity } from 'pages/PoolsPage/SingleToken/SupplyLiquidity';
import { getConfig } from 'config/index';

const useStyles = makeStyles(() => ({
  formControl: {
    '& .MuiInputBase-root': {
      width: '100%',
      borderColor: '#6EC177',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '100px',
      minWidth: '120px',
      justifyContent: 'center',
      backgroundColor: '#282d3d',
    },
    '& .MuiSelect-select.MuiSelect-select': {
      paddingRight: '0px',
    },
  },
  select: {
    width: '100%',
    fontSize: '12px',
    '&:focus': {
      backgroundColor: 'transparent',
    },
  },
  selectIcon: {
    position: 'relative',
    color: '#6a6c80',
    fontSize: '14px',
  },
  paper: {
    borderRadius: 12,
    marginTop: 8,
  },
  list: {
    paddingTop: 0,
    paddingBottom: 0,
    '& li': {
      fontWeight: 200,
      paddingTop: 8,
      paddingBottom: 8,
      fontSize: '12px',
    },
    '& li.Mui-selected': {
      color: 'white',
      background: '#282d3d',
    },
    '& li.Mui-selected:hover': {
      background: '#282d3da7',
    },
  },
}));

export function SupplyLiquidityV3() {
  const classes = useStyles();

  const { t } = useTranslation();
  const history = useHistory();
  const params: any = useParams();
  const parsedQuery = useParsedQueryString();
  const isSupportedNetwork = useIsSupportedNetwork();
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const chainInfo = CHAIN_INFO[chainIdToUse];
  const currencyIdAParam =
    params && params.currencyIdA
      ? params.currencyIdA.toLowerCase() === 'matic' ||
        params.currencyIdA.toLowerCase() === 'eth'
        ? chainInfo.nativeCurrencySymbol.toLowerCase()
        : params.currencyIdA
      : parsedQuery && parsedQuery.currency0
      ? (parsedQuery.currency0 as string).toLowerCase() === 'eth' ||
        (parsedQuery.currency0 as string).toLowerCase() === 'matic'
        ? chainInfo.nativeCurrencySymbol.toLowerCase()
        : (parsedQuery.currency0 as string)
      : undefined;
  const currencyIdBParam =
    params && params.currencyIdB
      ? params.currencyIdB.toLowerCase() === 'matic' ||
        params.currencyIdB.toLowerCase() === 'eth'
        ? chainInfo.nativeCurrencySymbol.toLowerCase()
        : params.currencyIdB
      : parsedQuery && parsedQuery.currency1
      ? (parsedQuery.currency1 as string).toLowerCase() === 'eth' ||
        (parsedQuery.currency1 as string).toLowerCase() === 'matic'
        ? chainInfo.nativeCurrencySymbol.toLowerCase()
        : (parsedQuery.currency1 as string)
      : undefined;

  const config = getConfig(chainId);
  const ichiAvailable = config?.['ichi']?.['available'];

  const [currencyIdA, setCurrencyIdA] = useState(currencyIdAParam);
  const [currencyIdB, setCurrencyIdB] = useState(currencyIdBParam);

  const { connectWallet } = useConnectWallet(isSupportedNetwork);

  const dispatch = useAppDispatch();

  const expertMode = useIsExpertMode();
  const [selectedDepositType, setSelectedDepositType] = useState('double');

  const [priceFormat, setPriceFormat] = useState(PriceFormats.TOKEN);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);

  useEffect(() => {
    onFieldAInput('');
    onFieldBInput('');
    onLeftRangeInput('');
    onRightRangeInput('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currencyIdA, currencyIdB]);
  // const depositToken = useSingleTokenCurrency();

  const baseCurrency = useCurrency(currencyIdA);
  const currencyB = useCurrency(currencyIdB);
  // prevent an error if they input ETH/WETH
  //TODO
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped)
      ? undefined
      : currencyB;

  const mintInfo = useV3DerivedMintInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    baseCurrency ?? undefined,
    undefined,
  );

  const { liquidityRangeType } = useV3MintState();
  const {
    onFieldAInput,
    onFieldBInput,
    onLeftRangeInput,
    onRightRangeInput,
    onStartPriceInput,
  } = useV3MintActionHandlers(mintInfo.noLiquidity);

  const resetState = useCallback(() => {
    dispatch(updateSelectedPreset({ preset: null }));
    dispatch(setInitialTokenPrice({ typedValue: '' }));
    dispatch(setInitialUSDPrices({ field: Field.CURRENCY_A, typedValue: '' }));
    dispatch(setInitialUSDPrices({ field: Field.CURRENCY_B, typedValue: '' }));
    onStartPriceInput('');
  }, [dispatch, onStartPriceInput]);

  const handleCurrencySelect = useCallback(
    (
      currencyNew: Currency,
      currencyIdOther?: string,
    ): (string | undefined)[] => {
      const currencyIdNew = currencyId(currencyNew, chainId || 137);

      let chainSymbol;

      if (chainId === ChainId.MATIC || chainId === ChainId.MUMBAI) {
        chainSymbol = 'MATIC';
      }
      if (
        chainId === ChainId.DOGECHAIN ||
        chainId === ChainId.DOEGCHAIN_TESTNET
      ) {
        chainSymbol = 'WDOGE';
      }
      if (chainId === ChainId.ZKTESTNET) {
        chainSymbol = 'ETH';
      }

      resetState();

      if (currencyIdNew.toLowerCase() === currencyIdOther?.toLowerCase()) {
        // not ideal, but for now clobber the other if the currency ids are equal
        return [currencyIdNew, undefined];
      } else {
        // prevent weth + eth
        const isETHOrWETHNew =
          currencyIdNew === chainSymbol ||
          (chainId !== undefined &&
            currencyIdNew === WMATIC_EXTENDED[chainId]?.address);
        const isETHOrWETHOther =
          currencyIdOther !== undefined &&
          (currencyIdOther === chainSymbol ||
            (chainId !== undefined &&
              currencyIdOther === WMATIC_EXTENDED[chainId]?.address));

        if (isETHOrWETHNew && isETHOrWETHOther) {
          return [currencyIdNew, undefined];
        } else {
          return [currencyIdNew, currencyIdOther];
        }
      }
    },
    [chainId, resetState],
  );

  const { redirectWithCurrency, redirectWithSwitch } = usePoolsRedirect();

  const handleCurrencyASelect = useCallback(
    (currencyANew: Currency) => {
      const isSwichRedirect = currencyANew.isNative
        ? currencyIdBParam === chainInfo.nativeCurrencySymbol.toLowerCase()
        : currencyIdBParam &&
          currencyANew &&
          currencyANew.address &&
          currencyANew.address.toLowerCase() === currencyIdBParam.toLowerCase();
      if (isSwichRedirect) {
        redirectWithSwitch(currencyANew, true, false);
      } else {
        redirectWithCurrency(currencyANew, true, false);
      }
    },
    [redirectWithCurrency, currencyIdBParam, chainInfo, redirectWithSwitch],
  );

  useEffect(() => {
    if (currencyIdAParam) {
      setCurrencyIdA(currencyIdAParam);
      if (baseCurrency) {
        handleCurrencySelect(baseCurrency);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currencyIdAParam]);

  const handleCurrencyBSelect = useCallback(
    (currencyBNew: Currency) => {
      const isSwichRedirect = currencyBNew.isNative
        ? currencyIdAParam === chainInfo.nativeCurrencySymbol.toLowerCase()
        : currencyIdAParam &&
          currencyBNew &&
          currencyBNew.address &&
          currencyBNew.address.toLowerCase() === currencyIdAParam.toLowerCase();
      if (isSwichRedirect) {
        redirectWithSwitch(currencyBNew, false, false);
      } else {
        redirectWithCurrency(currencyBNew, false, false);
      }
    },
    [redirectWithCurrency, currencyIdAParam, chainInfo, redirectWithSwitch],
  );
  const { selectedVault, selectVault } = useSingleTokenVault();

  useEffect(() => {
    if (currencyIdBParam) {
      setCurrencyIdB(currencyIdBParam);
      if (currencyB) {
        handleCurrencySelect(currencyB);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currencyIdBParam]);

  const handlePriceFormat = useCallback((priceFormat: PriceFormats) => {
    setPriceFormat(priceFormat);
  }, []);

  // hide token/usd toggler for now
  // const hidePriceFormatter = useMemo(() => {
  //   return true;

  //   // return Boolean(
  //   //   (mintInfo.noLiquidity ? stepInitialPrice : stepPair) &&
  //   //     !initialUSDPrices.CURRENCY_A &&
  //   //     !initialUSDPrices.CURRENCY_B &&
  //   //     !usdPriceA &&
  //   //     !usdPriceB,
  //   // );
  // }, [mintInfo, usdPriceA, usdPriceB, initialUSDPrices]);
  const hidePriceFormatter = true;

  useEffect(() => {
    if (hidePriceFormatter) {
      handlePriceFormat(PriceFormats.TOKEN);
      setPriceFormat(PriceFormats.TOKEN);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidePriceFormatter]);

  const preset = useActivePreset();
  const gammaPairData = getGammaPairsForTokens(
    chainId,
    baseCurrency?.wrapped.address,
    currencyB?.wrapped.address,
    mintInfo.feeAmount,
  );
  const gammaPairs = gammaPairData?.pairs;
  const gammaPair =
    gammaPairs && gammaPairs.length > 0
      ? gammaPairs.find((pair) => pair.type === preset)
      : undefined;

  const { redirectWithCurrencySingleToken } = usePoolsRedirect();

  const handleCurrencySelectSingle = useCallback(
    (currencyNew: Currency) => {
      redirectWithCurrencySingleToken(currencyNew);
      selectVault(undefined);
    },
    [redirectWithCurrencySingleToken, selectVault],
  );
  return (
    <Box>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
          defaultSlippage={50}
        />
      )}
      <Box className='flex justify-between items-center'>
        <p className='weight-600'>{t('supplyLiquidity')}</p>
        <Box className='flex items-center'>
          <small
            className='cursor-pointer text-primary'
            onClick={() => {
              setCurrencyIdA('');
              setCurrencyIdB('');
              resetState();
              onFieldAInput('');
              onFieldBInput('');
              history.push('/pools');
            }}
          >
            {t('clearAll')}
          </small>
          {!hidePriceFormatter && (
            <Box className='flex' ml={1}>
              <PriceFormatToggler
                currentFormat={priceFormat}
                handlePriceFormat={handlePriceFormat}
              />
            </Box>
          )}
          <Box className='flex cursor-pointer'>
            <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
          </Box>
        </Box>
      </Box>
      <Box mt={2}>
        {ichiAvailable && (
          <SelectDepositType
            selectedDepositType={selectedDepositType}
            setSelectedDepositType={setSelectedDepositType}
            baseCurrency={baseCurrency}
            quoteCurrency={quoteCurrency}
            mintInfo={mintInfo}
            handleCurrencyASelect={handleCurrencyASelect}
            handleCurrencyBSelect={handleCurrencyBSelect}
            handlePopularPairSelection={resetState}
            priceFormat={priceFormat}
          />
        )}
        {(!account || !isSupportedNetwork) && (
          <Button
            className='v3-supply-liquidity-button'
            onClick={connectWallet}
          >
            {account ? t('switchNetwork') : t('connectWallet')}
          </Button>
        )}
      </Box>
      {selectedDepositType === 'single' && <SingleTokenSupplyLiquidity />}
      {selectedDepositType === 'double' && (
        <Box>
          {account && isSupportedNetwork && (
            <SelectPair
              selectedDepositType={selectedDepositType}
              setSelectedDepositType={setSelectedDepositType}
              baseCurrency={baseCurrency}
              quoteCurrency={quoteCurrency}
              mintInfo={mintInfo}
              handleCurrencyASelect={handleCurrencyASelect}
              handleCurrencyBSelect={handleCurrencyBSelect}
              handlePopularPairSelection={resetState}
              priceFormat={priceFormat}
            />
          )}
          <Box mt={4} position='relative'>
            {(!baseCurrency ||
              !quoteCurrency ||
              !account ||
              !isSupportedNetwork) && (
              <Box className='v3-supply-liquidity-overlay' />
            )}
            {mintInfo.noLiquidity &&
              baseCurrency &&
              quoteCurrency &&
              liquidityRangeType ===
                GlobalConst.v3LiquidityRangeType.MANUAL_RANGE && (
                <Box mb={2}>
                  <InitialPrice
                    currencyA={baseCurrency ?? undefined}
                    currencyB={currencyB ?? undefined}
                    mintInfo={mintInfo}
                    priceFormat={priceFormat}
                  />
                </Box>
              )}
            <SelectFeeTier mintInfo={mintInfo} />
            <SelectRange
              currencyA={baseCurrency}
              currencyB={quoteCurrency}
              mintInfo={mintInfo}
              priceFormat={priceFormat}
            />
            <Box mt={4} position='relative'>
              <small className='weight-600'>{t('depositAmounts')}</small>
              {gammaPair?.withdrawOnly && (
                <Box className='v3-deposit-disable-banner'>
                  <p>{t('withdrawOnlyVault')}</p>
                </Box>
              )}
              <Box my={2}>
                <EnterAmounts
                  currencyA={baseCurrency ?? undefined}
                  currencyB={currencyB ?? undefined}
                  mintInfo={mintInfo}
                  priceFormat={priceFormat}
                />
              </Box>
              <AddLiquidityButton
                baseCurrency={baseCurrency ?? undefined}
                quoteCurrency={quoteCurrency ?? undefined}
                mintInfo={mintInfo}
                handleAddLiquidity={() => {
                  resetState();
                  onFieldAInput('');
                  onFieldBInput('');
                }}
                title={expertMode ? t('addLiquidity') : t('preview')}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
