import React, { useMemo } from 'react';
import { Currency } from '@uniswap/sdk-core';
import { GlobalValue } from 'constants/index';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';
import { isMobileOnly } from 'react-device-detect';
import { Bound } from 'state/mint/v3/actions';
import {
  IDerivedMintInfo,
  useActivePreset,
  useInitialUSDPrices,
} from 'state/mint/v3/hooks';
import { Presets } from 'state/mint/v3/reducer';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import './index.scss';
import { toToken } from 'constants/v3/routing';

interface IStepperNavigation {
  isEnabled: boolean;
  step: number;
  link: string;
}

interface IStepper {
  completedSteps: number[];
  stepLinks: { link: string; title: string }[];
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  mintInfo: IDerivedMintInfo;
  end: boolean;
  handleNavigation: (navigate: IStepperNavigation) => void;
  priceFormat: PriceFormats;
}

export function Stepper({
  completedSteps,
  stepLinks,
  currencyA,
  currencyB,
  mintInfo,
  end,
  handleNavigation,
  priceFormat,
}: IStepper) {
  const baseTokenUSD = useUSDCPrice(currencyA);
  const rangeTokenUSD = useUSDCPrice(currencyB);

  const initialUSDPrices = useInitialUSDPrices();
  const USDC = toToken(GlobalValue.tokens.COMMON.USDC);

  const isUSD = useMemo(() => {
    return priceFormat === PriceFormats.USD;
  }, [priceFormat]);

  const isUSDCB = useMemo(() => {
    return currencyB && currencyB.wrapped.address === USDC.address;
  }, [currencyB]);

  const isUSDCA = useMemo(() => {
    return currencyA && currencyA.wrapped.address === USDC.address;
  }, [currencyA]);

  const {
    [Bound.LOWER]: priceLower,
    [Bound.UPPER]: priceUpper,
  } = mintInfo.pricesAtTicks;

  const isSorted = useMemo(() => {
    return (
      currencyA && currencyB && currencyA.wrapped.sortsBefore(currencyB.wrapped)
    );
  }, [currencyA, currencyB]);

  const leftPrice = useMemo(() => {
    return isSorted ? priceLower : priceUpper?.invert();
  }, [isSorted, priceLower, priceUpper]);

  const rightPrice = useMemo(() => {
    return isSorted ? priceUpper : priceLower?.invert();
  }, [isSorted, priceUpper, priceLower]);

  const preset = useActivePreset();

  const steps = useMemo(() => {
    const _steps = stepLinks;

    if (!currencyA || !currencyB || !mintInfo) return _steps;

    if (currencyA && currencyB && completedSteps.length >= 1) {
      _steps[0].title = `${currencyA.symbol} / ${currencyB.symbol}`;
    }

    if (mintInfo.noLiquidity) {
      const rangeUSD =
        initialUSDPrices.CURRENCY_B || rangeTokenUSD?.toSignificant(8);

      if (mintInfo.price && rangeUSD && completedSteps.length >= 2) {
        _steps[1].title = `Initial price: 1 ${currencyA.symbol} = ${
          isUSD ? '$' : ''
        }${
          isUSD
            ? isSorted
              ? parseFloat(mintInfo.price.toSignificant(8))
              : parseFloat(
                  (
                    +mintInfo.price.invert().toSignificant(8) * +rangeUSD
                  ).toFixed(4),
                )
            : isSorted
            ? parseFloat(mintInfo.price.toSignificant(5))
            : parseFloat(mintInfo.price.invert().toSignificant(5))
        } ${isUSD ? '' : ` ${currencyB.symbol}`}`;
      }

      if (mintInfo.price && !rangeUSD && completedSteps.length >= 2) {
        _steps[1].title = `Initial price: 1 ${currencyA.symbol} = ${
          isSorted
            ? parseFloat(mintInfo.price.toSignificant(8))
            : parseFloat(mintInfo.price.invert().toSignificant(8))
        } ${currencyB.symbol}`;
      }

      if (leftPrice && rightPrice && completedSteps.length >= 3) {
        if (
          preset !== Presets.FULL &&
          rightPrice.toSignificant(5) !==
            '3384900000000000000000000000000000000000000000000'
        ) {
          _steps[2].title = `Range: ${isUSD && rangeUSD ? '$' : ''}${
            isUSD && rangeUSD && !isUSDCB
              ? (+leftPrice.toSignificant(8) * +rangeUSD)
                  .toFixed(6)
                  .slice(0, -1)
              : +leftPrice.toSignificant(8)
          } — ${isUSD && rangeUSD ? '$' : ''}${
            isUSD && rangeUSD && !isUSDCB
              ? (+rightPrice.toSignificant(8) * +rangeUSD)
                  .toFixed(6)
                  .slice(0, -1)
              : rightPrice.toSignificant(8)
          }`;
        } else {
          _steps[2].title = `Range: 0 — ∞`;
        }
      }

      if (
        baseTokenUSD &&
        rangeUSD &&
        mintInfo.parsedAmounts.CURRENCY_A &&
        mintInfo.parsedAmounts.CURRENCY_B &&
        end
      ) {
        const parsedA = parseFloat(
          String(
            Number(mintInfo.parsedAmounts.CURRENCY_A.toSignificant(5)).toFixed(
              4,
            ),
          ),
        );
        const parsedB = parseFloat(
          String(
            Number(mintInfo.parsedAmounts.CURRENCY_B.toSignificant(5)).toFixed(
              4,
            ),
          ),
        );

        let tokenA;
        let tokenB;

        if (isUSD) {
          const tokenAUSD = Number(baseTokenUSD.toSignificant(5)).toFixed(4);
          const tokenBUSD = Number(rangeUSD).toFixed(4);

          tokenA = isUSDCA
            ? parsedA
            : parseFloat((parsedA * +tokenAUSD).toFixed(4));
          tokenB = isUSDCB
            ? parsedB
            : parseFloat((parsedB * +tokenBUSD).toFixed(4));

          _steps[3].title = `Liquidity: $${tokenA + tokenB}`;
        } else {
          tokenA = parsedA;
          tokenB = parsedB;

          _steps[3].title = `Liquidity: ${tokenA} ${currencyA.symbol}, ${tokenB} ${currencyB.symbol}`;
        }
      }
    } else {
      if (leftPrice && rightPrice && completedSteps.length >= 2) {
        if (preset !== Presets.FULL) {
          _steps[1].title = `Range: ${isUSD ? '$' : ''}${
            isUSD && rangeTokenUSD && !isUSDCB
              ? (+leftPrice.toSignificant(8) * +rangeTokenUSD.toSignificant(8))
                  .toFixed(6)
                  .slice(0, -1)
              : Number(leftPrice.toSignificant(8)).toFixed(4)
          } — ${isUSD ? '$' : ''}${
            isUSD && rangeTokenUSD && !isUSDCB
              ? (+rightPrice.toSignificant(8) * +rangeTokenUSD.toSignificant(8))
                  .toFixed(6)
                  .slice(0, -1)
              : Number(rightPrice.toSignificant(8)).toFixed(4)
          }`;
        } else {
          _steps[1].title = `Range: 0 — ∞`;
        }
      }

      if (
        baseTokenUSD &&
        rangeTokenUSD &&
        mintInfo.parsedAmounts.CURRENCY_A &&
        mintInfo.parsedAmounts.CURRENCY_B &&
        end
      ) {
        const parsedA = parseFloat(
          String(
            Number(mintInfo.parsedAmounts.CURRENCY_A.toSignificant(5)).toFixed(
              4,
            ),
          ),
        );
        const parsedB = parseFloat(
          String(
            Number(mintInfo.parsedAmounts.CURRENCY_B.toSignificant(5)).toFixed(
              4,
            ),
          ),
        );

        let tokenA;
        let tokenB;

        if (isUSD) {
          const tokenAUSD = Number(baseTokenUSD.toSignificant(5)).toFixed(4);
          const tokenBUSD = Number(rangeTokenUSD.toSignificant(5)).toFixed(4);

          tokenA = isUSDCA
            ? parsedA
            : parseFloat((parsedA * +tokenAUSD).toFixed(4));
          tokenB = isUSDCB
            ? parsedB
            : parseFloat((parsedB * +tokenBUSD).toFixed(4));

          _steps[2].title = `Liquidity: $${tokenA + tokenB}`;
        } else {
          tokenA = parsedA;
          tokenB = parsedB;

          _steps[2].title = `Liquidity: ${tokenA} ${currencyA.symbol}, ${tokenB} ${currencyB.symbol}`;
        }
      }
    }

    return _steps;
  }, [
    completedSteps,
    stepLinks,
    currencyA,
    currencyB,
    mintInfo,
    isUSD,
    initialUSDPrices,
    rangeTokenUSD,
  ]);

  return (
    <div className='f w-100' style={{ justifyContent: 'space-between' }}>
      {isMobileOnly ? (
        <div className={'f f-ac f-js w-100'}>
          <div
            className={'progress-circle-wrapper'}
            style={{
              background: `conic-gradient(rgb(3, 133, 255)${(100 /
                steps.length) *
                (completedSteps.length + 1)}%,rgb(242, 242, 242)${(100 /
                steps.length) *
                (completedSteps.length + 1)}%)`,
            }}
          >
            <div className={'progress-circle fs-085'}>
              {completedSteps.length + 1} of {steps.length}
            </div>
          </div>

          <div className={'ml-1'}>
            <h3
              style={{ whiteSpace: 'break-spaces', lineHeight: '1.1rem' }}
              className={'mb-025'}
            >
              {steps[completedSteps.length]?.title}
            </h3>
            <h4 className={'fs-085 c-lg l'}>
              Next step:
              {steps[completedSteps.length + 1]
                ? steps[completedSteps.length + 1].title
                : `Finish`}
            </h4>
          </div>
        </div>
      ) : (
        steps.map((el, i) => (
          <div
            key={i}
            className={`stepper__step f f-ac ${
              completedSteps.length - 1 >= i && !end ? 'clickable' : ''
            }`}
            onClick={() =>
              handleNavigation({
                isEnabled: completedSteps.length - 1 >= i && !end,
                step: i,
                link: el.link,
              })
            }
          >
            <div
              className={`stepper__circle mr-1 f f-ac f-jc ${
                i === completedSteps.length && !end ? 'current' : ''
              } ${completedSteps.length - 1 >= i || end ? 'done' : ''} `}
            >
              {i + 1}
            </div>
            <div
              className={`${
                i === completedSteps.length && !end
                  ? 'stepper__circle-current'
                  : ''
              }`}
            >
              {el.title}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
