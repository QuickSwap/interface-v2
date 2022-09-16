import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useHistory, useParams } from 'react-router-dom';
import { ReactComponent as ArrowLeft } from 'assets/images/ArrowLeft.svg';
import { ReactComponent as ArrowDown } from 'assets/images/ArrowDown1.svg';
import { CurrencyLogo, DoubleCurrencyLogo, QuestionHelper } from 'components';
import { useActiveWeb3React } from 'hooks';
import Loader from 'components/Loader';
import { Trans } from 'react-i18next';
import { useCurrency } from 'hooks/Tokens';
import { useCurrency as useV3Currency } from 'hooks/v3/Tokens';
import './index.scss';
import { usePair } from 'data/Reserves';
import { useTokenBalance } from 'state/wallet/hooks';
import { useTotalSupply } from 'data/TotalSupply';
import { JSBI } from '@uniswap/sdk';
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

export default function MigrateV2DetailsPage() {
  const history = useHistory();
  const params: any = useParams();
  const currency0 = useCurrency(params.currencyIdA);
  const currency1 = useCurrency(params.currencyIdB);
  const baseCurrency = useV3Currency(
    params.currencyIdA === 'ETH' ? 'matic' : params.currencyIdA,
  );
  const currencyB = useV3Currency(
    params.currencyIdB === 'ETH' ? 'matic' : params.currencyIdB,
  );
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped)
      ? undefined
      : currencyB;
  const { account } = useActiveWeb3React();
  const [, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined);

  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair?.liquidityToken,
  );
  const totalPoolTokens = useTotalSupply(pair?.liquidityToken);

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
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

  const feeAmount = 100;

  const derivedMintInfo = useV3DerivedMintInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
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

  const { onFieldAInput, onFieldBInput } = useV3MintActionHandlers(
    mintInfo.noLiquidity,
  );

  const { independentField, typedValue } = useV3MintState();

  const formattedAmounts = {
    [independentField]: typedValue,
    [mintInfo.dependentField]:
      mintInfo.parsedAmounts[mintInfo.dependentField]?.toSignificant(6) ?? '',
  };

  const [v3Amount0, setV3Amount0] = useState<number | undefined>(undefined);
  const [v3Amount1, setV3Amount1] = useState<number | undefined>(undefined);

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

    if (
      formattedAmounts[Field.CURRENCY_A] &&
      formattedAmounts[Field.CURRENCY_B] &&
      Number(formattedAmounts[Field.CURRENCY_A]) <=
        Number(token0Deposited?.toExact() ?? '0') &&
      Number(formattedAmounts[Field.CURRENCY_B]) <=
        Number(token1Deposited?.toExact() ?? '0')
    ) {
      setV3Amount0(Number(formattedAmounts[Field.CURRENCY_A]));
      setV3Amount1(Number(formattedAmounts[Field.CURRENCY_B]));
    }
  }, [
    mintInfo.ticks.LOWER,
    mintInfo.ticks.UPPER,
    formattedAmounts[Field.CURRENCY_A],
    formattedAmounts[Field.CURRENCY_B],
  ]);

  const refundAmount0 =
    Number(token0Deposited?.toExact() ?? '0') - (v3Amount0 ?? 0);

  const refundAmount1 =
    Number(token1Deposited?.toExact() ?? '0') - (v3Amount1 ?? 0);

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
            <p>{formatTokenAmount(token0Deposited)}</p>
          </Box>
          <Box mt={1.5} className='v3-migrate-details-row'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency1 ?? undefined} size='20px' />
              <p>{currency1?.symbol}</p>
            </Box>
            <p>{formatTokenAmount(token1Deposited)}</p>
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
        {mintInfo.noLiquidity && baseCurrency && quoteCurrency && (
          <Box mb={2}>
            <InitialPrice
              currencyA={baseCurrency ?? undefined}
              currencyB={currencyB ?? undefined}
              mintInfo={mintInfo}
              priceFormat={PriceFormats.TOKEN}
            />
          </Box>
        )}
        <SelectRange
          currencyA={baseCurrency}
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
            {v3Amount0 !== undefined ? (
              <p>{v3Amount0.toLocaleString()}</p>
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
            {v3Amount1 !== undefined ? (
              <p>{v3Amount1.toLocaleString()}</p>
            ) : mintInfo.ticks.LOWER && mintInfo.ticks.UPPER ? (
              <Loader stroke='white' size='24px' />
            ) : (
              <></>
            )}
          </Box>
          {v3Amount0 !== undefined &&
            v3Amount1 !== undefined &&
            (refundAmount0 > 0 || refundAmount1 > 0) && (
              <Box mt={1.5}>
                <small className='text-secondary'>
                  At least{' '}
                  {refundAmount0 > 0
                    ? `${refundAmount0.toLocaleString()} ${currency0?.symbol}`
                    : ''}{' '}
                  {refundAmount0 > 0 && refundAmount1 > 0 ? ' and ' : ''}
                  {refundAmount1 > 0
                    ? `${refundAmount1.toLocaleString()} ${currency1?.symbol}`
                    : ''}{' '}
                  will be refunded to your wallet due to selected price range
                </small>
              </Box>
            )}
        </Box>
        <Box mt={3}>
          <Button className='v3-migrate-details-button'>
            Allow LP token migration
          </Button>
        </Box>
        <Box mt={2}>
          <Button disabled className='v3-migrate-details-button'>
            Migrate
          </Button>
        </Box>
      </Box>
    </>
  );
}
