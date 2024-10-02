import React, { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AML_SCORE_THRESHOLD } from 'config';
import {
  useDefiedgeStrategyContract,
  useGammaUNIProxyContract,
  useSteerPeripheryContract,
  useUNIV3NFTPositionManagerContract,
  useUniPilotVaultContract,
  useV3NFTPositionManagerContract,
  useWETHContract,
} from 'hooks/useContract';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { useActiveWeb3React } from 'hooks';
import {
  useIsExpertMode,
  useUserSlippageTolerance,
  useAmlScore,
} from 'state/user/hooks';
import { NonfungiblePositionManager as NonFunPosMan } from 'v3lib/nonfungiblePositionManager';
import { UniV3NonfungiblePositionManager as UniV3NonFunPosMan } from 'v3lib/uniV3NonfungiblePositionManager';
import { Percent, Currency } from '@uniswap/sdk-core';
import { useAppDispatch } from 'state/hooks';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  IDerivedMintInfo,
  useActivePreset,
  useAddLiquidityTxHash,
} from 'state/mint/v3/hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { Field } from 'state/mint/actions';
import { Bound, setAddLiquidityTxHash } from 'state/mint/v3/actions';
import { useIsNetworkFailedImmediate } from 'hooks/v3/useIsNetworkFailed';
import { ChainId, ETHER, JSBI, Token, WETH } from '@uniswap/sdk';
import { CurrencyAmount } from '@uniswap/sdk-core';
import {
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  UNI_NFT_POSITION_MANAGER_ADDRESS,
} from 'constants/v3/addresses';
import {
  calculateGasMargin,
  calculateGasMarginV3,
  getGammaPairsForTokens,
} from 'utils';
import { Button, Box } from '@material-ui/core';
import {
  ConfirmationModalContent,
  CurrencyLogo,
  DoubleCurrencyLogo,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import './index.scss';
import RangeBadge from 'components/v3/Badge/RangeBadge';
import RateToggle from 'components/v3/RateToggle';
import { useInverter } from 'hooks/v3/useInverter';
import { GlobalConst } from 'constants/index';
import { useTranslation } from 'react-i18next';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { formatUnits } from 'ethers/lib/utils';
import { ZERO } from 'v3lib/utils';
import { Presets } from 'state/mint/v3/reducer';
import { TransactionType } from 'models/enums';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { ETHER as ETHER_CURRENCY } from 'constants/v3/addresses';

interface IAddLiquidityButton {
  baseCurrency: Currency | undefined;
  quoteCurrency: Currency | undefined;
  mintInfo: IDerivedMintInfo;
  handleAddLiquidity: () => void;
  title: string;
  setRejected?: (rejected: boolean) => void;
}

export function AddLiquidityButton({
  baseCurrency,
  quoteCurrency,
  mintInfo,
  handleAddLiquidity,
  title,
  setRejected,
}: IAddLiquidityButton) {
  const history = useHistory();
  const { t } = useTranslation();
  const { chainId, library, account } = useActiveWeb3React();
  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [addLiquidityErrorMessage, setAddLiquidityErrorMessage] = useState<
    string | null
  >(null);
  const [manuallyInverted, setManuallyInverted] = useState(false);
  const preset = useActivePreset();

  const algebraPositionManager = useV3NFTPositionManagerContract();
  const uniV3PositionManager = useUNIV3NFTPositionManagerContract();
  const positionManager =
    mintInfo.feeTier && mintInfo.feeTier.id.includes('uni')
      ? uniV3PositionManager
      : algebraPositionManager;
  const positionManagerAddress = useMemo(() => {
    if (mintInfo.feeTier && mintInfo.feeTier.id.includes('uni')) {
      return UNI_NFT_POSITION_MANAGER_ADDRESS[chainId];
    }
    return NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId];
  }, [chainId, mintInfo.feeTier]);
  const wethContract = useWETHContract();

  const deadline = useTransactionDeadline();

  const dispatch = useAppDispatch();

  const txHash = useAddLiquidityTxHash();

  const expertMode = useIsExpertMode();

  const isNetworkFailed = useIsNetworkFailedImmediate();

  const [allowedSlippage] = useUserSlippageTolerance();
  const { isLoading: isAmlScoreLoading, score: amlScore } = useAmlScore();

  const allowedSlippagePercent: Percent = useMemo(() => {
    return new Percent(JSBI.BigInt(allowedSlippage), JSBI.BigInt(10000));
  }, [allowedSlippage]);

  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const gammaPairData = getGammaPairsForTokens(
    chainId,
    baseCurrency?.wrapped.address,
    quoteCurrency?.wrapped.address,
    mintInfo.feeAmount,
  );
  const gammaPair = gammaPairData?.pairs;
  const gammaPairAddress =
    gammaPair && gammaPair.length > 0
      ? gammaPair.find((pair) => pair.type === preset)?.address
      : undefined;
  const gammaUNIPROXYContract = useGammaUNIProxyContract(gammaPairAddress);
  const amountA = mintInfo.parsedAmounts[Field.CURRENCY_A];
  const amountB = mintInfo.parsedAmounts[Field.CURRENCY_B];
  const wmaticBalance = useCurrencyBalance(
    account ?? undefined,
    chainId ? WETH[chainId] : undefined,
  );

  const [wrappingETH, setWrappingETH] = useState(false);
  const amountToWrap = useMemo(() => {
    if (
      !baseCurrency ||
      !quoteCurrency ||
      !amountA ||
      !amountB ||
      !chainId ||
      (mintInfo.liquidityRangeType !==
        GlobalConst.v3LiquidityRangeType.GAMMA_RANGE &&
        mintInfo.liquidityRangeType !==
          GlobalConst.v3LiquidityRangeType.STEER_RANGE)
    )
      return;
    if (
      baseCurrency.isNative ||
      baseCurrency.wrapped.address.toLowerCase() ===
        WETH[chainId].address.toLowerCase()
    ) {
      if (
        wmaticBalance &&
        JSBI.greaterThan(amountA.numerator, wmaticBalance.numerator)
      ) {
        return JSBI.subtract(amountA.numerator, wmaticBalance.numerator);
      }
      return;
    } else if (
      quoteCurrency.isNative ||
      quoteCurrency.wrapped.address.toLowerCase() ===
        WETH[chainId].address.toLowerCase()
    ) {
      if (
        wmaticBalance &&
        JSBI.greaterThan(amountB.numerator, wmaticBalance.numerator)
      ) {
        return JSBI.subtract(amountB.numerator, wmaticBalance.numerator);
      }
      return;
    }
    return;
  }, [
    amountA,
    amountB,
    baseCurrency,
    chainId,
    mintInfo.liquidityRangeType,
    quoteCurrency,
    wmaticBalance,
  ]);

  const uniPilotVaultAddress = mintInfo.presetRange?.address;
  const defiedgeStrategyAddress = mintInfo.presetRange?.address;
  const defiedgeStrategyContract = useDefiedgeStrategyContract(
    defiedgeStrategyAddress,
  );
  const vaultAddress = mintInfo.presetRange?.address;
  const uniPilotVaultContract = useUniPilotVaultContract(vaultAddress);

  const steerPeripheryContract = useSteerPeripheryContract();

  const [approvalA] = useApproveCallback(
    mintInfo.parsedAmounts[Field.CURRENCY_A],
    chainId
      ? mintInfo.liquidityRangeType ===
        GlobalConst.v3LiquidityRangeType.GAMMA_RANGE
        ? gammaPairAddress
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.UNIPILOT_RANGE
        ? uniPilotVaultAddress
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.DEFIEDGE_RANGE
        ? defiedgeStrategyAddress
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.STEER_RANGE
        ? steerPeripheryContract?.address
        : positionManagerAddress
      : undefined,
  );
  const [approvalB] = useApproveCallback(
    mintInfo.parsedAmounts[Field.CURRENCY_B],
    chainId
      ? mintInfo.liquidityRangeType ===
        GlobalConst.v3LiquidityRangeType.GAMMA_RANGE
        ? gammaPairAddress
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.UNIPILOT_RANGE
        ? uniPilotVaultAddress
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.DEFIEDGE_RANGE
        ? defiedgeStrategyAddress
        : mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.STEER_RANGE
        ? steerPeripheryContract?.address
        : positionManagerAddress
      : undefined,
  );

  const isReady = useMemo(() => {
    return (
      mintInfo.presetRange?.type !== Presets.OUT_OF_RANGE &&
      Boolean(
        (mintInfo.depositADisabled
          ? true
          : approvalA === ApprovalState.APPROVED) &&
          (mintInfo.depositBDisabled
            ? true
            : approvalB === ApprovalState.APPROVED) &&
          !mintInfo.errorMessage &&
          !mintInfo.invalidRange &&
          !txHash &&
          !isNetworkFailed &&
          (amountToWrap ? !wrappingETH : true),
      )
    );
  }, [
    mintInfo,
    approvalA,
    approvalB,
    txHash,
    isNetworkFailed,
    amountToWrap,
    wrappingETH,
  ]);

  const onAddLiquidity = () => {
    if (expertMode) {
      onAdd();
    } else {
      setShowConfirm(true);
    }
  };

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    setAttemptingTxn(false);
    setTxPending(false);
    setAddLiquidityErrorMessage('');
    dispatch(setAddLiquidityTxHash({ txHash: '' }));
  }, [dispatch]);

  async function onWrapMatic() {
    if (!chainId || !library || !account || !wethContract || !amountToWrap)
      return;

    if (amlScore > AML_SCORE_THRESHOLD) {
      history.push('/forbidden');
      return;
    }

    setWrappingETH(true);
    try {
      const wrapEstimateGas = await wethContract.estimateGas.deposit({
        value: `0x${amountToWrap.toString(16)}`,
      });
      const wrapResponse: TransactionResponse = await wethContract.deposit({
        gasLimit: calculateGasMargin(wrapEstimateGas),
        value: `0x${amountToWrap.toString(16)}`,
      });
      setAttemptingTxn(false);
      setTxPending(true);
      const summary = `Wrap ${formatUnits(
        amountToWrap.toString(),
        18,
      )} ETH to WETH`;
      addTransaction(wrapResponse, {
        summary,
        type: TransactionType.WRAP,
        tokens: [ETHER[chainId]],
      });
      const receipt = await wrapResponse.wait();
      finalizedTransaction(receipt, {
        summary,
      });
      setWrappingETH(false);
    } catch (e) {
      console.error(e);
      setWrappingETH(false);
    }
  }

  async function onAdd() {
    if (!chainId || !library || !account) return;

    if (!baseCurrency || !quoteCurrency) {
      return;
    }

    if (amlScore > AML_SCORE_THRESHOLD) {
      history.push('/forbidden');
      return;
    }

    if (
      mintInfo.liquidityRangeType ===
      GlobalConst.v3LiquidityRangeType.GAMMA_RANGE
    ) {
      if (!gammaUNIPROXYContract || !amountA || !amountB || !gammaPairData)
        return;

      setRejected && setRejected(false);

      setAttemptingTxn(true);

      try {
        const estimatedGas = await gammaUNIPROXYContract.estimateGas.deposit(
          (!gammaPairData.reversed ? amountA : amountB).numerator.toString(),
          (!gammaPairData.reversed ? amountB : amountA).numerator.toString(),
          account,
          gammaPairAddress,
          [0, 0, 0, 0],
        );
        const response: TransactionResponse = await gammaUNIPROXYContract.deposit(
          (!gammaPairData.reversed ? amountA : amountB).numerator.toString(),
          (!gammaPairData.reversed ? amountB : amountA).numerator.toString(),
          account,
          gammaPairAddress,
          [0, 0, 0, 0],
          {
            gasLimit: calculateGasMargin(estimatedGas),
          },
        );
        const summary = mintInfo.noLiquidity
          ? t('createPoolandaddLiquidity', {
              symbolA: baseCurrency?.symbol,
              symbolB: quoteCurrency?.symbol,
            })
          : t('addLiquidityWithTokens', {
              symbolA: baseCurrency?.symbol,
              symbolB: quoteCurrency?.symbol,
            });
        setAttemptingTxn(false);
        setTxPending(true);
        addTransaction(response, {
          summary,
          type: TransactionType.ADDED_LIQUIDITY,
          tokens: [baseCurrency, quoteCurrency],
        });
        dispatch(setAddLiquidityTxHash({ txHash: response.hash }));
        const receipt = await response.wait();
        finalizedTransaction(receipt, {
          summary,
        });
        setTxPending(false);
        handleAddLiquidity();
      } catch (error) {
        console.error('Failed to send transaction', error);
        const errorMsg =
          error && error.message
            ? error.message.toLowerCase()
            : error && error.data && error.data.message
            ? error.data.message.toLowerCase()
            : '';
        setAttemptingTxn(false);
        setTxPending(false);
        setAddLiquidityErrorMessage(
          errorMsg.indexOf('improper ratio') > -1
            ? t('gammaImproperRatio')
            : errorMsg.indexOf('price change overflow') > -1
            ? t('gammaPriceOverflow')
            : error?.code === 'ACTION_REJECTED'
            ? t('txRejected')
            : t('errorInTx'),
        );
      }
    }
    if (
      mintInfo.liquidityRangeType ===
      GlobalConst.v3LiquidityRangeType.STEER_RANGE
    ) {
      if (
        !steerPeripheryContract ||
        !mintInfo.presetRange ||
        !mintInfo.presetRange.tokenStr
      )
        return;
      const baseCurrencyAddress = baseCurrency.wrapped
        ? baseCurrency.wrapped.address.toLowerCase()
        : undefined;
      const quoteCurrencyAddress = quoteCurrency.wrapped
        ? quoteCurrency.wrapped.address.toLowerCase()
        : undefined;
      const steerToken0Address = mintInfo.presetRange.tokenStr.split('-')[0];
      if (
        !amountA ||
        !amountB ||
        !vaultAddress ||
        !baseCurrencyAddress ||
        !quoteCurrencyAddress
      )
        return;
      setRejected && setRejected(false);
      setAttemptingTxn(true);
      try {
        const estimatedGas = await steerPeripheryContract.estimateGas.deposit(
          vaultAddress,
          (steerToken0Address.toLowerCase() === baseCurrencyAddress
            ? amountA
            : amountB
          ).numerator.toString(),
          (steerToken0Address.toLowerCase() === baseCurrencyAddress
            ? amountB
            : amountA
          ).numerator.toString(),
          0,
          0,
          account,
        );
        const response: TransactionResponse = await steerPeripheryContract.deposit(
          vaultAddress,
          (steerToken0Address.toLowerCase() === baseCurrencyAddress
            ? amountA
            : amountB
          ).numerator.toString(),
          (steerToken0Address.toLowerCase() === baseCurrencyAddress
            ? amountB
            : amountA
          ).numerator.toString(),
          0,
          0,
          account,
          { gasLimit: calculateGasMarginV3(chainId, estimatedGas) },
        );
        const summary = mintInfo.noLiquidity
          ? t('createPoolandaddLiquidity', {
              symbolA: baseCurrency?.symbol,
              symbolB: quoteCurrency?.symbol,
            })
          : t('addLiquidityWithTokens', {
              symbolA: baseCurrency?.symbol,
              symbolB: quoteCurrency?.symbol,
            });
        setAttemptingTxn(false);
        setTxPending(true);
        addTransaction(response, {
          summary,
          type: TransactionType.ADDED_LIQUIDITY,
          tokens: [baseCurrency, quoteCurrency],
        });
        dispatch(setAddLiquidityTxHash({ txHash: response.hash }));
        const receipt = await response.wait();
        finalizedTransaction(receipt, {
          summary,
        });
        setTxPending(false);
        handleAddLiquidity();
      } catch (error) {
        console.error('Failed to send transaction', error);
        const errorMsg =
          error && error.message
            ? error.message.toLowerCase()
            : error && error.data && error.data.message
            ? error.data.message.toLowerCase()
            : '';
        setAttemptingTxn(false);
        setTxPending(false);
        setAddLiquidityErrorMessage(t('errorInTx'));
      }
    } else if (
      mintInfo.liquidityRangeType ===
      GlobalConst.v3LiquidityRangeType.UNIPILOT_RANGE
    ) {
      if (
        !uniPilotVaultContract ||
        !mintInfo.presetRange ||
        !mintInfo.presetRange.tokenStr
      )
        return;
      const baseCurrencyAddress = baseCurrency.wrapped
        ? baseCurrency.wrapped.address.toLowerCase()
        : undefined;
      const quoteCurrencyAddress = quoteCurrency.wrapped
        ? quoteCurrency.wrapped.address.toLowerCase()
        : undefined;

      const uniPilotToken0Address = mintInfo.presetRange.tokenStr.split('-')[0];

      if (
        !amountA ||
        !amountB ||
        !vaultAddress ||
        !baseCurrencyAddress ||
        !quoteCurrencyAddress
      )
        return;

      setRejected && setRejected(false);

      setAttemptingTxn(true);

      try {
        const estimatedGas = await uniPilotVaultContract.estimateGas.deposit(
          (uniPilotToken0Address.toLowerCase() === baseCurrencyAddress
            ? amountA
            : amountB
          ).numerator.toString(),
          (uniPilotToken0Address.toLowerCase() === baseCurrencyAddress
            ? amountB
            : amountA
          ).numerator.toString(),
          account,
          {
            value: baseCurrency.isNative
              ? amountA.numerator.toString()
              : quoteCurrency.isNative
              ? amountB.numerator.toString()
              : '0',
          },
        );
        const response: TransactionResponse = await uniPilotVaultContract.deposit(
          (uniPilotToken0Address.toLowerCase() === baseCurrencyAddress
            ? amountA
            : amountB
          ).numerator.toString(),
          (uniPilotToken0Address.toLowerCase() === baseCurrencyAddress
            ? amountB
            : amountA
          ).numerator.toString(),
          account,
          {
            gasLimit: calculateGasMargin(estimatedGas),
            value: baseCurrency.isNative
              ? amountA.numerator.toString()
              : quoteCurrency.isNative
              ? amountB.numerator.toString()
              : '0',
          },
        );
        const summary = mintInfo.noLiquidity
          ? t('createPoolandaddLiquidity', {
              symbolA: baseCurrency?.symbol,
              symbolB: quoteCurrency?.symbol,
            })
          : t('addLiquidityWithTokens', {
              symbolA: baseCurrency?.symbol,
              symbolB: quoteCurrency?.symbol,
            });
        setAttemptingTxn(false);
        setTxPending(true);
        addTransaction(response, {
          summary,
          type: TransactionType.ADDED_LIQUIDITY,
          tokens: [baseCurrency, quoteCurrency],
        });
        dispatch(setAddLiquidityTxHash({ txHash: response.hash }));
        const receipt = await response.wait();
        finalizedTransaction(receipt, {
          summary,
        });
        setTxPending(false);
        handleAddLiquidity();
      } catch (error) {
        console.error('Failed to send transaction', error);
        const errorMsg =
          error && error.message
            ? error.message.toLowerCase()
            : error && error.data && error.data.message
            ? error.data.message.toLowerCase()
            : '';
        setAttemptingTxn(false);
        setTxPending(false);
        setAddLiquidityErrorMessage(t('errorInTx'));
      }
    } else if (
      mintInfo.liquidityRangeType ===
      GlobalConst.v3LiquidityRangeType.DEFIEDGE_RANGE
    ) {
      if (
        !defiedgeStrategyContract ||
        !mintInfo.presetRange ||
        !mintInfo.presetRange.tokenStr
      )
        return;
      const baseCurrencyAddress = baseCurrency.wrapped
        ? baseCurrency.wrapped.address.toLowerCase()
        : undefined;
      const quoteCurrencyAddress = quoteCurrency.wrapped
        ? quoteCurrency.wrapped.address.toLowerCase()
        : undefined;

      const token0Address = mintInfo.presetRange.tokenStr.split('-')[0];

      if (
        !defiedgeStrategyAddress ||
        !baseCurrencyAddress ||
        !quoteCurrencyAddress
      )
        return;

      setRejected && setRejected(false);

      setAttemptingTxn(true);

      const zeroCurrencyAmount = CurrencyAmount.fromRawAmount(quoteCurrency, 0);

      try {
        const estimatedGas = await defiedgeStrategyContract.estimateGas.mint(
          (token0Address.toLowerCase() === baseCurrencyAddress
            ? amountA ?? zeroCurrencyAmount
            : amountB ?? zeroCurrencyAmount
          ).numerator.toString(),
          (token0Address.toLowerCase() === baseCurrencyAddress
            ? amountB ?? zeroCurrencyAmount
            : amountA ?? zeroCurrencyAmount
          ).numerator.toString(),
          '0',
          '0',
          '0',
          {
            value: baseCurrency.isNative
              ? (amountA ?? zeroCurrencyAmount).numerator.toString()
              : quoteCurrency.isNative
              ? (amountB ?? zeroCurrencyAmount).numerator.toString()
              : '0',
          },
        );
        const response: TransactionResponse = await defiedgeStrategyContract.mint(
          (token0Address.toLowerCase() === baseCurrencyAddress
            ? amountA ?? zeroCurrencyAmount
            : amountB ?? zeroCurrencyAmount
          ).numerator.toString(),
          (token0Address.toLowerCase() === baseCurrencyAddress
            ? amountB ?? zeroCurrencyAmount
            : amountA ?? zeroCurrencyAmount
          ).numerator.toString(),
          '0',
          '0',
          '0',
          {
            gasLimit: calculateGasMargin(estimatedGas),
            value: baseCurrency.isNative
              ? (amountA ?? zeroCurrencyAmount).numerator.toString()
              : quoteCurrency.isNative
              ? (amountB ?? zeroCurrencyAmount).numerator.toString()
              : '0',
          },
        );
        const summary = mintInfo.noLiquidity
          ? t('createPoolandaddLiquidity', {
              symbolA: baseCurrency?.symbol,
              symbolB: quoteCurrency?.symbol,
            })
          : t('addLiquidityWithTokens', {
              symbolA: baseCurrency?.symbol,
              symbolB: quoteCurrency?.symbol,
            });
        setAttemptingTxn(false);
        setTxPending(true);
        addTransaction(response, {
          summary,
          type: TransactionType.ADDED_LIQUIDITY,
          tokens: [baseCurrency, quoteCurrency],
        });
        dispatch(setAddLiquidityTxHash({ txHash: response.hash }));
        const receipt = await response.wait();
        finalizedTransaction(receipt, {
          summary,
        });
        setTxPending(false);
        handleAddLiquidity();
      } catch (error) {
        console.error('Failed to send transaction', error);
        const errorMsg =
          error && error.message
            ? error.message.toLowerCase()
            : error && error.data && error.data.message
            ? error.data.message.toLowerCase()
            : '';
        setAttemptingTxn(false);
        setTxPending(false);
        setAddLiquidityErrorMessage(t('errorInTx'));
      }
    } else {
      if (mintInfo.position && account && deadline) {
        if (!positionManager) return;
        const useNative = baseCurrency.isNative
          ? baseCurrency
          : quoteCurrency.isNative
          ? quoteCurrency
          : undefined;

        let callParams;
        if (mintInfo.feeTier && mintInfo.feeTier.id.includes('uni')) {
          callParams = UniV3NonFunPosMan.addCallParameters(mintInfo.position, {
            slippageTolerance: allowedSlippagePercent,
            recipient: account,
            deadline: deadline.toString(),
            useNative,
            createPool: mintInfo.noLiquidity,
          });
        } else {
          callParams = NonFunPosMan.addCallParameters(mintInfo.position, {
            slippageTolerance: allowedSlippagePercent,
            recipient: account,
            deadline: deadline.toString(),
            useNative,
            createPool: mintInfo.noLiquidity,
          });
        }
        const { calldata, value } = callParams;

        const txn: { to: string; data: string; value: string } = {
          to: positionManagerAddress,
          data: calldata,
          value,
        };

        setRejected && setRejected(false);

        setAttemptingTxn(true);

        library
          .getSigner()
          .estimateGas(txn)
          .then((estimate) => {
            const newTxn = {
              ...txn,
              gasLimit: calculateGasMarginV3(chainId, estimate),
            };

            return library
              .getSigner()
              .sendTransaction(newTxn)
              .then(async (response: TransactionResponse) => {
                setAttemptingTxn(false);
                setTxPending(true);
                const summary = mintInfo.noLiquidity
                  ? t('createPoolandaddLiquidity', {
                      symbolA: baseCurrency?.symbol,
                      symbolB: quoteCurrency?.symbol,
                    })
                  : t('addLiquidityWithTokens', {
                      symbolA: baseCurrency?.symbol,
                      symbolB: quoteCurrency?.symbol,
                    });
                addTransaction(response, {
                  summary,
                  type: TransactionType.ADDED_LIQUIDITY,
                  tokens: [
                    ((baseCurrency as unknown) as any)?.address ??
                      wrappedCurrency(Token.ETHER[chainId], chainId),
                    ((quoteCurrency as unknown) as any)?.address ??
                      wrappedCurrency(Token.ETHER[chainId], chainId),
                  ],
                });

                dispatch(setAddLiquidityTxHash({ txHash: response.hash }));

                try {
                  const receipt = await response.wait();
                  finalizedTransaction(receipt, {
                    summary,
                  });
                  setTxPending(false);
                  handleAddLiquidity();
                } catch (error) {
                  console.error('Failed to send transaction', error);
                  setTxPending(false);
                  setAddLiquidityErrorMessage(
                    error?.code === 'ACTION_REJECTED'
                      ? t('txRejected')
                      : t('errorInTx'),
                  );
                }
              })
              .catch((err) => {
                console.error('Failed to send transaction', err);
                setAttemptingTxn(false);
                setAddLiquidityErrorMessage(
                  err?.code === 'ACTION_REJECTED'
                    ? t('txRejected')
                    : t('errorInTx'),
                );
              });
          })
          .catch((error) => {
            console.error('Failed to send transaction', error);
            // we only care if the error is something _other_ than the user rejected the tx
            setRejected && setRejected(true);
            setAttemptingTxn(false);
            setAddLiquidityErrorMessage(
              error?.code === 'ACTION_REJECTED'
                ? t('txRejected')
                : t('errorInTx'),
            );
            if (error?.code !== 'ACTION_REJECTED') {
              console.error(error);
            }
          });
      }
    }
  }

  const {
    [Bound.LOWER]: _priceLower,
    [Bound.UPPER]: _priceUpper,
  } = useMemo(() => {
    return mintInfo.pricesAtTicks;
  }, [mintInfo]);

  const quoteWrapped = quoteCurrency?.wrapped;
  const baseWrapped = baseCurrency?.wrapped;

  // handle manual inversion
  const { priceLower, priceUpper, base } = useInverter({
    priceLower: _priceLower,
    priceUpper: _priceUpper,
    quote: quoteWrapped,
    base: baseWrapped,
    invert: manuallyInverted,
  });

  const isSorted =
    baseWrapped && quoteWrapped && baseWrapped.sortsBefore(quoteWrapped);
  const inverted = isSorted
    ? quoteWrapped && base?.equals(quoteWrapped)
    : baseWrapped && base?.equals(baseWrapped);
  const currencyQuote = inverted ? baseCurrency : quoteCurrency;
  const currencyBase = inverted ? quoteCurrency : baseCurrency;

  const currentPrice = useMemo(() => {
    if (!mintInfo.price) return;

    const _price =
      (isSorted && inverted) || (!isSorted && !inverted)
        ? parseFloat(mintInfo.price.invert().toSignificant(5))
        : parseFloat(mintInfo.price.toSignificant(5));

    if (Number(_price) <= 0.0001) {
      return `< 0.0001`;
    } else {
      return _price;
    }
  }, [mintInfo.price, isSorted, inverted]);

  const modalHeader = () => {
    return (
      <Box>
        <Box mt={3} className='flex items-center justify-between'>
          <Box className='flex items-center'>
            <Box className='flex' mr={1}>
              <DoubleCurrencyLogo
                currency0={baseCurrency}
                currency1={quoteCurrency}
                size={48}
              />
            </Box>
            <h4>
              {baseCurrency?.symbol}-{quoteCurrency?.symbol}
            </h4>
          </Box>
          {mintInfo.liquidityRangeType ===
          GlobalConst.v3LiquidityRangeType.MANUAL_RANGE ? (
            <RangeBadge
              removed={false}
              withTooltip={false}
              inRange={!mintInfo.outOfRange}
            />
          ) : mintInfo.presetRange?.title ? (
            <div className='automatic-liquidity-range'>
              {mintInfo.presetRange?.title} {t('range').toLowerCase()}
            </div>
          ) : (
            <></>
          )}
        </Box>
        <Box
          mt='20px'
          padding='20px 16px'
          borderRadius='10px'
          className='bg-secondary1'
        >
          <Box className='flex justify-between'>
            <Box className='flex items-center'>
              <Box className='flex' mr='6px'>
                <CurrencyLogo currency={baseCurrency} size='24px' />
              </Box>
              <p>{baseCurrency?.symbol}</p>
            </Box>
            <p>{mintInfo.parsedAmounts[Field.CURRENCY_A]?.toSignificant()}</p>
          </Box>
          <Box mt={2} className='flex justify-between'>
            <Box className='flex items-center'>
              <Box className='flex' mr='6px'>
                <CurrencyLogo currency={quoteCurrency} size='24px' />
              </Box>
              <p>{quoteCurrency?.symbol}</p>
            </Box>
            <p>{mintInfo.parsedAmounts[Field.CURRENCY_B]?.toSignificant()}</p>
          </Box>
        </Box>
        <Box mt={3}>
          <Box className='flex items-center justify-between'>
            <p>{t('selectedRange')}</p>
            {currencyBase && currencyQuote && (
              <RateToggle
                currencyA={currencyBase}
                currencyB={currencyQuote}
                handleRateToggle={() => setManuallyInverted(!manuallyInverted)}
              />
            )}
          </Box>
        </Box>
        <Box width={1} mt={2} className='flex justify-between'>
          {priceLower && (
            <Box
              className='v3-supply-liquidity-price-wrapper'
              width={priceUpper ? '49%' : '100%'}
            >
              <p>{t('minPrice')}</p>
              <h6>
                {mintInfo.ticksAtLimit[Bound.LOWER]
                  ? '0'
                  : priceLower.toSignificant()}
              </h6>
              <p>
                {currencyQuote?.symbol} {t('per')} {currencyBase?.symbol}
              </p>
              <p>
                {t('positionComposedAtThisPrice', {
                  symbol: currencyBase?.symbol,
                })}
              </p>
            </Box>
          )}
          {priceUpper && (
            <Box
              className='v3-supply-liquidity-price-wrapper'
              width={priceLower ? '49%' : '100%'}
            >
              <p>{t('maxPrice')}</p>
              <h6>
                {mintInfo.ticksAtLimit[Bound.UPPER]
                  ? '∞'
                  : priceUpper.toSignificant()}
              </h6>
              <p>
                {currencyQuote?.symbol} {t('per')} {currencyBase?.symbol}
              </p>
              <p>
                {t('positionComposedAtThisPrice', {
                  symbol: currencyQuote?.symbol,
                })}
              </p>
            </Box>
          )}
        </Box>
        {currentPrice && (
          <Box mt={2} className='v3-supply-liquidity-price-wrapper'>
            <p>{t('currentPrice')}</p>
            <h6>{currentPrice}</h6>
            <p>
              {currencyQuote?.symbol} {t('per')} {currencyBase?.symbol}
            </p>
          </Box>
        )}
        <Box mt={2}>
          <Button className='v3-supply-liquidity-button' onClick={onAdd}>
            {t('confirm')}
          </Button>
        </Box>
      </Box>
    );
  };

  const pendingText = t('addingLiquidityTokens', {
    amountA: mintInfo.parsedAmounts[Field.CURRENCY_A]?.toSignificant(),
    symbolA: baseCurrency?.symbol,
    amountB: mintInfo.parsedAmounts[Field.CURRENCY_B]?.toSignificant(),
    symbolB: quoteCurrency?.symbol,
  });

  return (
    <>
      {showConfirm && (
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          isTxWrapper={
            !!attemptingTxn || !!txHash || !!addLiquidityErrorMessage
          }
          hash={txHash}
          txPending={txPending}
          content={() =>
            addLiquidityErrorMessage ? (
              <TransactionErrorContent
                onDismiss={handleDismissConfirmation}
                message={addLiquidityErrorMessage}
              />
            ) : (
              <ConfirmationModalContent
                title={t('supplyingliquidity')}
                onDismiss={handleDismissConfirmation}
                content={modalHeader}
              />
            )
          }
          pendingText={pendingText}
          modalContent={
            txPending
              ? t('submittedAddingLiquidity')
              : t('liquidityAddedSuccessfully')
          }
        />
      )}
      <Button
        className='v3-supply-liquidity-button'
        disabled={!isReady || isAmlScoreLoading}
        onClick={amountToWrap ? onWrapMatic : onAddLiquidity}
      >
        {mintInfo.presetRange?.type === Presets.OUT_OF_RANGE
          ? t('outrangeText')
          : amountToWrap
          ? wrappingETH
            ? t('wrappingMATIC', { symbol: ETHER[chainId].symbol })
            : t('wrapMATIC', { symbol: ETHER[chainId].symbol })
          : title}
      </Button>
    </>
  );
}
