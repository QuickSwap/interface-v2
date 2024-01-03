import React, { useCallback, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { ApprovalState, useApproveCallbackV3 } from 'hooks/useApproveCallback';
import { useDerivedZapInfo, useZapState } from 'state/zap/hooks';
import { ZapType } from '@ape.swap/sdk';
import BigNumber from 'bignumber.js';
import { useZapCallback } from 'hooks/bond/useZapCallback';
import { useUserZapSlippageTolerance } from 'state/user/hooks';
import { useActiveWeb3React } from 'hooks';
import { ZAP_ADDRESS } from 'constants/v3/addresses';
import {
  BillReferenceData,
  usePostBillReference,
} from 'hooks/bond/usePostBondReference';
import { useCurrency } from 'hooks/v3/Tokens';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { PurchasePath } from 'types/bond';
import { JSBI } from '@uniswap/sdk';
import { CurrencyAmount } from '@uniswap/sdk-core';
import { parseUnits } from 'ethers/lib/utils';
import { V3TradeState } from 'hooks/v3/useBestV3Trade';
import useParsedQueryString from 'hooks/useParsedQueryString';
import WarningModal from '../WarningModal';
import DisplayValues from '../DisplayValues';
import GetLPButton from '../GetLPButton';
import { useTranslation } from 'react-i18next';
import { getFixedValue } from 'utils';

const ApeZapPath = ({
  purchasePath,
  onBillId,
  bond,
  inputTokenAddress,
  onTransactionSubmitted,
}: {
  purchasePath: PurchasePath;
  onBillId: ((billId: string, transactionHash: string) => void) | undefined;
  bond: any;
  inputTokenAddress: string;
  onTransactionSubmitted?: (value: boolean) => void;
}) => {
  const { t } = useTranslation();
  const { recipient, typedValue } = useZapState();
  const { chainId, provider, account } = useActiveWeb3React();

  // Bond Data
  const {
    billNnftAddress: bondNftAddress,
    earnTokenPrice,
    maxTotalPayOut,
    totalPayoutGiven,
    earnToken,
    maxPayoutTokens,
    price,
  } = bond ?? {};
  const bondContractAddress = bond?.contractAddress?.[chainId];

  // Loading state for both approve and purchase functions
  const [pendingTx, setPendingTx] = useState(false);

  // Balance state
  const inputCurrency = useCurrency(inputTokenAddress);
  const inputCurrencyBalance = useCurrencyBalance(
    account,
    inputCurrency ?? undefined,
  );
  const notEnoughBalance =
    parseFloat(inputCurrencyBalance?.toExact() ?? '0') < parseFloat(typedValue);

  // Approve logic
  const zapContractAddress = chainId ? ZAP_ADDRESS[chainId] : undefined;
  const parsedAmount = inputCurrency
    ? CurrencyAmount.fromRawAmount(
        inputCurrency,
        JSBI.BigInt(
          parseUnits(
            getFixedValue(typedValue, inputCurrency?.decimals),
            inputCurrency?.decimals,
          ),
        ),
      )
    : undefined;
  const [approvalState, approveCallback] = useApproveCallbackV3(
    parsedAmount,
    zapContractAddress,
  );

  const handleApprove = () => {
    setPendingTx(true);
    approveCallback()
      .then(() => setPendingTx(false))
      .catch(() => setPendingTx(false));
  };

  // Zap logic
  const { zap, zapRouteState } = useDerivedZapInfo();
  const consideredValue = Number(
    zap?.pairOut?.liquidityMinted?.toExact() ?? '0',
  );
  const [zapSlippage] = useUserZapSlippageTolerance();
  const maxPrice = new BigNumber(bond?.price ?? 0)
    .times(102)
    .div(100)
    .toFixed(0);
  const parsedQuery = useParsedQueryString();
  const { mutate: postBillReference } = usePostBillReference();
  const { callback: zapCallback } = useZapCallback(
    zap,
    ZapType.ZAP_T_BILL,
    zapSlippage,
    recipient,
    bondContractAddress || '',
    maxPrice,
  );

  const handleApeZap = useCallback(async () => {
    console.log('Attempting ApeSwap zap');
    setPendingTx(true);
    onTransactionSubmitted && onTransactionSubmitted(true);
    await zapCallback()
      .then((hash: any) => {
        const billsReference: Partial<BillReferenceData> = {
          chainId,
          transactionHash: hash,
          referenceId: parsedQuery?.referenceId?.toString(),
          billContract: bondContractAddress ?? '',
        };
        postBillReference(billsReference);
        provider
          ?.waitForTransaction(hash)
          .then((receipt) => {
            setPendingTx(false);
            const { logs } = receipt;
            const findBillNftLog = logs.find(
              (log) =>
                log.address.toLowerCase() === bondNftAddress?.toLowerCase(),
            );
            const getBillNftIndex =
              findBillNftLog?.topics[findBillNftLog.topics.length - 1];
            const convertHexId = parseInt(getBillNftIndex ?? '', 16);
            onBillId && onBillId(convertHexId.toString(), hash);
          })
          .catch((e) => {
            setPendingTx(false);
            console.error(e);
            onTransactionSubmitted && onTransactionSubmitted(false);
          });
      })
      .catch((e: any) => {
        console.error(e);
        setPendingTx(false);
        onTransactionSubmitted && onTransactionSubmitted(false);
      });
  }, [
    bondContractAddress,
    bondNftAddress,
    chainId,
    parsedQuery?.referenceId,
    onBillId,
    onTransactionSubmitted,
    postBillReference,
    provider,
    zapCallback,
  ]);

  // Max per bond value
  const billValue = Number(price) > 0 ? consideredValue / Number(price) : 0;
  const available = new BigNumber(maxTotalPayOut ?? 0)
    ?.minus(new BigNumber(totalPayoutGiven ?? 0))
    ?.div(new BigNumber(10).pow(earnToken?.decimals?.[chainId] ?? 18));
  const threshold = 5;
  const BNThreshold = new BigNumber(threshold).div(earnTokenPrice ?? 0);
  const safeAvailable = available.minus(BNThreshold);
  const singlePurchaseLimit = new BigNumber(maxPayoutTokens ?? 0).div(
    new BigNumber(10).pow(earnToken?.decimals?.[chainId] ?? 18),
  );
  const displayAvailable = singlePurchaseLimit.lt(safeAvailable)
    ? singlePurchaseLimit
    : safeAvailable;
  const exceedsAvailable = displayAvailable.toNumber() < billValue;

  const [openBuyWarning, setOpenBuyWarning] = useState(false);

  const handleValidationBeforeTx = () => {
    if (parseFloat(bond?.discount as string) < 0) {
      setOpenBuyWarning(true);
    } else handleApeZap();
  };

  return (
    <Box>
      {openBuyWarning && (
        <WarningModal
          bond={bond}
          open={openBuyWarning}
          onDismiss={() => setOpenBuyWarning(false)}
          handlePurchase={handleApeZap}
        />
      )}
      <DisplayValues bond={bond} consideredValue={consideredValue} />
      <Box className='bondModalButtonsWrapper' gridGap={8}>
        <GetLPButton bond={bond} />
        {purchasePath === PurchasePath.Loading ? (
          <Button disabled>{t('loading')}</Button>
        ) : approvalState === ApprovalState.APPROVED ? (
          <Button
            onClick={handleValidationBeforeTx}
            disabled={
              pendingTx ||
              !typedValue ||
              parseFloat(typedValue) === 0 ||
              zapRouteState === V3TradeState.LOADING ||
              zapRouteState === V3TradeState.NO_ROUTE_FOUND ||
              notEnoughBalance ||
              exceedsAvailable
            }
            fullWidth
          >
            {zapRouteState === V3TradeState.LOADING
              ? t('loading')
              : zapRouteState === V3TradeState.NO_ROUTE_FOUND
              ? t('noRouteFound')
              : notEnoughBalance
              ? t('insufficientBalance', { symbol: inputCurrency?.symbol })
              : exceedsAvailable
              ? t('exceedLimit')
              : t('buy')}
          </Button>
        ) : (
          <Button
            onClick={handleApprove}
            // load={approvalState === ApprovalState.PENDING || pendingTx}
            disabled={
              approvalState === ApprovalState.PENDING ||
              pendingTx ||
              !typedValue ||
              parseFloat(typedValue) === 0
            }
            fullWidth
          >
            {pendingTx || approvalState === ApprovalState.PENDING
              ? t('enabling')
              : t('enable')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(ApeZapPath);
