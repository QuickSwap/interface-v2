import React, { useMemo, useEffect, useState } from 'react';
import { Currency } from '@uniswap/sdk-core';
import { PoolStats } from '../PoolStats';
import { IDerivedMintInfo, useV3MintActionHandlers } from 'state/mint/v3/hooks';
import { Presets } from 'state/mint/v3/reducer';
import { Box } from '@material-ui/core';
import { PoolState } from 'hooks/v3/usePools';
import Loader from 'components/Loader';
import { fetchPoolsAPR } from 'utils/api';
import { computePoolAddress } from 'v3lib/utils/computePoolAddress';
import {
  POOL_DEPLOYER_ADDRESS,
  UNI_V3_FACTORY_ADDRESS,
} from 'constants/v3/addresses';
import GammaPairABI from 'constants/abis/gamma-hypervisor.json';
import PoolABI from 'constants/abis/v3/pool.json';
import './index.scss';
import { useActiveWeb3React } from 'hooks';
import { Interface } from 'ethers/lib/utils';
import { useTranslation } from 'react-i18next';
import { useMultipleContractSingleData } from 'state/multicall/hooks';
import { GlobalConst, unipilotVaultTypes } from 'constants/index';
import { TickMath } from 'v3lib/utils';
import { SteerVault } from 'hooks/v3/useSteerData';
import { calculatePositionWidth, percentageToMultiplier } from 'utils';

export interface IPresetArgs {
  type: Presets;
  min: number;
  max: number;
  address?: string;
  isReversed?: boolean;
  title?: string;
  risk?: PresetProfits;
  tokenStr?: string;
}

interface IPresetRanges {
  mintInfo: IDerivedMintInfo;
  baseCurrency: Currency | null | undefined;
  quoteCurrency: Currency | null | undefined;
  isStablecoinPair: boolean;
  activePreset: Presets | null;
  handlePresetRangeSelection: (preset: IPresetArgs | null) => void;
  priceLower: string | undefined;
  priceUpper: string | undefined;
  price: string | undefined;
  gammaPair?: { address: string; title: string; type: Presets }[];
  isGamma?: boolean;
  unipilotPairs?: any[];
  isUnipilot?: boolean;
  defiedgeStrategies?: {
    id: string;
    token0: string;
    token1: string;
    pool: string;
    tickLower: any;
    tickUpper: any;
  }[];
  isDefiedge?: boolean;
  isSteer?: boolean;
  steerPairs?: SteerVault[];
  isAlgebraIntegral?: boolean;
}

enum PresetProfits {
  VERY_LOW,
  LOW,
  MEDIUM,
  HIGH,
}

export function PresetRanges({
  mintInfo,
  baseCurrency,
  quoteCurrency,
  isStablecoinPair,
  activePreset,
  handlePresetRangeSelection,
  priceLower,
  price,
  priceUpper,
  isGamma = false,
  gammaPair,
  isUnipilot = false,
  unipilotPairs,
  isDefiedge = false,
  defiedgeStrategies,
  isSteer = false,
  isAlgebraIntegral = false,
  steerPairs,
}: IPresetRanges) {
  const { chainId } = useActiveWeb3React();
  const { onChangePresetRange } = useV3MintActionHandlers(mintInfo.noLiquidity);
  const { t } = useTranslation();
  const [aprs, setAprs] = useState<undefined | { [key: string]: number }>();

  useEffect(() => {
    if (!chainId) return;
    fetchPoolsAPR(chainId).then(setAprs);
  }, [chainId]);

  const gammaPairAddresses = gammaPair
    ? gammaPair.map((pair) => pair.address)
    : [];

  const gammaBaseLowerData = useMultipleContractSingleData(
    gammaPairAddresses,
    new Interface(GammaPairABI),
    'limitLower',
  );

  const gammaBaseUpperData = useMultipleContractSingleData(
    gammaPairAddresses,
    new Interface(GammaPairABI),
    'limitUpper',
  );

  const gammaCurrentTickData = useMultipleContractSingleData(
    gammaPairAddresses,
    new Interface(GammaPairABI),
    'currentTick',
  );

  const uniPilotCurrentTickData = useMultipleContractSingleData(
    unipilotPairs?.map((pair) => pair.poolAddress) ?? [],
    new Interface(PoolABI),
    'globalState',
  );

  const defiedgeCurrentTickData = useMultipleContractSingleData(
    defiedgeStrategies?.map((strategy) => strategy.pool) ?? [],
    new Interface(PoolABI),
    'globalState',
  );

  const gammaBaseLowers = gammaBaseLowerData.map((callData) => {
    if (!callData.loading && callData.result && callData.result.length > 0) {
      return Number(callData.result[0]);
    }
    return;
  });

  const gammaBaseUppers = gammaBaseUpperData.map((callData) => {
    if (!callData.loading && callData.result && callData.result.length > 0) {
      return Number(callData.result[0]);
    }
    return;
  });

  const gammaCurrentTicks = gammaCurrentTickData.map((callData) => {
    if (!callData.loading && callData.result && callData.result.length > 0) {
      return Number(callData.result[0]);
    }
    return;
  });

  const uniPilotCurrentTicks = uniPilotCurrentTickData.map((callData) => {
    if (!callData.loading && callData.result && callData.result.length > 1) {
      return Number(callData.result[1]);
    }
    return;
  });

  const defiedgeCurrentTicks = defiedgeCurrentTickData.map((callData) => {
    if (!callData.loading && callData.result && callData.result.length > 1) {
      return Number(callData.result[1]);
    }
    return;
  });

  const gammaValues = gammaPairAddresses.map((_, index) => {
    if (
      gammaBaseLowers.length >= index &&
      gammaBaseUppers.length >= index &&
      gammaCurrentTicks.length >= index
    ) {
      const gammaBaseLower = gammaBaseLowers[index];
      const gammaCurrentTick = gammaCurrentTicks[index];
      const gammaBaseUpper = gammaBaseUppers[index];

      if (gammaBaseLower && gammaCurrentTick && gammaBaseUpper) {
        const lowerValue = Math.pow(1.0001, gammaBaseLower - gammaCurrentTick);
        const upperValue = Math.pow(1.0001, gammaBaseUpper - gammaCurrentTick);

        return { min: lowerValue, max: upperValue };
      }
      return;
    }
    return;
  });

  const ranges: IPresetArgs[] = useMemo(() => {
    if (isGamma) {
      return gammaPair
        ? gammaPair.map((pair, index) => {
            const gammaValue = gammaValues[index];

            return {
              type: pair.type,
              title: pair.title,
              address: pair.address,
              min: gammaValue ? gammaValue.min : 0,
              max: gammaValue ? gammaValue.max : 0,
              risk: PresetProfits.VERY_LOW,
              profit: PresetProfits.HIGH,
            };
          })
        : [];
    }

    if (isUnipilot) {
      return unipilotPairs
        ? unipilotPairs.map((pair, index) => {
            const pairSymbolData = pair.symbol.split('-');
            const pairType = Number(pairSymbolData[pairSymbolData.length - 1]);
            const minTick = Number(pair.baseTickLower ?? 0);
            const maxTick = Number(pair.baseTickUpper ?? 0);
            const currentTick = uniPilotCurrentTicks[index];
            const minPrice =
              currentTick !== undefined
                ? Math.pow(1.0001, minTick - currentTick)
                : 0;
            const maxPrice =
              currentTick !== undefined
                ? Math.pow(1.0001, maxTick - currentTick)
                : 0;
            return {
              type: pairType,
              title: unipilotVaultTypes[pairType - 1],
              address: pair.id,
              tokenStr: pair.token0 + '-' + pair.token1,
              min: minPrice,
              max: maxPrice,
              risk: PresetProfits.VERY_LOW,
              profit: PresetProfits.HIGH,
            };
          })
        : [];
    }

    if (isDefiedge) {
      return defiedgeStrategies
        ? defiedgeStrategies.map((strategy, index) => {
            const currentTick = defiedgeCurrentTicks[index];
            const isTicksAtLimit =
              strategy.tickLower === TickMath.MIN_TICK &&
              strategy.tickUpper === TickMath.MAX_TICK;

            const minPrice =
              currentTick !== undefined
                ? Math.pow(1.0001, strategy.tickLower - currentTick)
                : 0;
            const maxPrice =
              currentTick !== undefined
                ? Math.pow(1.0001, strategy.tickUpper - currentTick)
                : 0;

            return {
              title: isTicksAtLimit ? 'Full' : 'Narrow',
              type: isTicksAtLimit ? Presets.FULL : Presets.SAFE,
              address: strategy.id,
              min: isTicksAtLimit ? 0 : minPrice,
              max: isTicksAtLimit ? Infinity : maxPrice,
              tokenStr: strategy.token0 + '-' + strategy.token1,
              risk: PresetProfits.LOW,
              profit: PresetProfits.HIGH,
            };
          })
        : [];
    }

    if (isSteer) {
      return steerPairs
        ? steerPairs.map((pair) => {
            const minTick = Number(pair.lowerTick ?? 0);
            const maxTick = Number(pair.upperTick ?? 0);
            const currentTick = Number(pair.tick ?? 0);
            const positionWidthPercent = calculatePositionWidth(
              currentTick,
              minTick,
              maxTick,
            );
            const minPrice =
              currentTick !== undefined
                ? Math.pow(1.0001, minTick - currentTick)
                : 0;
            const maxPrice =
              currentTick !== undefined
                ? Math.pow(1.0001, maxTick - currentTick)
                : 0;
            const pairStrategyName = pair?.strategyName ?? '';
            const isInRange = minTick < currentTick && currentTick < maxTick;
            const pairType = isInRange
              ? pairStrategyName.toLowerCase().includes('stable')
                ? Presets.STEER_STABLE
                : percentageToMultiplier(positionWidthPercent) > 1.2
                ? Presets.STEER_WIDE
                : Presets.STEER_NARROW
              : Presets.OUT_OF_RANGE;
            const pairTypeTitle = isInRange
              ? pairType === Presets.STEER_STABLE
                ? 'Stable'
                : pairType === Presets.STEER_WIDE
                ? 'Wide'
                : 'Narrow'
              : t('outrange');
            return {
              type: pairType,
              title: pairTypeTitle,
              address: pair.address,
              tokenStr: pair.token0?.address + '-' + pair.token1?.address,
              min: minPrice,
              max: maxPrice,
              risk: PresetProfits.VERY_LOW,
              profit: PresetProfits.HIGH,
            };
          })
        : [];
    }

    // if (isAlgebraIntegral) {
    //   return [];
    // }

    if (isStablecoinPair)
      return [
        {
          type: Presets.FULL,
          title: t('fullRange'),
          min: 0,
          max: Infinity,
          risk: PresetProfits.VERY_LOW,
          profit: PresetProfits.VERY_LOW,
        },
        {
          type: Presets.STABLE,
          title: t('stablecoins'),
          min: 0.984,
          max: 1.016,
          risk: PresetProfits.VERY_LOW,
          profit: PresetProfits.HIGH,
        },
      ];

    return [
      {
        type: Presets.FULL,
        title: t('fullRange'),
        min: 0,
        max: Infinity,
        risk: PresetProfits.VERY_LOW,
        profit: PresetProfits.VERY_LOW,
      },
      {
        type: Presets.SAFE,
        title: t('safe'),
        min: 0.8,
        max: 1.4,
        risk: PresetProfits.LOW,
        profit: PresetProfits.LOW,
      },
      {
        type: Presets.NORMAL,
        title: t('common'),
        min: 0.9,
        max: 1.2,
        risk: PresetProfits.MEDIUM,
        profit: PresetProfits.MEDIUM,
      },
      {
        type: Presets.RISK,
        title: t('expert'),
        min: 0.95,
        max: 1.1,
        risk: PresetProfits.HIGH,
        profit: PresetProfits.HIGH,
      },
    ];
  }, [
    isGamma,
    isUnipilot,
    isDefiedge,
    isSteer,
    isStablecoinPair,
    isAlgebraIntegral,
    t,
    gammaPair,
    gammaValues,
    unipilotPairs,
    uniPilotCurrentTicks,
    defiedgeStrategies,
    defiedgeCurrentTicks,
    steerPairs,
  ]);

  const risk = useMemo(() => {
    if (!priceUpper || !priceLower || !price) return;

    const upperPercent = 100 - (+price / +priceUpper) * 100;
    const lowerPercent = Math.abs(100 - (+price / +priceLower) * 100);

    const rangePercent =
      +priceLower > +price && +priceUpper > 0
        ? upperPercent - lowerPercent
        : upperPercent + lowerPercent;

    if (rangePercent < 7.5) {
      return 5;
    } else if (rangePercent < 15) {
      return (15 - rangePercent) / 7.5 + 4;
    } else if (rangePercent < 30) {
      return (30 - rangePercent) / 15 + 3;
    } else if (rangePercent < 60) {
      return (60 - rangePercent) / 30 + 2;
    } else if (rangePercent < 120) {
      return (120 - rangePercent) / 60 + 1;
    } else {
      return 1;
    }
  }, [price, priceLower, priceUpper]);

  const _risk = useMemo(() => {
    const res: any[] = [];
    const split = risk?.toString().split('.');

    if (!split) return;

    for (let i = 0; i < 5; i++) {
      if (i < +split[0]) {
        res.push(100);
      } else if (i === +split[0]) {
        res.push(parseFloat('0.' + split[1]) * 100);
      } else {
        res.push(0);
      }
    }

    return res;
  }, [risk]);

  const feeString = useMemo(() => {
    if (
      mintInfo.poolState === PoolState.INVALID ||
      mintInfo.poolState === PoolState.LOADING
    )
      return <Loader stroke='#22cbdc' />;

    return `${(
      (mintInfo.feeAmount ?? mintInfo.dynamicFee) / 10000
    ).toLocaleString()}% ${t('fee').toLowerCase()}`;
  }, [mintInfo, t]);

  const aprString = useMemo(() => {
    if (!aprs || !baseCurrency || !quoteCurrency)
      return <Loader stroke='#22dc22' />;

    const poolAddress = computePoolAddress({
      poolDeployer:
        mintInfo.feeTier && mintInfo.feeTier.id.includes('uni')
          ? UNI_V3_FACTORY_ADDRESS[chainId]
          : POOL_DEPLOYER_ADDRESS[chainId],
      tokenA: baseCurrency.wrapped,
      tokenB: quoteCurrency.wrapped,
      fee: mintInfo.feeAmount,
    }).toLowerCase();

    return aprs[poolAddress] ? aprs[poolAddress].toFixed(2) : undefined;
  }, [aprs, baseCurrency, quoteCurrency, mintInfo, chainId]);

  const gammaValuesLoaded =
    mintInfo.price && gammaValues.filter((value) => !value).length === 0;
  const { liquidityRangeType } = mintInfo;

  useEffect(() => {
    if (
      gammaValuesLoaded &&
      liquidityRangeType === GlobalConst.v3LiquidityRangeType.GAMMA_RANGE
    ) {
      handlePresetRangeSelection(ranges[0]);
      onChangePresetRange(ranges[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gammaValuesLoaded, liquidityRangeType, baseCurrency, quoteCurrency]);

  const uniPilotValuesLoaded =
    unipilotPairs &&
    unipilotPairs.length > 0 &&
    uniPilotCurrentTicks.filter((tick) => !tick).length === 0;

  useEffect(() => {
    if (
      uniPilotValuesLoaded &&
      liquidityRangeType === GlobalConst.v3LiquidityRangeType.UNIPILOT_RANGE
    ) {
      handlePresetRangeSelection(ranges[0]);
      onChangePresetRange(ranges[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniPilotValuesLoaded, liquidityRangeType, baseCurrency, quoteCurrency]);

  const defiedgeValuesLoaded =
    defiedgeStrategies &&
    defiedgeStrategies.length > 0 &&
    defiedgeCurrentTicks.filter((tick) => !tick).length === 0;

  useEffect(() => {
    if (
      defiedgeValuesLoaded &&
      liquidityRangeType === GlobalConst.v3LiquidityRangeType.DEFIEDGE_RANGE
    ) {
      handlePresetRangeSelection(ranges[0]);
      onChangePresetRange(ranges[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defiedgeValuesLoaded, liquidityRangeType, baseCurrency, quoteCurrency]);

  const steerLoaded = steerPairs && steerPairs.length > 0;
  useEffect(() => {
    if (
      steerLoaded &&
      liquidityRangeType === GlobalConst.v3LiquidityRangeType.STEER_RANGE
    ) {
      handlePresetRangeSelection(ranges[0]);
      onChangePresetRange(ranges[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    steerLoaded,
    liquidityRangeType,
    mintInfo.feeAmount,
    baseCurrency,
    quoteCurrency,
  ]);

  return (
    <Box>
      <Box mb='10px' className='preset-buttons'>
        {isGamma && !gammaValuesLoaded ? (
          <Box width={1} className='flex justify-center'>
            <Loader />
          </Box>
        ) : (
          <>
            {ranges.map((range, i) => (
              <button
                className={`${
                  activePreset === range.type ? 'active-preset' : ''
                }`}
                onClick={() => {
                  if (activePreset === range.type) {
                    handlePresetRangeSelection(null);
                  } else {
                    handlePresetRangeSelection(range);
                  }
                  onChangePresetRange(range);
                }}
                key={i}
              >
                <p className='caption'>{range.title}</p>
              </button>
            ))}
          </>
        )}
      </Box>
      {!isGamma && !isUnipilot && !isDefiedge && !isSteer && (
        <>
          <Box className='flex justify-between'>
            {_risk && !mintInfo.invalidRange && !isStablecoinPair && (
              <Box className='preset-range-info'>
                <Box px='12px' className='flex items-center justify-between'>
                  <span>{t('risk')}:</span>
                  <Box className='flex items-center'>
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <div key={i} className='preset-range-circle'>
                        <Box
                          key={i}
                          left={`calc(-100% + ${_risk[i]}%)`}
                          className='preset-range-circle-active bg-error'
                        />
                      </div>
                    ))}
                  </Box>
                </Box>
                <Box
                  mt={1}
                  px='12px'
                  className='flex items-center justify-between'
                >
                  <span>{t('profit')}:</span>
                  <Box className='flex items-center'>
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <div key={i} className='preset-range-circle'>
                        <Box
                          key={i}
                          left={`calc(-100% + ${_risk[i]}%)`}
                          className='preset-range-circle-active bg-success'
                        />
                      </div>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
            {baseCurrency && quoteCurrency && (
              <Box className='preset-range-info'>
                <Box padding='10px 12px'>
                  <PoolStats
                    fee={feeString}
                    apr={aprString}
                    loading={
                      mintInfo.poolState === PoolState.LOADING ||
                      mintInfo.poolState === PoolState.INVALID
                    }
                    noLiquidity={mintInfo.noLiquidity}
                  ></PoolStats>
                </Box>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
