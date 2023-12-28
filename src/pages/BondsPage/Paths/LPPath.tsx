import React, { useCallback, useState } from 'react';
import { ApprovalState, useApproveCallbackV3 } from 'hooks/useApproveCallback';
import { useZapState } from 'state/zap/hooks';
import { PurchasePath } from 'types/bond';
import { CEX_BILL_ADDRESS } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import useBuyBond from 'hooks/bond/useBuyBond';
import { Box, Button } from '@material-ui/core';
import { getFixedValue, searchForBillId } from 'utils';
import useParsedQueryString from 'hooks/useParsedQueryString';
import {
  BillReferenceData,
  usePostBillReference,
} from 'hooks/bond/usePostBondReference';
import WarningModal from '../WarningModal';
import BondTypeWarningModal from '../BondTypeWarningModal';
import { CurrencyAmount } from '@uniswap/sdk-core';
import { useCurrency } from 'hooks/v3/Tokens';
import { JSBI } from '@uniswap/sdk';
import { parseUnits } from 'ethers/lib/utils';
import DisplayValues from '../DisplayValues';
import GetLPButton from '../GetLPButton';
import { useTranslation } from 'react-i18next';

const LpPath = ({
  purchasePath,
  onBillId,
  bond,
  inputTokenAddress,
  onTransactionSubmitted,
}: {
  purchasePath: PurchasePath;
  onBillId: ((billId: string) => void) | undefined;
  bond: any;
  inputTokenAddress: string;
  onTransactionSubmitted?: (value: boolean) => void;
}) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const { typedValue } = useZapState();
  const routerQuery = useParsedQueryString();
  const { mutate: postBillReference } = usePostBillReference();

  // Bond Data
  const bondContractAddress = bond?.contractAddress?.[chainId];
  const bondNftAddress = bond?.billNnftAddress;

  // Loading state for both approve and purchase functions
  const [pendingTx, setPendingTx] = useState(false);

  // Approve logic
  const currency = useCurrency(inputTokenAddress);
  const parsedAmount = currency
    ? CurrencyAmount.fromRawAmount(
        currency,
        JSBI.BigInt(
          parseUnits(
            getFixedValue(typedValue, currency?.decimals),
            currency?.decimals,
          ),
        ),
      )
    : undefined;
  const [approvalState, approveCallback] = useApproveCallbackV3(
    parsedAmount,
    bondContractAddress,
  );
  const handleApprove = () => {
    setPendingTx(true);
    approveCallback()
      .then(() => setPendingTx(false))
      .catch(() => setPendingTx(false));
  };

  // Purchase logic
  const { onBuyBond } = useBuyBond(
    bond.contractAddress[chainId] ?? '',
    typedValue,
    bond.price ?? '',
    bond.lpToken?.decimals?.[chainId],
  );

  const handleBuy = useCallback(async () => {
    console.log('LP purchase');
    setPendingTx(true);
    onTransactionSubmitted && onTransactionSubmitted(true);
    await onBuyBond()
      .then((resp: any) => {
        searchForBillId(resp, bondNftAddress, onBillId);
        const billsReference: Partial<BillReferenceData> = {
          chainId,
          transactionHash: resp?.transactionHash,
          referenceId: routerQuery?.referenceId?.toString(),
          billContract: bondContractAddress,
        };
        postBillReference(billsReference);
        setPendingTx(false);
        onTransactionSubmitted && onTransactionSubmitted(false);
      })
      .catch((e) => {
        console.error(e);
        setPendingTx(false);
        onTransactionSubmitted && onTransactionSubmitted(false);
      });
  }, [
    onTransactionSubmitted,
    onBuyBond,
    bondNftAddress,
    onBillId,
    chainId,
    routerQuery?.referenceId,
    bondContractAddress,
    postBillReference,
  ]);

  const [openBuyWarning, setOpenBuyWarning] = useState(false);
  const [openBondTypeWarning, setOpenBondTypeWarning] = useState(false);

  const handleValidationBeforeTx = () => {
    if (bond?.contractAddress[chainId] === CEX_BILL_ADDRESS) {
      setOpenBondTypeWarning(true);
    } else if (parseFloat(bond?.discount as string) < 0) {
      setOpenBuyWarning(true);
    } else handleBuy();
  };

  return (
    <Box>
      {openBuyWarning && (
        <WarningModal
          open={openBuyWarning}
          onDismiss={() => setOpenBuyWarning(false)}
          bond={bond}
          handlePurchase={handleBuy}
        />
      )}
      {openBondTypeWarning && (
        <BondTypeWarningModal
          open={openBondTypeWarning}
          onDismiss={() => setOpenBondTypeWarning(false)}
          handlePurchase={handleBuy}
        />
      )}
      <DisplayValues bond={bond} consideredValue={Number(typedValue)} />
      <Box className='bondModalButtonsWrapper' gridGap={8}>
        <GetLPButton bond={bond} />
        {purchasePath === PurchasePath.Loading ? (
          <Button disabled>Loading</Button>
        ) : approvalState === ApprovalState.APPROVED ? (
          <Button
            onClick={handleValidationBeforeTx}
            disabled={pendingTx || !typedValue || parseFloat(typedValue) === 0}
            fullWidth
          >
            {t('buy')}
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

export default React.memo(LpPath);
