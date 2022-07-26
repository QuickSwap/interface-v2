import React from 'react';
import { Box } from '@material-ui/core';
import {
  StyledBlueTag,
  StyledFilledBox,
  StyledGreenTag,
  StyledLabel,
  StyledSelectableBox,
} from 'components/AddLiquidityV3/CommonStyledElements';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Presets } from 'state/mint/v3/reducer';
import './index.scss';

export interface IPresetArgs {
  type: Presets;
  min: number;
  max: number;
}

interface IPresetRanges {
  isInvalid: boolean;
  outOfRange: boolean;
  isStablecoinPair: boolean;
  activePreset: Presets | null;
  handlePresetRangeSelection: (preset: IPresetArgs | null) => void;
  priceLower: string | undefined;
  priceUpper: string | undefined;
  price: string | undefined;
  fee: string | undefined;
  apr: string | undefined;
}

enum PresetProfits {
  VERY_LOW,
  LOW,
  MEDIUM,
  HIGH,
}

export function PresetRanges({
  isStablecoinPair,
  activePreset,
  handlePresetRangeSelection,
  priceLower,
  price,
  priceUpper,
  isInvalid,
  outOfRange,
  fee,
  apr,
}: IPresetRanges) {
  const ranges = useMemo(() => {
    if (isStablecoinPair)
      return [
        {
          type: Presets.STABLE,
          title: `Stablecoins`,
          min: 0.984,
          max: 1.01,
          risk: PresetProfits.VERY_LOW,
          profit: PresetProfits.HIGH,
        },
      ];

    return [
      {
        type: Presets.FULL,
        title: `Full range`,
        min: 0,
        max: Infinity,
        risk: PresetProfits.VERY_LOW,
        profit: PresetProfits.VERY_LOW,
      },
      {
        type: Presets.SAFE,
        title: `Safe`,
        min: 0.8,
        max: 1.4,
        risk: PresetProfits.LOW,
        profit: PresetProfits.LOW,
      },
      {
        type: Presets.NORMAL,
        title: `Common`,
        min: 0.9,
        max: 1.2,
        risk: PresetProfits.MEDIUM,
        profit: PresetProfits.MEDIUM,
      },
      {
        type: Presets.RISK,
        title: `Expert`,
        min: 0.95,
        max: 1.1,
        risk: PresetProfits.HIGH,
        profit: PresetProfits.HIGH,
      },
    ];
  }, [isStablecoinPair]);

  const risk = useMemo(() => {
    if (!priceUpper || !priceLower || !price) return;

    const upperPercent = 100 - (+price / +priceUpper) * 100;
    const lowerPercent = Math.abs(100 - (+price / +priceLower) * 100);

    const rangePercent =
      +priceLower > +price && +priceUpper > 0
        ? upperPercent - lowerPercent
        : upperPercent + lowerPercent;

    // console.log(upperPercent, lowerPercent)

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
  const { t } = useTranslation();

  return (
    <Box>
      <Box className='flex justify-between items-center' mt={2.5} mb={2.5}>
        {ranges.map((range, i) => (
          <StyledSelectableBox
            key={i}
            display='flex'
            alignItems='center'
            justifyContent='center'
            active={activePreset === range.type}
            style={{
              height: 30,
              width: 98,
              marginTop: 2,
            }}
            onClick={() => {
              handlePresetRangeSelection(range);
              if (activePreset == range.type) {
                handlePresetRangeSelection(null);
              } else {
                handlePresetRangeSelection(range);
              }
            }}
          >
            <StyledLabel fontSize='12px'> {t(range.title)}</StyledLabel>
          </StyledSelectableBox>
        ))}
      </Box>

      <Box className='flex justify-between items-center' mt={2.5} mb={2.5}>
        <StyledFilledBox
          width={'50%'}
          height={64}
          className='flex flex-col justify-evenly items-start'
        >
          <Box
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <StyledLabel fontSize='13px'>Risk:</StyledLabel>
            <Box>
              <div className='f f-ac f-jc ml-a'>
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div
                    key={i}
                    className='preset-ranges__circle_risk'
                    style={{ background: '#42637b' }}
                  >
                    <div
                      key={i}
                      className='preset-ranges__circle_risk--active'
                      style={{ left: `calc(-100% + ${_risk?.[i]}%)` }}
                    />
                  </div>
                ))}
              </div>
            </Box>
          </Box>

          <Box
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <StyledLabel fontSize='13px'>Profit:</StyledLabel>
            <Box>
              <div className='f f-ac f-jc ml-a'>
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div
                    key={i}
                    className='preset-ranges__circle_profit'
                    style={{ background: '#42637b' }}
                  >
                    <div
                      key={i}
                      className='preset-ranges__circle_profit--active'
                      style={{ left: `calc(-100% + ${_risk?.[i]}%)` }}
                    />
                  </div>
                ))}
              </div>
            </Box>
          </Box>
        </StyledFilledBox>

        <StyledFilledBox
          width={'50%'}
          height={64}
          className='flex flex-col justify-evenly items-start'
          ml={1}
        >
          <StyledLabel style={{ marginLeft: 10 }} fontSize='13px'>
            Selected range status:
          </StyledLabel>

          <Box
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: '100%',
              marginLeft: 10,
            }}
          >
            <StyledBlueTag style={{ marginRight: 10 }}>
              <StyledLabel fontSize='12px' color='#c7cad9'>
                {fee ? fee : '0.0%'}
              </StyledLabel>
            </StyledBlueTag>
            <StyledGreenTag>
              <StyledLabel fontSize='12px' color='#0fc679'>
                {apr ? apr : '0.0%'}
              </StyledLabel>
            </StyledGreenTag>
          </Box>
        </StyledFilledBox>
      </Box>
    </Box>
  );
}
