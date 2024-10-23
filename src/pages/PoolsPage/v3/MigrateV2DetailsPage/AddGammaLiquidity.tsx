import React, { useMemo, useState } from 'react';
import './index.scss';
import { useTranslation } from 'react-i18next';
import { useActivePreset, useV3DerivedMintInfo } from 'state/mint/v3/hooks';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { ETHER, JSBI, Token, WETH } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { Box, Button } from '@material-ui/core';
import { tryParseAmount } from 'state/swap/v3/hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { CurrencyLogo } from 'components';
import { useGammaUNIProxyContract, useWETHContract } from 'hooks/useContract';
import { useSingleContractMultipleData } from 'state/multicall/v3/hooks';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { formatCurrencyAmount } from 'utils/v3/formatCurrencyAmount';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { calculateGasMargin, getGammaPairsForTokens } from 'utils';
import { TransactionType } from 'models/enums';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { ETHER as ETHER_CURRENCY } from 'constants/v3/addresses';

const AddGammaLiquidity: React.FC<{
  token0Value: CurrencyAmount<Currency> | undefined;
  token1Value: CurrencyAmount<Currency> | undefined;
  showAdd: boolean;
  onLiquidityAdded?: () => void;
}> = ({ token0Value, token1Value, showAdd, onLiquidityAdded }) => {
  const { t } = useTranslation();
  const mintInfo = useV3DerivedMintInfo();
  const [wrappingETH, setWrappingETH] = useState(false);
  const [addingLiquidity, setAddingLiquidity] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const preset = useActivePreset();
  const { chainId, account } = useActiveWeb3React();
  const token0 = token0Value?.currency.wrapped;
  const token1 = token1Value?.currency.wrapped;
  const gammaPairData = getGammaPairsForTokens(
    chainId,
    token0?.address,
    token1?.address,
    mintInfo.feeAmount,
  );
  const gammaPair = gammaPairData?.pairs ?? [];
  const gammaPairReverted = gammaPairData?.reversed;
  const gammaPairAddress = gammaPair
    ? gammaPair.find((pair) => pair.type === preset)?.address
    : undefined;

  const [approvalA, approveACallback] = useApproveCallback(
    token0Value || tryParseAmount('1', token0 ?? undefined),
    chainId ? gammaPairAddress : undefined,
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    token1Value || tryParseAmount('1', token1 ?? undefined),
    chainId ? gammaPairAddress : undefined,
  );
  const showApprovalA = useMemo(() => {
    if (approvalA === ApprovalState.UNKNOWN) return undefined;

    if (approvalA === ApprovalState.NOT_APPROVED) return true;

    return approvalA !== ApprovalState.APPROVED;
  }, [approvalA]);
  const showApprovalB = useMemo(() => {
    if (approvalB === ApprovalState.UNKNOWN) return undefined;

    if (approvalB === ApprovalState.NOT_APPROVED) return true;

    return approvalB !== ApprovalState.APPROVED;
  }, [approvalB]);

  const gammaUNIPROXYContract = useGammaUNIProxyContract(gammaPairAddress);
  const gammaTokens = token0 && token1 ? [token0, token1] : [];
  const depositAmountsData = useSingleContractMultipleData(
    gammaPairAddress && gammaTokens.length > 0
      ? gammaUNIPROXYContract
      : undefined,
    'getDepositAmount',
    gammaPairAddress
      ? gammaTokens.map((token) => [
          gammaPairAddress,
          token.address,
          parseUnits('1', token.decimals),
        ])
      : [],
  );

  const gammaToken0 = gammaPairReverted ? token1 : token0;
  const gammaToken1 = gammaPairReverted ? token0 : token1;
  const gammaToken0Value = gammaPairReverted ? token1Value : token0Value;
  const gammaToken1Value = gammaPairReverted ? token0Value : token1Value;
  const quoteDepositAmount = useMemo(() => {
    if (
      depositAmountsData.length > 0 &&
      !depositAmountsData[0].loading &&
      depositAmountsData[0].result &&
      depositAmountsData[0].result.length > 1 &&
      gammaToken1
    ) {
      return {
        amountMin: Number(
          formatUnits(depositAmountsData[0].result[0], gammaToken1.decimals),
        ),
        amountMax: Number(
          formatUnits(depositAmountsData[0].result[1], gammaToken1.decimals),
        ),
      };
    }
    return;
  }, [gammaToken1, depositAmountsData]);

  const baseDepositAmount = useMemo(() => {
    if (
      depositAmountsData.length > 1 &&
      !depositAmountsData[1].loading &&
      depositAmountsData[1].result &&
      depositAmountsData[1].result.length > 1 &&
      gammaToken0
    ) {
      return {
        amountMin: Number(
          formatUnits(depositAmountsData[1].result[0], gammaToken0.decimals),
        ),
        amountMax: Number(
          formatUnits(depositAmountsData[1].result[1], gammaToken0.decimals),
        ),
      };
    }
    return;
  }, [gammaToken0, depositAmountsData]);

  const gammaAmounts = useMemo(() => {
    if (
      !quoteDepositAmount ||
      !baseDepositAmount ||
      !gammaToken0 ||
      !gammaToken1 ||
      !gammaToken0Value ||
      !gammaToken1Value
    )
      return;

    const quoteDeposit = parseUnits(
      (
        ((quoteDepositAmount.amountMin + quoteDepositAmount.amountMax) / 2) *
        Number(gammaToken0Value.toExact())
      ).toFixed(gammaToken1.decimals),
      gammaToken1.decimals,
    );
    const token1Deposit = CurrencyAmount.fromRawAmount(
      gammaToken1,
      JSBI.BigInt(quoteDeposit),
    );
    const baseDeposit = parseUnits(
      (
        ((baseDepositAmount.amountMin + baseDepositAmount.amountMax) / 2) *
        Number(gammaToken1Value.toExact())
      ).toFixed(gammaToken0.decimals),
      gammaToken0.decimals,
    );
    const token0Deposit = CurrencyAmount.fromRawAmount(
      gammaToken0,
      JSBI.BigInt(baseDeposit),
    );

    if (token1Deposit.greaterThan(gammaToken1Value)) {
      return { token0: token0Deposit, token1: gammaToken1Value };
    }
    return { token0: gammaToken0Value, token1: token1Deposit };
  }, [
    baseDepositAmount,
    gammaToken0,
    gammaToken0Value,
    gammaToken1,
    gammaToken1Value,
    quoteDepositAmount,
  ]);

  const refundAmounts = useMemo(() => {
    if (!gammaAmounts || !token0Value || !token1Value) return;
    return {
      token0: token0Value.subtract(gammaAmounts.token0),
      token1: token1Value.subtract(gammaAmounts.token1),
    };
  }, [gammaAmounts, token0Value, token1Value]);

  const wmaticBalance = useCurrencyBalance(
    account ?? undefined,
    chainId ? WETH[chainId] : undefined,
  );

  const amountToWrap = useMemo(() => {
    if (!gammaToken0 || !gammaToken1 || !gammaAmounts || !chainId) return;
    if (
      gammaToken0.address.toLowerCase() === WETH[chainId].address.toLowerCase()
    ) {
      if (
        wmaticBalance &&
        JSBI.greaterThan(gammaAmounts.token0.numerator, wmaticBalance.numerator)
      ) {
        return JSBI.subtract(
          gammaAmounts.token0.numerator,
          wmaticBalance.numerator,
        );
      }
      return;
    } else if (
      gammaToken1.address.toLowerCase() === WETH[chainId].address.toLowerCase()
    ) {
      if (
        wmaticBalance &&
        JSBI.greaterThan(gammaAmounts.token1.numerator, wmaticBalance.numerator)
      ) {
        return JSBI.subtract(
          gammaAmounts.token1.numerator,
          wmaticBalance.numerator,
        );
      }
      return;
    }
    return;
  }, [chainId, gammaAmounts, gammaToken0, gammaToken1, wmaticBalance]);

  const wethContract = useWETHContract();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  async function onWrapMatic() {
    if (!chainId || !account || !wethContract || !amountToWrap) return;

    setWrappingETH(true);
    setErrorMessage('');
    try {
      const wrapEstimateGas = await wethContract.estimateGas.deposit({
        value: `0x${amountToWrap.toString(16)}`,
      });
      const wrapResponse: TransactionResponse = await wethContract.deposit({
        gasLimit: calculateGasMargin(wrapEstimateGas),
        value: `0x${amountToWrap.toString(16)}`,
      });
      const summary = `Wrap ${formatUnits(
        amountToWrap.toString(),
        18,
      )} ETH to WETH`;
      addTransaction(wrapResponse, {
        summary,
        type: TransactionType.WRAP,
        tokens: [Token.ETHER[chainId]],
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

  console.log('gammaToken0', gammaToken0);

  async function onAddLiquidity() {
    if (!chainId || !account) return;

    if (
      !gammaToken0 ||
      !gammaToken1 ||
      !gammaUNIPROXYContract ||
      !gammaAmounts ||
      !gammaPairAddress
    ) {
      return;
    }

    setAddingLiquidity(true);
    setErrorMessage('');
    try {
      const estimatedGas = await gammaUNIPROXYContract.estimateGas.deposit(
        gammaAmounts.token0.numerator.toString(),
        gammaAmounts.token1.numerator.toString(),
        account,
        gammaPairAddress,
        [0, 0, 0, 0],
      );
      const response: TransactionResponse = await gammaUNIPROXYContract.deposit(
        gammaAmounts.token0.numerator.toString(),
        gammaAmounts.token1.numerator.toString(),
        account,
        gammaPairAddress,
        [0, 0, 0, 0],
        {
          gasLimit: calculateGasMargin(estimatedGas),
        },
      );
      const summary = t('addLiquidityWithTokens', {
        symbolA: gammaToken0?.symbol,
        symbolB: gammaToken1?.symbol,
      });
      addTransaction(response, {
        summary,
        type: TransactionType.ADDED_LIQUIDITY,
        tokens: [gammaToken0.address, gammaToken1.address],
      });
      const receipt = await response.wait();
      finalizedTransaction(receipt, {
        summary,
      });
      setAddingLiquidity(false);
      if (onLiquidityAdded) {
        onLiquidityAdded();
      }
    } catch (error) {
      console.error('Failed to send transaction', error);
      const errorMsg =
        error && error.message
          ? error.message.toLowerCase()
          : error && error.data && error.data.message
          ? error.data.message.toLowerCase()
          : '';
      setAddingLiquidity(false);
      setErrorMessage(
        errorMsg.indexOf('improper ratio') > -1
          ? t('gammaImproperRatio')
          : errorMsg.indexOf('price change overflow') > -1
          ? t('gammaPriceOverflow')
          : error?.code === 4001 || error?.code === 'ACTION_REJECTED'
          ? t('txRejected')
          : t('errorInTx'),
      );
    }
  }

  return (
    <>
      <Box mt={2} className='v3-migrate-details-box'>
        <Box className='v3-migrate-details-row'>
          <Box className='flex items-center'>
            <CurrencyLogo currency={token0 ?? undefined} size='20px' />
            <p>{token0?.symbol}</p>
          </Box>
          {gammaAmounts && <p>{gammaAmounts.token0.toSignificant()}</p>}
        </Box>
        <Box mt={1.5} className='v3-migrate-details-row'>
          <Box className='flex items-center'>
            <CurrencyLogo currency={token1 ?? undefined} size='20px' />
            <p>{token1?.symbol}</p>
          </Box>
          {gammaAmounts && <p>{gammaAmounts.token1.toSignificant()}</p>}
        </Box>
        {refundAmounts && (
          <Box mt={1.5}>
            <small className='text-secondary'>
              {t('migrateRefundComment', {
                amount1: formatCurrencyAmount(refundAmounts.token0, 4),
                symbol1: token0?.symbol,
                amount2: formatCurrencyAmount(refundAmounts.token1, 4),
                symbol2: token1?.symbol,
              })}
            </small>
          </Box>
        )}
      </Box>
      <Box mt={2} className='flex justify-between'>
        {showApprovalA !== undefined && (
          <Box width={showApprovalB === undefined ? '100%' : '49%'}>
            {showApprovalA ? (
              approvalA === ApprovalState.PENDING ? (
                <Button className='v3-migrate-details-button' disabled>
                  {t('approving')} {token0?.symbol}
                  <span className='loadingDots' />
                </Button>
              ) : (
                <Button
                  className='v3-migrate-details-button'
                  onClick={approveACallback}
                >
                  {t('approve')} {token0?.symbol}
                </Button>
              )
            ) : (
              <Button className='v3-migrate-details-button' disabled>
                {t('approved')} {token0?.symbol}
              </Button>
            )}
          </Box>
        )}
        {showApprovalB !== undefined && (
          <Box width={showApprovalA === undefined ? '100%' : '49%'}>
            {showApprovalB ? (
              approvalB === ApprovalState.PENDING ? (
                <Button className='v3-migrate-details-button' disabled>
                  {t('approving')} {token1?.symbol}
                  <span className='loadingDots' />
                </Button>
              ) : (
                <Button
                  className='v3-migrate-details-button'
                  onClick={approveBCallback}
                >
                  {t('approve')} {token1?.symbol}
                </Button>
              )
            ) : (
              <Button className='v3-migrate-details-button' disabled>
                {t('approved')} {token1?.symbol}
              </Button>
            )}
          </Box>
        )}
      </Box>
      {showAdd &&
        approvalA === ApprovalState.APPROVED &&
        approvalB === ApprovalState.APPROVED && (
          <Box mt={2}>
            <Button
              className='v3-migrate-details-button'
              onClick={amountToWrap ? onWrapMatic : onAddLiquidity}
              disabled={wrappingETH || addingLiquidity}
            >
              {amountToWrap
                ? wrappingETH
                  ? t('wrappingMATIC', { symbol: ETHER[chainId].symbol })
                  : t('wrapMATIC', { symbol: ETHER[chainId].symbol })
                : addingLiquidity
                ? t('addingLiquidity')
                : t('addLiquidity')}
            </Button>
            {errorMessage && (
              <Box mt={1}>
                <p className='text-center text-error'>{errorMessage}</p>
              </Box>
            )}
          </Box>
        )}
    </>
  );
};

export default AddGammaLiquidity;
