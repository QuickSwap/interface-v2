import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from "constants/addresses";
import { ZERO_PERCENT } from "constants/misc";
import { useV3NFTPositionManagerContract } from "hooks/useContract";
import useTransactionDeadline from "hooks/useTransactionDeadline";
import { useActiveWeb3React } from "hooks/web3";
import { useUserSlippageToleranceWithDefault } from "state/user/hooks";

import { NonfungiblePositionManager as NonFunPosMan } from "lib/src/nonfungiblePositionManager";

import { Percent, Currency } from "@uniswap/sdk-core";
import { calculateGasMargin } from "utils/calculateGasMargin";
import { useAppDispatch, useAppSelector } from "state/hooks";
import { GAS_PRICE_MULTIPLIER } from "hooks/useGasPrice";
import { t, Trans } from "@lingui/macro";
import { useAllTransactions, useTransactionAdder } from "state/transactions/hooks";
import { useMemo, useState } from "react";

import { TransactionResponse } from "@ethersproject/abstract-provider";
import { IDerivedMintInfo, useAddLiquidityTxHash } from "state/mint/v3/hooks";
import { ApprovalState, useApproveCallback } from "hooks/useApproveCallback";
import { Field } from "state/mint/actions";
import { useIsNetworkFailedImmediate } from "hooks/useIsNetworkFailed";
import { setAddLiquidityTxHash } from "state/mint/v3/actions";

interface IAddLiquidityButton {
    baseCurrency: Currency | undefined;
    quoteCurrency: Currency | undefined;
    mintInfo: IDerivedMintInfo;
    handleAddLiquidity: () => void;
    title: string;
    setRejected?: (rejected: boolean) => void;
}
const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000);

export function AddLiquidityButton({ baseCurrency, quoteCurrency, mintInfo, handleAddLiquidity, title, setRejected }: IAddLiquidityButton) {
    const { chainId, library, account } = useActiveWeb3React();

    const positionManager = useV3NFTPositionManagerContract();

    const deadline = useTransactionDeadline();

    const dispatch = useAppDispatch();

    const txHash = useAddLiquidityTxHash();

    const isNetworkFailed = useIsNetworkFailedImmediate();

    const allowedSlippage = useUserSlippageToleranceWithDefault(mintInfo.outOfRange ? ZERO_PERCENT : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE);

    const gasPrice = useAppSelector((state) => {
        if (!state.application.gasPrice.fetched) return 36;
        return state.application.gasPrice.override ? 36 : state.application.gasPrice.fetched;
    });

    const addTransaction = useTransactionAdder();

    const [approvalA] = useApproveCallback(mintInfo.parsedAmounts[Field.CURRENCY_A], chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined);
    const [approvalB] = useApproveCallback(mintInfo.parsedAmounts[Field.CURRENCY_B], chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined);

    const isReady = useMemo(() => {
        return Boolean(
            (mintInfo.depositADisabled ? true : approvalA === ApprovalState.APPROVED) &&
                (mintInfo.depositBDisabled ? true : approvalB === ApprovalState.APPROVED) &&
                !mintInfo.errorMessage &&
                !mintInfo.invalidRange &&
                !txHash &&
                !isNetworkFailed
        );
    }, [mintInfo, approvalA, approvalB]);

    async function onAdd() {
        if (!chainId || !library || !account) return;

        if (!positionManager || !baseCurrency || !quoteCurrency) {
            return;
        }

        if (mintInfo.position && account && deadline) {
            const useNative = baseCurrency.isNative ? baseCurrency : quoteCurrency.isNative ? quoteCurrency : undefined;

            const { calldata, value } = NonFunPosMan.addCallParameters(mintInfo.position, {
                slippageTolerance: allowedSlippage,
                recipient: account,
                deadline: deadline.toString(),
                useNative,
                createPool: mintInfo.noLiquidity,
            });

            const txn: { to: string; data: string; value: string } = {
                to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
                data: calldata,
                value,
            };

            setRejected && setRejected(false);

            library
                .getSigner()
                .estimateGas(txn)
                .then((estimate) => {
                    const newTxn = {
                        ...txn,
                        gasLimit: calculateGasMargin(chainId, estimate),
                        gasPrice: gasPrice * GAS_PRICE_MULTIPLIER,
                    };

                    return library
                        .getSigner()
                        .sendTransaction(newTxn)
                        .then((response: TransactionResponse) => {
                            addTransaction(response, {
                                summary: mintInfo.noLiquidity
                                    ? t`Create pool and add ${baseCurrency?.symbol}/${quoteCurrency?.symbol} liquidity`
                                    : t`Add ${baseCurrency?.symbol}/${quoteCurrency?.symbol} liquidity`,
                            });

                            handleAddLiquidity();
                            dispatch(setAddLiquidityTxHash({ txHash: response.hash }));
                        });
                })
                .catch((error) => {
                    console.error("Failed to send transaction", error);
                    // we only care if the error is something _other_ than the user rejected the tx
                    setRejected && setRejected(true);
                    if (error?.code !== 4001) {
                        console.error(error);
                    }
                });
        } else {
            return;
        }
    }

    return (
        <button className="add-buttons__liquidity ml-a" disabled={!isReady} onClick={onAdd}>
            {title}
        </button>
    );
}
