import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AML_SCORE_THRESHOLD } from 'config';
import { ApprovalState, useApproveCallbackV3 } from 'hooks/useApproveCallback';
import { useAmlScore } from 'state/user/hooks';
import { useZapState } from 'state/zap/hooks';
import BigNumber from 'bignumber.js';
import { Bond, PurchasePath } from 'types/bond';
import { useCurrency } from 'hooks/v3/Tokens';
import { DEX } from '@soulsolidity/soulzap-v1';
import { useSoulZapQuote } from 'state/zap/soulZap/useSoulZapQuote';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useActiveWeb3React } from 'hooks';
import {
  BillReferenceData,
  usePostBillReference,
} from 'hooks/bond/usePostBondReference';
import { CurrencyAmount } from '@uniswap/sdk-core';
import { JSBI } from '@uniswap/sdk';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { Box, Button } from '@material-ui/core';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import WarningModal from '../WarningModal';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useSoulZap } from 'state/application/hooks';
import { getFixedValue, getLiquidityDEX } from 'utils';
import DisplayValues from '../DisplayValues';
import GetLPButton from '../GetLPButton';
import { useTranslation } from 'react-i18next';

const SoulZapPath = ({
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
  const history = useHistory();
  const { t } = useTranslation();
  const { chainId, account, provider } = useActiveWeb3React();
  const parsedQuery = useParsedQueryString();
  const { mutate: postBillReference } = usePostBillReference();
  const addTransaction = useTransactionAdder();

  const { isLoading: isAmlScoreLoading, score: amlScore } = useAmlScore();

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
  const bondContractAddress = bond?.contractAddress?.[chainId] ?? '';
  const liquidityDex = bond?.lpToken?.liquidityDex?.[chainId];

  // Zap logic
  const soulZap = useSoulZap();
  const { typedValue } = useZapState();
  const { loading, response: zapData } = useSoulZapQuote(
    bondContractAddress,
    getLiquidityDEX(liquidityDex) as DEX,
    true,
  );
  const consideredValue =
    zapData?.zapParams?.liquidityPath?.lpAmount.toString() ?? '0';

  // State
  const [pendingTx, setPendingTx] = useState(false);

  // Balance state
  const inputCurrency = useCurrency(inputTokenAddress);
  const inputCurrencyBalance = useCurrencyBalance(
    account,
    inputCurrency ?? undefined,
  );
  const notEnoughBalance =
    parseFloat(inputCurrencyBalance?.toExact() ?? '0') < parseFloat(typedValue);

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

  const soulZapCallback = useCallback(async () => {
    if (soulZap && zapData) {
      console.log('Attempting SoulZap tx');
      console.log(zapData);
      setPendingTx(true);
      onTransactionSubmitted && onTransactionSubmitted(true);
      return await soulZap
        //TODO: remove ts ignore once type is fixed
        //@ts-ignore
        .zapBond(zapData)
        .then((res) => {
          console.log('Successful tx');
          console.log(res);
          if (res.success) {
            addTransaction(
              undefined,
              {
                summary: t('zapBond'),
              },
              res.txHash,
            );
            const billsReference: Partial<BillReferenceData> = {
              chainId,
              transactionHash: res.txHash,
              referenceId: parsedQuery?.referenceId?.toString(),
              billContract: bondContractAddress ?? '',
            };
            postBillReference(billsReference);
            provider
              ?.waitForTransaction(res.txHash)
              .then((receipt) => {
                setPendingTx(false);
                const { logs } = receipt;
                const findBillNftLog = logs.find(
                  (log) =>
                    log.address.toLowerCase() ===
                    bondNftAddress[chainId]?.toLowerCase(),
                );
                const getBillNftIndex =
                  findBillNftLog?.topics[findBillNftLog.topics.length - 1];
                const convertHexId = parseInt(getBillNftIndex ?? '', 16);
                onBillId && onBillId(convertHexId.toString(), res.txHash);
              })
              .catch((e) => {
                setPendingTx(false);
                console.error(e);
                onTransactionSubmitted && onTransactionSubmitted(false);
              });
          } else {
            setPendingTx(false);
            console.log(res);
            onTransactionSubmitted && onTransactionSubmitted(false);
          }
        })
        .catch((e) => {
          setPendingTx(false);
          console.log(e);
          onTransactionSubmitted && onTransactionSubmitted(false);
        });
    }
  }, [
    soulZap,
    zapData,
    onTransactionSubmitted,
    addTransaction,
    t,
    chainId,
    parsedQuery?.referenceId,
    bondContractAddress,
    postBillReference,
    provider,
    onBillId,
    bondNftAddress,
  ]);

  // Approve logic
  const zapContractAddress = soulZap?.getZapContract().address;
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
    if (amlScore > AML_SCORE_THRESHOLD) {
      history.push('/forbidden');
      return;
    }

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
        {purchasePath === PurchasePath.Loading || !soulZap ? (
          <Button disabled>Loading</Button>
        ) : approvalState === ApprovalState.APPROVED ? (
          <Button
            onClick={handleValidationBeforeTx}
            disabled={
              pendingTx ||
              !typedValue ||
              parseFloat(typedValue) === 0 ||
              loading ||
              notEnoughBalance ||
              exceedsAvailable ||
              isAmlScoreLoading
            }
            fullWidth
          >
            {loading
              ? t('loading')
              : notEnoughBalance
              ? t('insufficientBalance', { symbol: inputCurrency?.symbol })
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

export default React.memo(SoulZapPath);
