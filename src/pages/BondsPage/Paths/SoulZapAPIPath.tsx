import React, { useCallback, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { ApprovalState, useApproveCallbackV3 } from 'hooks/useApproveCallback';
import { useZapState } from 'state/zap/hooks';
import {
  BillReferenceData,
  usePostBillReference,
} from 'hooks/bond/usePostBondReference';
import { Bond, PurchasePath } from 'types/bond';
import { useCurrency } from 'hooks/v3/Tokens';
import { useTransactionAdder } from 'state/transactions/hooks';
import useDebounce from 'hooks/useDebounce';
import { ChainId } from '@ape.swap/sdk';
import { useSoulZapBondApiQuote } from 'state/zap/soulZapApi/useSoulZapApiBondQuote';
import { SoulZapTokenManager } from 'constants/v3/addresses';
import GetLPButton from '../GetLPButton';
import { useActiveWeb3React } from 'hooks';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { CurrencyAmount } from '@uniswap/sdk-core';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { JSBI } from '@uniswap/sdk';
import { calculateGasMargin, getFixedValue } from 'utils';
import BigNumber from 'bignumber.js';
import WarningModal from '../WarningModal';
import DisplayValues from '../DisplayValues';
import { useTranslation } from 'react-i18next';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { TransactionType } from 'models/enums';

const SoulZapApiPath = ({
  purchasePath,
  bond,
  inputTokenAddress,
  onBillId,
  onTransactionSubmitted,
}: {
  purchasePath: PurchasePath;
  onBillId: ((billId: string, transactionHash: string) => void) | undefined;
  bond: Bond;
  inputTokenAddress: string;
  onTransactionSubmitted?: (value: boolean) => void;
}) => {
  // Hooks
  const { t } = useTranslation();
  const { account, provider, chainId } = useActiveWeb3React();
  const parsedQuery = useParsedQueryString();
  const { mutate: postBillReference } = usePostBillReference();
  const addTransaction = useTransactionAdder();

  // Bond Data
  const {
    earnTokenPrice,
    maxTotalPayOut,
    totalPayoutGiven,
    earnToken,
    maxPayoutTokens,
    price,
  } = bond ?? {};

  // State
  const [pendingTx, setPendingTx] = useState(false);

  // Zap logic
  const { typedValue } = useZapState();
  const inputAmount = useDebounce(typedValue, 300);

  const {
    loading,
    response: zapData,
    estimateOutput: consideredValue,
  } = useSoulZapBondApiQuote(inputAmount, inputTokenAddress, bond);

  // Balance state
  const inputCurrency = useCurrency(inputTokenAddress);
  const inputCurrencyBalance = useCurrencyBalance(
    account,
    inputCurrency ?? undefined,
  );
  const notEnoughBalance =
    parseFloat(inputCurrencyBalance?.toExact() ?? '0') <
    parseFloat(inputAmount);

  const parsedAmount = inputCurrency
    ? CurrencyAmount.fromRawAmount(
        inputCurrency,
        JSBI.BigInt(
          parseUnits(
            getFixedValue(inputAmount, inputCurrency?.decimals),
            inputCurrency?.decimals,
          ),
        ),
      )
    : undefined;

  const signer = provider?.getSigner();
  const bigishInputAmount = JSBI.BigInt(
    parseUnits(
      getFixedValue(inputAmount, inputCurrency?.decimals),
      inputCurrency?.decimals,
    ),
  ).toString();

  const soulZapCallback = useCallback(async () => {
    if (signer && zapData && zapData?.txData?.to && zapData?.txData?.data) {
      console.log('Attempting zap tx');
      try {
        setPendingTx(true);
        onTransactionSubmitted && onTransactionSubmitted(true);
        const gas = await signer.estimateGas({
          to: zapData.txData.to,
          data: zapData.txData.data,
          value: inputCurrency?.isNative ? bigishInputAmount : undefined,
        });
        const gasToUse = calculateGasMargin(gas);
        console.log(gasToUse);
        if (gasToUse)
          await signer
            .sendTransaction({
              to: zapData.txData.to,
              data: zapData.txData.data,
              value: inputCurrency?.isNative ? bigishInputAmount : undefined,
              gasLimit: gasToUse,
            })
            .then((res) => {
              addTransaction(
                undefined,
                {
                  summary: t('zapBond'),
                  type: TransactionType.ZAP,
                },
                res.hash,
              );
              const billsReference: Partial<BillReferenceData> = {
                chainId,
                transactionHash: res.hash,
                referenceId: parsedQuery?.referenceId?.toString(),
                billContract: bond?.contractAddress[bond?.chainId] ?? '',
              };
              postBillReference(billsReference);
              provider
                ?.waitForTransaction(res.hash)
                .then((receipt) => {
                  setPendingTx(false);
                  const { logs } = receipt;
                  const findBillNftLog = logs.find(
                    (log) =>
                      log.address.toLowerCase() ===
                      bond?.billNnftAddress?.[bond.chainId]?.toLowerCase(),
                  );
                  const getBillNftIndex =
                    findBillNftLog?.topics[findBillNftLog.topics.length - 1];
                  const convertHexId = parseInt(getBillNftIndex ?? '', 16);
                  onBillId && onBillId(convertHexId.toString(), res.hash);
                })
                .catch((e) => {
                  setPendingTx(false);
                  console.error(e);
                  onTransactionSubmitted && onTransactionSubmitted(false);
                });
            });
      } catch (e) {
        console.log(e);
        setPendingTx(false);
        onTransactionSubmitted && onTransactionSubmitted(false);
      }
    }
  }, [
    signer,
    zapData,
    onTransactionSubmitted,
    inputCurrency?.isNative,
    bigishInputAmount,
    addTransaction,
    t,
    chainId,
    parsedQuery?.referenceId,
    bond?.contractAddress,
    bond.chainId,
    bond?.billNnftAddress,
    postBillReference,
    provider,
    onBillId,
  ]);

  // Approve logic
  const zapContractAddress = SoulZapTokenManager[chainId];
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

  // Max per bond value
  const bigValue = Number(
    formatUnits(consideredValue, bond?.earnToken?.decimals?.[chainId] ?? 18),
  );
  const billValue = Number(price ?? 0) > 0 ? bigValue / Number(price ?? 0) : 0;
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
    if ((bond?.discount ?? 0) < 0) {
      setOpenBuyWarning(true);
    } else soulZapCallback();
  };

  return (
    <Box>
      {openBuyWarning && (
        <WarningModal
          bond={bond}
          open={openBuyWarning}
          handlePurchase={soulZapCallback}
          onDismiss={() => setOpenBuyWarning(false)}
        />
      )}
      <DisplayValues bond={bond} consideredValue={bigValue} />
      <Box className='bondModalButtonsWrapper' gridGap={8}>
        <GetLPButton bond={bond} />
        {purchasePath === PurchasePath.Loading ? (
          <Button disabled>{t('loading')}</Button>
        ) : approvalState === ApprovalState.APPROVED ? (
          <Button
            onClick={handleValidationBeforeTx}
            disabled={
              pendingTx ||
              loading ||
              !inputAmount ||
              parseFloat(inputAmount) === 0 ||
              loading ||
              notEnoughBalance ||
              exceedsAvailable ||
              !(parseFloat(consideredValue) > 0)
            }
            fullWidth
          >
            {loading
              ? t('loading')
              : notEnoughBalance
              ? t('notEnoughBalance')
              : exceedsAvailable
              ? t('exceedLimit')
              : t('buy')}
          </Button>
        ) : (
          <Button
            onClick={handleApprove}
            disabled={
              approvalState === ApprovalState.PENDING ||
              pendingTx ||
              !inputAmount ||
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

export default React.memo(SoulZapApiPath);
