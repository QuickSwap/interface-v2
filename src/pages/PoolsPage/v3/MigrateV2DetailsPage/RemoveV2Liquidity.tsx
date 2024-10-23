import React, { useMemo, useState } from 'react';
import { Button } from '@material-ui/core';
import { BigNumber } from '@ethersproject/bignumber';
import { V2_ROUTER_ADDRESS } from 'constants/v3/addresses';
import { useRouterContract } from 'hooks/useContract';
import { useTranslation } from 'react-i18next';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { Pair } from 'utils/v3/computePairAddress';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import { useActiveWeb3React } from 'hooks';
import { useTotalSupply } from 'hooks/v3/useTotalSupply';
import { ETHER, JSBI } from '@uniswap/sdk';
import { CurrencyAmount } from '@uniswap/sdk-core';
import { useToken } from 'hooks/TokensV3';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import {
  calculateGasMargin,
  calculateSlippageAmountV3,
  formatNumber,
} from 'utils';
import { useUserSlippageTolerance } from 'state/user/hooks';
import { Field } from 'state/burn/actions';
import { TransactionResponse } from '@ethersproject/providers';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionType } from 'models/enums';

const RemoveV2Liquidity: React.FC<{
  pair: Pair | null;
  currency0IsETH: boolean;
  currency1IsETH: boolean;
  beforeRemove?: () => void;
}> = ({ pair, currency0IsETH, currency1IsETH, beforeRemove }) => {
  const { t } = useTranslation();
  const { chainId, account, library } = useActiveWeb3React();
  const router = useRouterContract();
  const deadline = useTransactionDeadline();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair?.liquidityToken,
  );
  const [allowedSlippage] = useUserSlippageTolerance();
  const reserve0 = pair?.reserve0;
  const reserve1 = pair?.reserve1;

  const token0 = useToken(reserve0?.currency.address);
  const token1 = useToken(reserve1?.currency.address);
  const totalPoolTokens = useTotalSupply(pair?.liquidityToken);
  const token0Value = useMemo(() => {
    if (!token0 || !reserve0 || !totalPoolTokens || !userPoolBalance) {
      return;
    }

    return CurrencyAmount.fromRawAmount(
      token0,
      JSBI.divide(
        JSBI.multiply(userPoolBalance.quotient, reserve0.quotient),
        totalPoolTokens.quotient,
      ),
    );
  }, [token0, userPoolBalance, reserve0, totalPoolTokens]);
  const token1Value = useMemo(() => {
    if (!token1 || !reserve1 || !totalPoolTokens || !userPoolBalance) {
      return;
    }

    return CurrencyAmount.fromRawAmount(
      token1,
      JSBI.divide(
        JSBI.multiply(userPoolBalance.quotient, reserve1.quotient),
        totalPoolTokens.quotient,
      ),
    );
  }, [token1, userPoolBalance, reserve1, totalPoolTokens]);

  const [approving, setApproving] = useState(false);
  const [approval, approveCallback] = useApproveCallback(
    userPoolBalance,
    chainId ? V2_ROUTER_ADDRESS[chainId] : undefined,
  );
  const [removingV2Liquidity, setRemovingV2Liquidity] = useState(false);

  const approveV2Removal = async () => {
    setApproving(true);
    try {
      await approveCallback();
      setApproving(false);
    } catch (e) {
      setApproving(false);
    }
  };

  const removeErrorMessage = useMemo(() => {
    if (
      !chainId ||
      !library ||
      !account ||
      !deadline ||
      !router ||
      !token0 ||
      !token1
    ) {
      return t('missingdependencies');
    } else if (!token0Value || !token1Value) {
      return t('noInputAmounts');
    } else if (!userPoolBalance) {
      return t('noLiquidity');
    }
  }, [
    account,
    chainId,
    deadline,
    library,
    router,
    t,
    token0,
    token0Value,
    token1,
    token1Value,
    userPoolBalance,
  ]);

  const removeV2Liquidity = async () => {
    if (
      !chainId ||
      !library ||
      !account ||
      !deadline ||
      !router ||
      !token0 ||
      !token1 ||
      !token0Value ||
      !token1Value ||
      !userPoolBalance
    ) {
      return;
    }

    if (beforeRemove) {
      beforeRemove();
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmountV3(
        token0Value,
        allowedSlippage,
      )[0],
      [Field.CURRENCY_B]: calculateSlippageAmountV3(
        token1Value,
        allowedSlippage,
      )[0],
    };

    const oneCurrencyIsETH = currency0IsETH || currency1IsETH;
    let methodNames: string[],
      args: Array<string | string[] | number | boolean>;
    if (oneCurrencyIsETH) {
      methodNames = [
        'removeLiquidityETH',
        'removeLiquidityETHSupportingFeeOnTransferTokens',
      ];
      args = [
        currency1IsETH ? token0.address : token1.address,
        userPoolBalance.numerator.toString(),
        amountsMin[
          currency1IsETH ? Field.CURRENCY_A : Field.CURRENCY_B
        ].toString(),
        amountsMin[
          currency1IsETH ? Field.CURRENCY_B : Field.CURRENCY_A
        ].toString(),
        account,
        deadline.toHexString(),
      ];
    }
    // removeLiquidity
    else {
      methodNames = ['removeLiquidity'];
      args = [
        token0.address,
        token1.address,
        userPoolBalance.numerator.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString(),
      ];
    }

    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map((methodName) =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch((error) => {
            console.error(`estimateGas failed`, methodName, args, error);
            throw new Error(t('removeLiquidityError1'));
          }),
      ),
    );
    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(
      (safeGasEstimate) => BigNumber.isBigNumber(safeGasEstimate),
    );
    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      throw new Error(t('transactionWouldFail'));
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation];
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation];
      setRemovingV2Liquidity(true);
      await router[methodName](...args, {
        gasLimit: safeGasEstimate,
      })
        .then(async (response: TransactionResponse) => {
          const summary = t('removeLiquidityMsg', {
            amount1: formatNumber(token0Value.toExact()),
            symbol1: currency0IsETH ? ETHER[chainId].symbol : token0.symbol,
            amount2: formatNumber(token1Value.toExact()),
            symbol2: currency1IsETH ? ETHER[chainId].symbol : token1.symbol,
          });
          addTransaction(response, {
            summary,
            type: TransactionType.REMOVE_LIQUIDITY,
            tokens: [
              currency0IsETH ? ETHER[chainId] : token0,
              currency1IsETH ? ETHER[chainId] : token1,
            ],
          });
          try {
            const receipt = await response.wait();
            finalizedTransaction(receipt, {
              summary,
            });
            setRemovingV2Liquidity(false);
          } catch (error) {
            setRemovingV2Liquidity(false);
          }
        })
        .catch((error: any) => {
          setRemovingV2Liquidity(false);
          console.error(error);
        });
    }
  };

  return (
    <Button
      className='v3-migrate-details-button'
      disabled={approving || removingV2Liquidity || !!removeErrorMessage}
      onClick={() => {
        if (approval === ApprovalState.APPROVED) {
          removeV2Liquidity();
        } else {
          approveV2Removal();
        }
      }}
    >
      {approval === ApprovalState.APPROVED
        ? removeErrorMessage
          ? removeErrorMessage
          : removingV2Liquidity
          ? t('removingV2Liquidity')
          : t('removeV2Liquidity')
        : approval
        ? t('approvingV2Removal')
        : t('approveV2Removal')}
    </Button>
  );
};

export default RemoveV2Liquidity;
