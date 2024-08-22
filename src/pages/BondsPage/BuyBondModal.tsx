import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import {
  CurrencyLogo,
  CustomModal,
  TokenSelectorPanelForBonds,
} from 'components';
import BillImage from 'assets/images/bonds/quickBond.jpg';
import BondTokenDisplay from './BondTokenDisplay';
import { useTranslation } from 'react-i18next';
import { formatNumber } from 'utils';
import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { useActiveWeb3React } from 'hooks';
import { useZapActionHandlers, useZapState } from 'state/zap/hooks';
import { Field } from 'state/zap/actions';
import { useCurrency } from 'hooks/v3/Tokens';
import { Bond, PurchasePath } from 'types/bond';
import {
  LiquidityDex,
  dexToZapMapping,
  ZapVersion,
} from '@ape.swap/apeswap-lists';
import BondActions from './BondActions';
import UserBondModalView from './UserBondModalView';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';

interface BuyBondModalProps {
  open: boolean;
  onClose: () => void;
  bond: Bond;
}

const BuyBondModal: React.FC<BuyBondModalProps> = ({ bond, open, onClose }) => {
  // const token1Obj = bond.token;
  // const token2Obj =
  //   bond.billType === 'reserve' ? bond.earnToken : bond.quoteToken;
  // const token3Obj = bond.earnToken;
  // const stakeLP = bond.billType !== 'reserve';
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const { typedValue } = useZapState();
  const { onUserInput } = useZapActionHandlers();
  const [bondId, setBondId] = useState('');
  const [txSubmitted, setTxSubmitted] = useState(false);
  const [inputTokenAddress, setInputTokenAddress] = useState<string>(
    bond?.lpToken.address[chainId] ?? '',
  );

  const { price: inputPrice } = useUSDCPriceFromAddress(inputTokenAddress);
  const inputTokenPrice = useMemo(() => {
    if (inputTokenAddress === bond.lpToken.address[chainId])
      return bond.lpPrice;
    return inputPrice;
  }, [bond, chainId, inputPrice, inputTokenAddress]);

  const inputCurrency = useCurrency(inputTokenAddress);
  const billCurrencyLoaded = !!bond.lpToken.address[chainId];

  useEffect(() => {
    setInputTokenAddress(bond.lpToken.address[chainId] ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billCurrencyLoaded]);

  const discountEarnTokenPrice =
    bond && bond?.earnTokenPrice
      ? bond?.earnTokenPrice -
        bond?.earnTokenPrice * ((bond?.discount ?? 0) / 100)
      : 0;

  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    inputCurrency ?? undefined,
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

  const liquidityDex =
    bond?.lpToken.liquidityDex?.[chainId] || LiquidityDex.ApeSwapV2;
  const dexToZapMappingAny = dexToZapMapping as any;
  const zapVersion =
    liquidityDex && dexToZapMappingAny?.[liquidityDex]?.[chainId];

  const getIsZapCurrDropdownEnabled = (): boolean => {
    return (
      bond.billType !== 'reserve' &&
      zapVersion !== ZapVersion.External &&
      !!zapVersion
    );
  };

  const pathSelector = (): PurchasePath => {
    switch (true) {
      case inputTokenAddress.toLowerCase() ===
        bond.lpToken.address[chainId]?.toLowerCase():
        return PurchasePath.LpPurchase;
      case zapVersion === ZapVersion.SoulZap:
        return PurchasePath.SoulZap;
      case zapVersion === ZapVersion.SoulZapApi:
        return PurchasePath.SoulZapApi;
      default:
        return PurchasePath.Loading;
    }
  };

  const tokenToDisplay = useCurrency(
    bond.showcaseToken?.address[chainId] ?? bond.earnToken.address[chainId],
  );

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
            <Box mt={2}>
              <Box className='flex items-center' gridGap={6}>
                <Box className='flex items-center'>
                  <CurrencyLogo
                    currency={tokenToDisplay ?? undefined}
                    size='50px'
                  />
                  <Box className='flex' mx='12px'>
                    <h4 className='weight-600 text-gray32'>
                      {bond.earnToken.symbol}
                    </h4>
                  </Box>
                </Box>
                <Box>
                  <small className='text-secondary'>
                    <span style={{ textDecoration: 'line-through' }}>
                      ${formatNumber(bond?.earnTokenPrice ?? 0)}
                    </span>
                  </small>
                  <h6 className='font-bold text-white'>
                    ${formatNumber(discountEarnTokenPrice)} (
                    {formatNumber(bond?.discount ?? 0)}% {t('discount')})
                  </h6>
                </Box>
              </Box>

              {bond.shortDescription && (
                <Box mt={2}>
                  <div
                    className='p'
                    dangerouslySetInnerHTML={{ __html: bond.shortDescription }}
                  />
                </Box>
              )}

              {bond.lpToken && (
                <Box mt={2}>
                  <TokenSelectorPanelForBonds
                    inputAmount={typedValue}
                    setInputAmount={onHandleValueChange}
                    handleSetMaxBalance={handleMaxInput}
                    bondPrincipalToken={bond.lpToken}
                    inputTokenAddress={inputTokenAddress}
                    setInputTokenAddress={setInputTokenAddress}
                    chainId={chainId}
                    enableZap={getIsZapCurrDropdownEnabled()}
                    inputTokenPrice={inputTokenPrice}
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
