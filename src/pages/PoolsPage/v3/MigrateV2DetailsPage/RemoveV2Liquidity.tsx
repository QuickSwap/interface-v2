import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { BigNumber } from '@ethersproject/bignumber';
import { V2_ROUTER_ADDRESS } from 'constants/v3/addresses';
import { useRouterContract } from 'hooks/useContract';
import { useDerivedBurnInfo } from 'state/burn/hooks';
import { useTranslation } from 'react-i18next';
import { useApproveCallback } from 'hooks/useV3ApproveCallback';
import { Pair } from '@uniswap/sdk-core';

const RemoveV2Liquidity: React.FC<{ pair: Pair | null }> = ({ pair }) => {
  const { t } = useTranslation();
  const [approvingRemoval, setApprovingRemoval] = useState(false);
  const [approvalRemove, approveRemovalCallback] = useApproveCallback(
    userPoolBalance,
    chainId ? V2_ROUTER_ADDRESS[chainId] : undefined,
  );
  const [removingV2Liquidity, setRemovingV2Liquidity] = useState(false);
  const [v2LiquidityRemoved, setV2LiquidityRemoved] = useState(false);
  const router = useRouterContract();
  const { parsedAmounts } = useDerivedBurnInfo(currency0, currency1);
  console.log('ccc', parsedAmounts);

  const approveV2Removal = async () => {
    setApprovingRemoval(true);
    try {
      await approveRemovalCallback();
      setApprovingRemoval(false);
    } catch (e) {
      setApprovingRemoval(false);
    }
  };

  const removeV2Liquidity = async () => {
    // if (!chainId || !library || !account || !deadline || !router) {
    //   setRemoveErrorMessage(t('missingdependencies'));
    //   throw new Error(t('missingdependencies'));
    // }
    // const {
    //   [Field.CURRENCY_A]: currencyAmountA,
    //   [Field.CURRENCY_B]: currencyAmountB,
    // } = parsedAmounts;
    // if (!currencyAmountA || !currencyAmountB) {
    //   setRemoveErrorMessage(t('noInputAmounts'));
    //   throw new Error(t('noInputAmounts'));
    // }
    // const amountsMin = {
    //   [Field.CURRENCY_A]: calculateSlippageAmount(
    //     currencyAmountA,
    //     allowedSlippage,
    //   )[0],
    //   [Field.CURRENCY_B]: calculateSlippageAmount(
    //     currencyAmountB,
    //     allowedSlippage,
    //   )[0],
    // };
    // const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    // if (!liquidityAmount) {
    //   setRemoveErrorMessage(t('noLiquidity'));
    //   throw new Error(t('noLiquidity'));
    // }
    // const currencyBIsETH = currency1 === nativeCurrency;
    // const oneCurrencyIsETH = currency0 === nativeCurrency || currencyBIsETH;
    // let methodNames: string[],
    //   args: Array<string | string[] | number | boolean>;
    // // we have approval, use normal remove liquidity
    // if (approval === ApprovalState.APPROVED) {
    //   // removeLiquidityETH
    //   if (oneCurrencyIsETH) {
    //     methodNames = [
    //       'removeLiquidityETH',
    //       'removeLiquidityETHSupportingFeeOnTransferTokens',
    //     ];
    //     args = [
    //       currencyBIsETH ? tokenA.address : tokenB.address,
    //       liquidityAmount.raw.toString(),
    //       amountsMin[
    //         currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B
    //       ].toString(),
    //       amountsMin[
    //         currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A
    //       ].toString(),
    //       account,
    //       deadline.toHexString(),
    //     ];
    //   }
    //   // removeLiquidity
    //   else {
    //     methodNames = ['removeLiquidity'];
    //     args = [
    //       tokenA.address,
    //       tokenB.address,
    //       liquidityAmount.raw.toString(),
    //       amountsMin[Field.CURRENCY_A].toString(),
    //       amountsMin[Field.CURRENCY_B].toString(),
    //       account,
    //       deadline.toHexString(),
    //     ];
    //   }
    // } else {
    //   setRemoveErrorMessage(t('confirmWithoutApproval'));
    //   throw new Error(t('confirmWithoutApproval'));
    // }
    // const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
    //   methodNames.map((methodName) =>
    //     router.estimateGas[methodName](...args)
    //       .then(calculateGasMargin)
    //       .catch((error) => {
    //         console.error(`estimateGas failed`, methodName, args, error);
    //         setRemoveErrorMessage(t('removeLiquidityError1'));
    //         throw new Error(t('removeLiquidityError1'));
    //       }),
    //   ),
    // );
    // const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(
    //   (safeGasEstimate) => BigNumber.isBigNumber(safeGasEstimate),
    // );
    // // all estimations failed...
    // if (indexOfSuccessfulEstimation === -1) {
    //   setRemoveErrorMessage(t('transactionWouldFail'));
    //   throw new Error(t('transactionWouldFail'));
    // } else {
    //   const methodName = methodNames[indexOfSuccessfulEstimation];
    //   const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation];
    //   setAttemptingTxn(true);
    //   await router[methodName](...args, {
    //     gasLimit: safeGasEstimate,
    //   })
    //     .then(async (response: TransactionResponse) => {
    //       setAttemptingTxn(false);
    //       setTxPending(true);
    //       const summary = t('removeLiquidityMsg', {
    //         amount1: formatTokenAmount(parsedAmounts[Field.CURRENCY_A]),
    //         symbol1: currency0.symbol,
    //         amount2: formatTokenAmount(parsedAmounts[Field.CURRENCY_B]),
    //         symbol2: currency1.symbol,
    //       });
    //       addTransaction(response, {
    //         summary,
    //       });
    //       try {
    //         const receipt = await response.wait();
    //         finalizedTransaction(receipt, {
    //           summary,
    //         });
    //         setTxPending(false);
    //       } catch (error) {
    //         setTxPending(false);
    //         setRemoveErrorMessage(t('errorInTx'));
    //       }
    //       ReactGA.event({
    //         category: 'Liquidity',
    //         action: 'Remove',
    //         label: [currency0.symbol, currency1.symbol].join('/'),
    //       });
    //     })
    //     .catch((error: any) => {
    //       setAttemptingTxn(false);
    //       // we only care if the error is something _other_ than the user rejected the tx
    //       console.error(error);
    //       setRemoveErrorMessage(
    //         error.code === 4001 ? t('txRejected') : t('errorInTx'),
    //       );
    //     });
    // }
  };

  return (
    <Button
      className='v3-migrate-details-button'
      disabled={approvingRemoval || removingV2Liquidity}
      onClick={() => {
        if (approvalRemove === ApprovalState.APPROVED) {
          removeV2Liquidity();
        } else {
          approveV2Removal();
        }
      }}
    >
      {approvalRemove === ApprovalState.APPROVED
        ? removingV2Liquidity
          ? t('removingV2Liquidity')
          : t('removeV2Liquidity')
        : approvingRemoval
        ? t('approvingV2Removal')
        : t('approveV2Removal')}
    </Button>
  );
};

export default RemoveV2Liquidity;
