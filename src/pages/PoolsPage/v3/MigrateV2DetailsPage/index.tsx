import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useHistory, useParams } from 'react-router-dom';
import { ReactComponent as ArrowLeft } from 'assets/images/ArrowLeft.svg';
import { ReactComponent as ArrowDown } from 'assets/images/ArrowDown1.svg';
import { CurrencyLogo, DoubleCurrencyLogo, QuestionHelper } from 'components';
import { useActiveWeb3React } from 'hooks';
import Loader from 'components/Loader';
import { useCurrency, useToken } from 'hooks/v3/Tokens';
import './index.scss';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import { CurrencyAmount, Fraction, Percent, Price } from '@uniswap/sdk-core';
import { formatTokenAmount } from 'utils';
import {
  useV3DerivedMintInfo,
  useV3MintActionHandlers,
  useV3MintState,
} from 'state/mint/v3/hooks';
import usePrevious from 'hooks/usePrevious';
import { InitialPrice } from '../SupplyLiquidityV3/containers/InitialPrice';
import { SelectRange } from '../SupplyLiquidityV3/containers/SelectRange';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import { Field } from 'state/mint/actions';
import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { useV2LiquidityTokenPermit } from 'hooks/v3/useERC20Permit';
import {
  useIsTransactionPending,
  useTransactionAdder,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/providers';
import ReactGA from 'react-ga';
import { useV2ToV3MigratorContract } from 'hooks/useContract';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp';
import { PoolState, usePool } from 'hooks/v3/usePools';
import { useTotalSupply } from 'hooks/v3/useTotalSupply';
import { useV2Pair } from 'hooks/v3/useV2Pairs';
import { ChainId, JSBI } from '@uniswap/sdk';
import { FeeAmount, priceToClosestTick, TickMath, ZERO } from 'v3lib/utils';
import { Bound } from 'state/mint/v3/actions';
import { useUserSlippageTolerance } from 'state/user/hooks';
import { Pool, Position } from 'v3lib/entities';
import { V2Exchanges } from 'constants/v3/addresses';
import { ButtonConfirmed } from 'components/v3/Button';
import { Dots } from '../styleds';
import { useIsNetworkFailed } from 'hooks/v3/useIsNetworkFailed';
import { currencyId } from 'utils/v3/currencyId';
import { unwrappedToken } from 'utils/unwrappedToken';
import { formatCurrencyAmount } from 'utils/v3/formatCurrencyAmount';
import { ReportProblemOutlined } from '@material-ui/icons';

export default function MigrateV2DetailsPage() {
  const v2Exchange = V2Exchanges.Quickswap;
  const percentageToMigrate = 100;
  const [feeAmount, setFeeAmount] = useState(FeeAmount.MEDIUM);
  const [largePriceDiffDismissed, setLargePriceDiffDismissed] = useState(false);

  const history = useHistory();
  const params: any = useParams();
  const currencyIdA =
    params.currencyIdA === 'ETH' ? 'matic' : params.currencyIdA;
  const currencyIdB =
    params.currencyIdB === 'ETH' ? 'matic' : params.currencyIdB;

  const _currency0 = useCurrency(currencyIdA);
  const _currency1 = useCurrency(currencyIdB);

  const [, pair] = useV2Pair(
    _currency0 ?? undefined,
    _currency1 ?? undefined,
    v2Exchange,
  );

  const reserve0 = pair?.reserve0;
  const reserve1 = pair?.reserve1;

  //Pairs sort the tokens to assure a single pair is created
  //so we will use the pairs to determin the tokens
  const token0 = reserve0?.currency;
  const token1 = reserve1?.currency;

  const [poolState, pool] = usePool(token0, token1);

  const currency0 = useMemo(() => {
    if (!token0) {
      return undefined;
    }

    return unwrappedToken(token0);
  }, [token0]);
  const currency1 = useMemo(() => {
    if (!token1) {
      return undefined;
    }

    return unwrappedToken(token1);
  }, [token1]);

  const quoteCurrency =
    currency0 && currency1 && currency0.wrapped.equals(currency1.wrapped)
      ? undefined
      : currency1;
  const { account, chainId } = useActiveWeb3React();

  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair?.liquidityToken,
  );
  const totalPoolTokens = useTotalSupply(pair?.liquidityToken);
  const deadline = useTransactionDeadline(); // custom from users settings
  const blockTimestamp = useCurrentBlockTimestamp();
  const networkFailed = useIsNetworkFailed();

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    (totalPoolTokens.greaterThan(userPoolBalance) ||
      totalPoolTokens.equalTo(userPoolBalance))
      ? [
          pair.getLiquidityValue(
            pair.token0,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
          pair.getLiquidityValue(
            pair.token1,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
        ]
      : [undefined, undefined];

  const derivedMintInfo = useV3DerivedMintInfo(
    currency0 ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    currency0 ?? undefined,
    undefined,
  );
  const prevDerivedMintInfo = usePrevious({ ...derivedMintInfo });

  const mintInfo = useMemo(() => {
    if (
      (!derivedMintInfo.pool ||
        !derivedMintInfo.price ||
        derivedMintInfo.noLiquidity) &&
      prevDerivedMintInfo
    ) {
      return {
        ...prevDerivedMintInfo,
        pricesAtTicks: derivedMintInfo.pricesAtTicks,
        ticks: derivedMintInfo.ticks,
        parsedAmounts: derivedMintInfo.parsedAmounts,
      };
    }
    return {
      ...derivedMintInfo,
    };
  }, [derivedMintInfo, prevDerivedMintInfo]);

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = mintInfo.ticks;

  const { onFieldAInput, onFieldBInput } = useV3MintActionHandlers(
    mintInfo.noLiquidity,
  );

  const { independentField, typedValue } = useV3MintState();

  const formattedAmounts = {
    [independentField]: typedValue,
    [mintInfo.dependentField]:
      mintInfo.parsedAmounts[mintInfo.dependentField]?.toSignificant(6) ?? '',
  };

  useEffect(() => {
    if (
      mintInfo.ticks.LOWER &&
      mintInfo.ticks.UPPER &&
      ((!formattedAmounts[Field.CURRENCY_A] &&
        !formattedAmounts[Field.CURRENCY_B]) ||
        Number(formattedAmounts[Field.CURRENCY_A]) >
          Number(token0Deposited?.toExact() ?? '0') ||
        Number(formattedAmounts[Field.CURRENCY_B]) >
          Number(token1Deposited?.toExact() ?? '0'))
    ) {
      onFieldAInput(token0Deposited?.toExact() ?? '');
      if (
        Number(formattedAmounts[Field.CURRENCY_B]) >
        Number(token1Deposited?.toExact() ?? '0')
      ) {
        onFieldBInput(token1Deposited?.toExact() ?? '');
      }
    }
  }, [
    mintInfo.ticks.LOWER,
    mintInfo.ticks.UPPER,
    formattedAmounts[Field.CURRENCY_A],
    formattedAmounts[Field.CURRENCY_B],
  ]);

  // set up v3 pool
  const noLiquidity = poolState === PoolState.NOT_EXISTS;

  // this is just getLiquidityValue with the fee off, but for the passed pair
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

  // get spot prices + price difference
  const v2SpotPrice = useMemo(() => {
    if (!token0 || !token1 || !reserve0 || !reserve1) {
      return undefined;
    }
    return new Price(token0, token1, reserve0.quotient, reserve1.quotient);
  }, [token0, token1, reserve0, reserve1]);
  const v3SpotPrice =
    poolState === PoolState.EXISTS ? pool?.token0Price : undefined;

  let priceDifferenceFraction: Fraction | string | undefined =
    v2SpotPrice && v3SpotPrice
      ? v2SpotPrice.divide(v3SpotPrice).greaterThan(10000)
        ? '> 1000'
        : v3SpotPrice
            .divide(v2SpotPrice)
            .subtract(1)
            .multiply(100)
      : undefined;

  if (
    typeof priceDifferenceFraction !== 'string' &&
    priceDifferenceFraction?.lessThan(ZERO)
  ) {
    priceDifferenceFraction = priceDifferenceFraction.multiply(-1);
  }

  const largePriceDifference = useMemo(() => {
    if (typeof priceDifferenceFraction === 'string') {
      return true;
    }
    return (
      priceDifferenceFraction &&
      !priceDifferenceFraction?.lessThan(JSBI.BigInt(2))
    );
  }, [priceDifferenceFraction]);

  const [allowedSlippage] = useUserSlippageTolerance();
  const allowedSlippagePct = new Percent(
    JSBI.BigInt(allowedSlippage),
    JSBI.BigInt(10000),
  );

  // the v3 tick is either the pool's tickCurrent, or the tick closest to the v2 spot price
  const tick = v2SpotPrice
    ? pool?.tickCurrent ?? priceToClosestTick(v2SpotPrice)
    : undefined;
  // the price is either the current v3 price, or the price at the tick
  const sqrtPrice = tick
    ? pool?.sqrtRatioX96 ?? TickMath.getSqrtRatioAtTick(tick)
    : undefined;

  let position: Position | undefined = undefined;

  if (
    typeof tickLower === 'number' &&
    typeof tickUpper === 'number' &&
    token0 &&
    token1 &&
    v2SpotPrice &&
    tick &&
    sqrtPrice &&
    token0Value &&
    token1Value &&
    !mintInfo.invalidRange
  ) {
    position = Position.fromAmounts({
      pool: pool ?? new Pool(token0, token1, feeAmount, sqrtPrice, 0, tick, []),
      tickLower,
      tickUpper,
      amount0: token0Value.quotient,
      amount1: token1Value.quotient,
      useFullPrecision: true, // we want full precision for the theoretical position
    });
  }

  const { amount0: v3Amount0Min, amount1: v3Amount1Min } = useMemo(
    () =>
      position
        ? position.mintAmountsWithSlippage(allowedSlippagePct)
        : {
            amount0: undefined,
            amount1: undefined,
          },
    [position, allowedSlippagePct],
  );

  const refund0 = useMemo(() => {
    if (!token0 || !token0Value) {
      return;
    }

    return (
      position &&
      CurrencyAmount.fromRawAmount(
        token0,
        JSBI.subtract(token0Value.quotient, position.amount0.quotient),
      )
    );
  }, [token0Value, position, token0]);
  const refund1 = useMemo(() => {
    if (!token1 || !token1Value) {
      return;
    }

    return (
      position &&
      CurrencyAmount.fromRawAmount(
        token1,
        JSBI.subtract(token1Value.quotient, position.amount1.quotient),
      )
    );
  }, [token1Value, position, token1]);

  const [confirmingMigration, setConfirmingMigration] = useState<boolean>(
    false,
  );
  const [pendingMigrationHash, setPendingMigrationHash] = useState<
    string | null
  >(null);

  const migrator = useV2ToV3MigratorContract();

  // approvals
  const [approval, approveManually] = useApproveCallback(
    userPoolBalance,
    migrator?.address,
  );
  const { signatureData, gatherPermitSignature } = useV2LiquidityTokenPermit(
    userPoolBalance,
    migrator?.address,
  );

  const approve = useCallback(async () => {
    // sushi has to be manually approved
    await approveManually();
  }, [gatherPermitSignature, approveManually]);

  const addTransaction = useTransactionAdder();
  const isMigrationPending = useIsTransactionPending(
    pendingMigrationHash ?? undefined,
  );

  const migrate = useCallback(() => {
    if (
      !migrator ||
      !account ||
      !deadline ||
      !blockTimestamp ||
      typeof tickLower !== 'number' ||
      typeof tickUpper !== 'number' ||
      !v3Amount0Min ||
      !v3Amount1Min ||
      !token0 ||
      !token1 ||
      !currency0 ||
      !currency1 ||
      !userPoolBalance ||
      !sqrtPrice ||
      !chainId
    ) {
      return;
    }
    const deadlineToUse = signatureData?.deadline ?? deadline;

    const data: string[] = [];

    // permit if necessary
    if (signatureData) {
      data.push(
        //@ts-ignore
        migrator.interface.encodeFunctionData('selfPermit', [
          pair?.liquidityToken.address,
          `0x${userPoolBalance.quotient.toString(16)}`,
          deadlineToUse,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]),
      );
    }

    // create/initialize pool if necessary
    if (noLiquidity) {
      data.push(
        //@ts-ignore
        migrator.interface.encodeFunctionData(
          'createAndInitializePoolIfNecessary',
          [token0.address, token1.address, `0x${sqrtPrice.toString(16)}`],
        ),
      );
    }

    // TODO could save gas by not doing this in multicall
    data.push(
      //@ts-ignore
      migrator.interface.encodeFunctionData('migrate', [
        {
          pair: pair?.liquidityToken.address,
          liquidityToMigrate: `0x${userPoolBalance.quotient.toString(16)}`,
          percentageToMigrate,
          token0: token0.address,
          token1: token1.address,
          tickLower,
          tickUpper,
          amount0Min: `0x${v3Amount0Min.toString(16)}`,
          amount1Min: `0x${v3Amount1Min.toString(16)}`,
          recipient: account,
          deadline: deadlineToUse,
          refundAsNative: false, // hard-code this for now
        },
      ]),
    );

    setConfirmingMigration(true);

    migrator.estimateGas
      .multicall(data)
      .then(() => {
        return migrator
          .multicall(data, { gasLimit: 10000000 })
          .then((response: TransactionResponse) => {
            ReactGA.event({
              category: 'Migrate',
              action: `${v2Exchange}-> Quickswap V3`,
              label: `${currency0.symbol}/${currency1.symbol}`,
            });

            addTransaction(response, {
              //@ts-ignore
              type: TransactionType.MIGRATE_LIQUIDITY_V3,
              baseCurrencyId: currencyId(currency0, ChainId.MATIC),
              quoteCurrencyId: currencyId(currency1, ChainId.MATIC),
            });
            setPendingMigrationHash(response.hash);
          });
      })
      .catch(() => {
        setConfirmingMigration(false);
      });
  }, [
    chainId,
    migrator,
    noLiquidity,
    blockTimestamp,
    token0,
    token1,
    feeAmount,
    userPoolBalance,
    tickLower,
    tickUpper,
    sqrtPrice,
    v3Amount0Min,
    v3Amount1Min,
    account,
    deadline,
    signatureData,
    addTransaction,
    pair,
    currency0,
    currency1,
  ]);

  const isSuccessfullyMigrated =
    !!pendingMigrationHash &&
    userPoolBalance &&
    JSBI.equal(userPoolBalance.quotient, ZERO);

  return (
    <>
      <Box className='wrapper' maxWidth='464px' width='100%'>
        <Box className='flex justify-between items-center'>
          <Box
            className='flex cursor-pointer'
            onClick={() => history.push('/migrate')}
          >
            <ArrowLeft />
          </Box>
          <p className='weight-600'>Migrate V2 Liquidity</p>
          <Box
            width={28}
            height={28}
            className='flex items-center justify-center'
          >
            <QuestionHelper size={24} className='text-secondary' text='' />
          </Box>
        </Box>
        <Box mt={3}>
          <small>
            This tool will safely migrate your V2 liquidity to V3. The process
            is completely trust-less thanks to{' '}
            <small className='text-primary'>Quickswap migration contract</small>
          </small>
        </Box>
        <Box mt={3} className='v3-migrate-details-box'>
          <Box className='flex items-center'>
            <DoubleCurrencyLogo
              currency0={currency0 ?? undefined}
              currency1={currency1 ?? undefined}
              size={24}
            />
            <p className='weight-600' style={{ marginLeft: 6 }}>
              {currency0?.symbol}-{currency1?.symbol} LP (V2)
            </p>
          </Box>
          <Box mt={3} className='v3-migrate-details-row'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency0 ?? undefined} size='20px' />
              <p>{currency0?.symbol}</p>
            </Box>
            <p>{`${
              token0Deposited ? formatCurrencyAmount(token0Deposited, 4) : ''
            }`}</p>
          </Box>
          <Box mt={1.5} className='v3-migrate-details-row'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency1 ?? undefined} size='20px' />
              <p>{currency1?.symbol}</p>
            </Box>
            <p>{`${
              token1Deposited ? formatCurrencyAmount(token1Deposited, 4) : ''
            }`}</p>
          </Box>
        </Box>
        <Box my={2} className='flex justify-center'>
          <ArrowDown />
        </Box>
        <Box className='flex items-center' mb={3}>
          <DoubleCurrencyLogo
            currency0={currency0 ?? undefined}
            currency1={currency1 ?? undefined}
            size={24}
          />
          <p className='weight-600' style={{ marginLeft: 6 }}>
            {currency0?.symbol}-{currency1?.symbol} LP (V3)
          </p>
        </Box>
        {mintInfo.noLiquidity && currency0 && quoteCurrency && (
          <Box mb={2}>
            <InitialPrice
              currencyA={currency0 ?? undefined}
              currencyB={currency1 ?? undefined}
              mintInfo={mintInfo}
              priceFormat={PriceFormats.TOKEN}
            />
          </Box>
        )}
        <SelectRange
          currencyA={currency0}
          currencyB={quoteCurrency}
          mintInfo={mintInfo}
          priceFormat={PriceFormats.TOKEN}
        />
        <Box mt={2} className='v3-migrate-details-box'>
          <Box className='v3-migrate-details-row'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency0 ?? undefined} size='20px' />
              <p>{currency0?.symbol}</p>
            </Box>
            {v3Amount0Min !== undefined ? (
              <p>{v3Amount0Min.toLocaleString()}</p>
            ) : mintInfo.ticks.LOWER && mintInfo.ticks.UPPER ? (
              <Loader stroke='white' size='24px' />
            ) : (
              <></>
            )}
          </Box>
          <Box mt={1.5} className='v3-migrate-details-row'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency1 ?? undefined} size='20px' />
              <p>{currency1?.symbol}</p>
            </Box>
            {v3Amount1Min !== undefined ? (
              <p>{v3Amount1Min.toLocaleString()}</p>
            ) : mintInfo.ticks.LOWER && mintInfo.ticks.UPPER ? (
              <Loader stroke='white' size='24px' />
            ) : (
              <></>
            )}
          </Box>
          {v3Amount0Min !== undefined &&
            v3Amount1Min !== undefined &&
            refund0 &&
            refund1 && (
              <Box mt={1.5}>
                <small className='text-secondary'>
                  Due to the selected price range at least{' '}
                  {`${formatCurrencyAmount(refund0, 4)} ${
                    currency0?.symbol
                  } and `}
                  {`${formatCurrencyAmount(refund1, 4)} ${currency1?.symbol} `}
                  will be refunded to your wallet
                </small>
              </Box>
            )}
        </Box>
        <Box>
          {largePriceDifference && !largePriceDiffDismissed && (
            <Box className='pool-range-chart-warning border-yellow5'>
              <Box width={1} className='flex items-center'>
                <Box className='pool-range-chart-warning-icon'>
                  <ReportProblemOutlined />
                </Box>
                <small>Large Price Difference</small>
              </Box>
              <Box width={1} mt={1} mb={1.5}>
                <span>
                  You should only deposit liquidity into Quickswap at a price
                  you believe is correct. <br />
                  If the price seems incorrect, you can either make a swap to
                  move the price or wait for someone else to do so.
                </span>
              </Box>
              <button onClick={() => setLargePriceDiffDismissed(true)}>
                I understand
              </button>
            </Box>
            // <YellowCard>
            //   <AutoColumn gap='8px'>
            //     <RowBetween>
            //       <TYPE.body fontSize={14}>
            //         {_isNotUniswap ? 'SushiSwap' : 'QuickSwap'}{' '}
            //         {invertPrice ? currency1.symbol : currency0.symbol} Price:
            //       </TYPE.body>
            //       <TYPE.black fontSize={14}>
            //         {invertPrice
            //           ? `${v2SpotPrice?.invert()?.toSignificant(6)} ${
            //               currency0.symbol
            //             }`
            //           : `${v2SpotPrice?.toSignificant(6)} ${currency1.symbol}`}
            //       </TYPE.black>
            //     </RowBetween>

            //     <RowBetween>
            //       <TYPE.body fontSize={14}>{`Quickswap ${
            //         invertPrice ? currency1.symbol : currency0.symbol
            //       } Price:`}</TYPE.body>
            //       <TYPE.black fontSize={14}>
            //         {invertPrice
            //           ? `${v3SpotPrice?.invert()?.toSignificant(6)} ${
            //               currency0.symbol
            //             }`
            //           : `${
            //               Number(v3SpotPrice?.toSignificant(6)) < 0.0001
            //                 ? '< 0.0001'
            //                 : v3SpotPrice?.toSignificant(6)
            //             } ${currency1.symbol}`}
            //       </TYPE.black>
            //     </RowBetween>

            //     <RowBetween>
            //       <TYPE.body fontSize={14} color='inherit'>
            //         Price Difference:
            //       </TYPE.body>
            //       <TYPE.black fontSize={14} color='inherit'>
            //         {`${
            //           typeof priceDifferenceFraction !== 'string'
            //             ? priceDifferenceFraction?.toSignificant(4)
            //             : priceDifferenceFraction
            //         }%`}
            //       </TYPE.black>
            //     </RowBetween>
            //   </AutoColumn>
            //   <TYPE.body
            //     fontSize={14}
            //     style={{ marginTop: 8, fontWeight: 400 }}
            //   >
            //   </TYPE.body>
            // </YellowCard>
          )}
        </Box>
        <Box mt={3}>
          <ButtonConfirmed
            className='v3-migrate-details-button'
            confirmed={
              approval === ApprovalState.APPROVED || signatureData !== null
            }
            disabled={
              approval !== ApprovalState.NOT_APPROVED ||
              signatureData !== null ||
              !v3Amount0Min ||
              !v3Amount1Min ||
              mintInfo.invalidRange ||
              confirmingMigration
            }
            onClick={approve}
          >
            {approval === ApprovalState.PENDING ? (
              <Dots>Approving</Dots>
            ) : approval === ApprovalState.APPROVED ||
              signatureData !== null ? (
              <span>Allowed</span>
            ) : (
              <span>Allow LP token migration</span>
            )}
          </ButtonConfirmed>
        </Box>
        <Box mt={2}>
          <ButtonConfirmed
            className='v3-migrate-details-button'
            disabled={
              !v3Amount0Min ||
              !v3Amount1Min ||
              mintInfo.invalidRange ||
              (approval !== ApprovalState.APPROVED && signatureData === null) ||
              confirmingMigration ||
              isMigrationPending ||
              (largePriceDifference && !largePriceDiffDismissed)
            }
            //@ts-ignore
            as={isSuccessfullyMigrated ? Link : null}
            to={`/pool`}
            //@ts-ignore
            onClick={isSuccessfullyMigrated ? null : migrate}
          >
            {isSuccessfullyMigrated ? (
              `Success! View pools`
            ) : isMigrationPending ? (
              <Dots>Migrating</Dots>
            ) : networkFailed ? (
              <span>Connecting to network...</span>
            ) : (
              <span>Migrate</span>
            )}
          </ButtonConfirmed>
        </Box>
      </Box>
    </>
  );
}
