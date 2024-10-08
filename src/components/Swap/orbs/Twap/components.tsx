import React, { useCallback, useMemo, useState } from 'react';
import { Box, CardHeader, Menu, MenuItem } from '@material-ui/core';
import { styled } from '@material-ui/core';
import { NumericalInput, QuestionHelper } from 'components';
import { ReactNode } from 'react';
import { formatNumber } from '@orderly.network/hooks/esm/utils';
import { useTranslation } from 'react-i18next';
import { useTwapSwapActionHandlers } from 'state/swap/twap/hooks';
import { fromRawAmount } from '../utils';
import { TimeDuration, TimeUnit } from '@orbs-network/twap-sdk';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import { TWAP_FAQ } from '../consts';
import useUSDCPrice from 'utils/useUSDCPrice';
import { useTwapContext } from './context';
import { Field } from '../../../../state/swap/actions';
import { KeyboardArrowDown } from '@material-ui/icons';
import { useTwapState } from 'state/swap/twap/hooks';
import { Currency } from '@uniswap/sdk';
import CurrencySelect from 'components/CurrencySelect';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import useSwapRedirects from 'hooks/useSwapRedirect';
import CloseIcon from '@material-ui/icons/Close';
import { tryParseAmount } from 'state/swap/hooks';
import CurrencyLogo from 'components/CurrencyLogo';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import { useOptimalRate } from './context';
import { Skeleton } from '@material-ui/lab';

export const Card = ({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <Box
      onClick={onClick}
      className={`swapBox bg-secondary4 TwapCard ${className}`}
    >
      {children}
    </Box>
  );
};

const CardTitle = ({
  title,
  tooltip,
}: {
  title: ReactNode;
  tooltip?: string;
}) => {
  return (
    <Box className='flex items-center TwapCardTitle'>
      <p>{title}</p>
      {tooltip && <QuestionHelper size={18} text={tooltip} />}
    </Box>
  );
};

const CardInput = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <Box className={`TwapCardInput bg-input1 ${className}`}>{children}</Box>
  );
};

const useInvertedAmount = (amount?: string) => {
  const { chainId } = useActiveWeb3React();
  const { currencies } = useTwapContext();
  return useMemo(() => {
    if (!amount || !currencies.OUTPUT) return;
    const result = (
      10 ** currencies.OUTPUT.decimals /
      Number(amount)
    ).toString();
    return tryParseAmount(chainId, result, currencies.OUTPUT);
  }, [chainId, currencies.OUTPUT, amount]);
};

const Switch = () => {
  const { onMarketOrder } = useTwapSwapActionHandlers();
  const { isMarketOrder } = useTwapContext();

  return (
    <Box className='TwapSwitch'>
      <button
        onClick={() => onMarketOrder(true)}
        className={`TwapSwitchButton ${isMarketOrder &&
          'TwapSwitchButtonSelected'}`}
      >
        Market
      </button>
      <button
        onClick={() => onMarketOrder(false)}
        className={`TwapSwitchButton ${!isMarketOrder &&
          'TwapSwitchButtonSelected'}`}
      >
        Limit
      </button>
    </Box>
  );
};

const LimitInputPanelHeader = () => {
  const { isLimitPanel } = useTwapContext();
  const { t } = useTranslation();

  if (isLimitPanel) return null;
  return (
    <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
      <CardTitle title={<>{t('price')}</>} tooltip='/' />
      <Switch />
    </Box>
  );
};

export function LimitInputPanel() {
  const { t } = useTranslation();
  return (
    <>
      <Card className='TwapLimitPanel'>
        <LimitInputPanelHeader />
        <LimitInputPanelContent />
      </Card>
    </>
  );
}

const LimitInputPanelContent = () => {
  const { redirectWithCurrency } = useSwapRedirects();
  const { onInvertLimitPrice } = useTwapSwapActionHandlers();
  const { currencies, isMarketOrder } = useTwapContext();

  const { isLimitPriceInverted } = useTwapState();
  const handleCurrencySelect = (currency: Currency) => {
    redirectWithCurrency(currency, isLimitPriceInverted ? true : false);
  };

  const inCurrency = isLimitPriceInverted
    ? currencies.OUTPUT
    : currencies.INPUT;
  const outCurrency = isLimitPriceInverted
    ? currencies.INPUT
    : currencies.OUTPUT;

  if (isMarketOrder) return null;

  return (
    <Box style={{ display: 'block' }}>
      <Box className='TwapLimitPanelHeader'>
        <Box className='TwapLimitPanelHeaderLabel'>
          When 1 <CurrencyLogo currency={inCurrency} size='17px' />{' '}
          {inCurrency?.symbol} is worth
        </Box>

        <button
          className='TwapLimitPanelHeaderInvert'
          onClick={() => onInvertLimitPrice(!isLimitPriceInverted)}
        >
          <SwapVertIcon />
        </button>
      </Box>
      <CardInput>
        <Box style={{ display: 'flex', gap: '20px', width: '100%' }}>
          <LimitPriceInput />
          <CurrencySelect
            id='twap-limit-currency-select'
            currency={outCurrency}
            otherCurrency={inCurrency}
            handleCurrencySelect={handleCurrencySelect}
          />
        </Box>
      </CardInput>
      <PercentButtons />
    </Box>
  );
};

const LimitPriceInput = () => {
  const isProMode = useIsProMode();
  const { currencies } = useTwapContext();
  const { data, isLoading } = useOptimalRate();
  const state = useTwapState();
  const { onLimitPriceInput } = useTwapSwapActionHandlers();
  const marketPrice = data?.rate?.destAmount;
  const invertedMarketPrice = useInvertedAmount(marketPrice);

  const value = useMemo(() => {
    if (state.limitPrice !== undefined) {
      return state.limitPrice;
    }
    if (state.isLimitPriceInverted) {
      return invertedMarketPrice?.toExact();
    }
    return fromRawAmount(currencies.OUTPUT, marketPrice)?.toExact();
  }, [
    state.limitPrice,
    marketPrice,
    currencies.OUTPUT,
    state.isLimitPriceInverted,
    invertedMarketPrice?.toExact(),
  ]);

  return (
    <Box className='TwapLimitPanelInput'>
      {isLoading ? (
        <Skeleton height='30px' width='100%' />
      ) : (
        <NumericalInput
          value={value || ''}
          align='left'
          color={isProMode ? 'white' : 'secondary'}
          placeholder='0.00'
          onUserInput={(val) => {
            onLimitPriceInput(val);
          }}
        />
      )}
    </Box>
  );
};

function useCalculatePercentageDiff() {
  const context = useTwapContext();
  const { isLimitPriceInverted } = useTwapState();
  const destAmount = useOptimalRate().data?.rate?.destAmount;

  return useMemo(() => {
    if (!destAmount || !context.limitPrice) return 0;
    const marketPrice = Number(destAmount);
    const limitPrice = Number(context.limitPrice);

    if (marketPrice === 0) return 0;
    const diff = marketPrice - limitPrice;
    let percentageDiff = (diff * 100) / marketPrice;
    if (!isLimitPriceInverted) {
      percentageDiff = -percentageDiff;
    }
    return parseFloat(percentageDiff.toFixed(2));
  }, [context.limitPrice, destAmount, isLimitPriceInverted]);
}

const PercentButtons = () => {
  const { currencies } = useTwapContext();
  const { isLimitPriceInverted, limitPercent } = useTwapState();
  const { onLimitPriceInput } = useTwapSwapActionHandlers();
  const marketPrice = useOptimalRate().data?.rate?.destAmount;
  const invertedAmount = useInvertedAmount(marketPrice);

  const onPercent = useCallback(
    (percentage: number) => {
      if (!marketPrice || !currencies.OUTPUT) return;

      const price = isLimitPriceInverted
        ? invertedAmount?.toExact()
        : fromRawAmount(currencies.OUTPUT, marketPrice)?.toExact();
      if (!price) return;
      const adjustment = percentage / 100;

      const newLimitPrice = parseFloat(
        (Number(price) * (1 + adjustment)).toFixed(5),
      );
      onLimitPriceInput(newLimitPrice.toString() || '', percentage);
    },
    [marketPrice, currencies, onLimitPriceInput, isLimitPriceInverted],
  );

  const percent = useMemo(() => {
    return [1, 5, 10].map((it) => it * (isLimitPriceInverted ? -1 : 1));
  }, [isLimitPriceInverted]);

  return (
    <Box className='TwapLimitPanelPercent'>
      <ResetButton />
      {percent.map((percent) => {
        return (
          <SelectorButton
            key={percent}
            selected={limitPercent === percent}
            onClick={() => onPercent(percent)}
          >
            {isLimitPriceInverted ? '' : '+'}
            {percent}%
          </SelectorButton>
        );
      })}
    </Box>
  );
};

const ResetButton = () => {
  const { onLimitPriceInput } = useTwapSwapActionHandlers();
  const priceDiff = useCalculatePercentageDiff();
  const state = useTwapState();
  const { t } = useTranslation();
  const showPercent = priceDiff && !state.limitPercent;
  console.log(state.limitPercent, priceDiff);

  if (!showPercent) {
    return (
      <SelectorButton
        onClick={() => onLimitPriceInput(undefined)}
        selected={Number(priceDiff) === 0 && state.limitPrice !== ''}
      >
        0%
      </SelectorButton>
    );
  }

  return (
    <Box className='TwapLimitPanelPercentReset'>
      <SelectorButton
        onClick={() => onLimitPriceInput(undefined)}
        selected={true}
      >
        {Number(priceDiff) > 0 ? '+' : ''}
        {priceDiff}%
      </SelectorButton>
      <SelectorButton
        onClick={() => onLimitPriceInput(undefined)}
        selected={true}
      >
        <CloseIcon />
      </SelectorButton>
    </Box>
  );
};

const Chunks = () => {
  const { t } = useTranslation();
  const { onChunksInput } = useTwapSwapActionHandlers();
  const { chunks } = useTwapContext().derivedSwapValues;

  return (
    <Card className='TwapChunkSelect'>
      <CardTitle
        title='Over'
        tooltip='The total number of individual trades that will be scheduled as part of your order. Note that in limit orders, it is possible that not all scheduled trades will be executed.'
      />
      <CardInput>
        <NumericalInput
          value={chunks}
          align='left'
          color='secondary'
          placeholder='0.00'
          onUserInput={(val) => {
            onChunksInput(Number(val));
          }}
        />
        <p className='TwapChunkSelectText'>{t('orders')}</p>
      </CardInput>
    </Card>
  );
};

const ChunkSize = () => {
  const { derivedSwapValues, currencies } = useTwapContext();
  const { srcChunkAmount } = derivedSwapValues;
  const oneSrcTokenUsd = Number(
    useUSDCPrice(currencies[Field.INPUT])?.toSignificant() ?? 0,
  );

  const srcChukAmountUsd = useMemo(() => {
    const srcChunkCurrencyAmount = fromRawAmount(
      currencies[Field.INPUT],
      srcChunkAmount,
    );
    return oneSrcTokenUsd * Number(srcChunkCurrencyAmount?.toExact() ?? 0);
  }, [oneSrcTokenUsd, srcChunkAmount, currencies[Field.INPUT]]);

  const amount = fromRawAmount(currencies[Field.INPUT], srcChunkAmount);
  return (
    <Box className='TwapChunkSize'>
      {formatNumber(amount?.toExact())} {amount?.currency.symbol} per trade{' '}
      <small>{`($${formatNumber(srcChukAmountUsd)})`}</small>
    </Box>
  );
};

const resolutions: { unit: TimeUnit; label: string }[] = [
  {
    label: 'minute',
    unit: TimeUnit.Minutes,
  },
  {
    label: 'day',
    unit: TimeUnit.Days,
  },
  {
    label: 'week',
    unit: TimeUnit.Weeks,
  },
  {
    label: 'month',
    unit: TimeUnit.Months,
  },
];

function DurationSelect() {
  const { t } = useTranslation();
  const { onDurationInput } = useTwapSwapActionHandlers();
  const { duration } = useTwapContext().derivedSwapValues;

  return (
    <Card className='TwapDurationSelect'>
      <CardTitle tooltip={t('expiryTooltip')} title={t('expiry')} />
      <Box className='TwapDurationSelectButtons'>
        {resolutions
          .filter((it) => it.unit !== TimeUnit.Minutes)
          .map((option, index) => {
            const selected = duration.unit * duration.value === option.unit * 1;
            return (
              <SelectorButton
                key={index}
                selected={selected}
                onClick={() => onDurationInput({ unit: option.unit, value: 1 })}
              >
                1 <span>{t(option.label)}</span>
              </SelectorButton>
            );
          })}
      </Box>
    </Card>
  );
}

const FillDelay = () => {
  const { fillDelay } = useTwapContext().derivedSwapValues;
  const onChange = useTwapSwapActionHandlers().onFillDelayInput;
  return (
    <Card className='TwapFillDelaySelect'>
      <CardTitle
        title='Every'
        tooltip='The estimated time that will elapse between each trade in your order. Note that as this time includes an allowance of two minutes for bidder auction and block settlement, which cannot be predicted exactly, actual time may vary.'
      />
      <CardInput>
        <NumericalInput
          value={fillDelay.value}
          align='left'
          color='secondary'
          placeholder='0.00'
          onUserInput={(val) => {
            onChange({ ...fillDelay, value: Number(val) });
          }}
        />
        <ResolutionSelect duration={fillDelay} onChange={onChange} />
      </CardInput>
    </Card>
  );
};

const ResolutionSelect = ({
  duration,
  onChange,
}: {
  duration: TimeDuration;
  onChange: (value: TimeDuration) => void;
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const onOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl],
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const handleMenuItemClick = useCallback(
    (unit: TimeUnit) => {
      onChange({ ...duration, unit });
      handleClose();
    },
    [duration, onChange, handleClose],
  );

  const selected = useMemo(
    () => resolutions.find((option) => option.unit === duration.unit),
    [duration],
  );

  return (
    <Box>
      <button onClick={onOpen} className='TwapResolutionButton'>
        <p style={{ fontSize: 13 }}>{t(selected?.label || 'minutes')}</p>
        <KeyboardArrowDown />
      </button>
      <Menu
        id='swap-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'swap-button',
          role: 'listbox',
        }}
      >
        {resolutions.map((option) => {
          const selected = duration.unit === option.unit;

          return (
            <MenuItem
              style={{ textTransform: 'capitalize' }}
              className={`swap-menu-item ${
                selected ? 'swap-menu-item-selected' : ''
              }`}
              key={option.unit}
              disabled={selected}
              selected={selected}
              onClick={(event) => handleMenuItemClick(option.unit)}
            >
              {t(option.label)}
              {selected && <Box ml={5} className='selectedMenuDot' />}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export const TwapInputs = () => {
  const isLimitPanel = useTwapContext().isLimitPanel;

  if (isLimitPanel) {
    return (
      <Box className='TwapInputs'>
        <DurationSelect />
      </Box>
    );
  }

  return (
    <Box className='TwapInputs'>
      <Box style={{ display: 'flex', gap: 2 }}>
        <FillDelay />
        <Chunks />
      </Box>
      <ChunkSize />
    </Box>
  );
};

export function LimitPriceWarning() {
  const { isMarketOrder } = useTwapContext();
  if (isMarketOrder) return null;
  return (
    <Card className='TwapLimitPriceWarning'>
      <ReportProblemIcon />
      <p>
        Limit orders may not execute when the token's price is equal or close to
        the limit price, due to gas and standard swap fees.{' '}
        <a href={TWAP_FAQ} target='_blank' rel='noreferrer'>
          Learn more
        </a>
      </p>
    </Card>
  );
}

export function SelectorButton({
  selected,
  onClick,
  children,
}: {
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className={`TwapSelectorButton ${
        selected ? 'TwapSelectorButtonSelected' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
