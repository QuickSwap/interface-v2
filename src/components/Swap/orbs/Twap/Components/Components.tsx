import React, { useCallback, useMemo, useState } from 'react';
import { Box, Menu, MenuItem } from '@material-ui/core';
import { NumericalInput, QuestionHelper } from 'components';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useTwapSwapActionHandlers } from 'state/swap/twap/hooks';
import { fromRawAmount } from '../../utils';
import { TimeDuration, TimeUnit } from '@orbs-network/twap-sdk';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import { TWAP_FAQ } from '../../consts';
import useUSDCPrice from 'utils/useUSDCPrice';
import { useTwapContext } from '../TwapContext';
import { Field } from '../../../../../state/swap/actions';
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
import { Skeleton } from '@material-ui/lab';
import {
  useDerivedTwapSwapData,
  useOptimalRate,
  useTradePrice,
} from '../hooks';

export const Card = ({
  children,
  className = '',
  onClick,
  styles,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  styles?: React.CSSProperties;
}) => {
  return (
    <Box
      onClick={onClick}
      className={`${className} TwapCard bg-secondary4`}
      style={styles}
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

export const PriceSwitch = () => {
  const { onMarketOrder } = useTwapSwapActionHandlers();
  const { isMarketOrder, isLimitPanel } = useTwapContext();
  const { t } = useTranslation();

  if (isLimitPanel) return null;
  return (
    <Box className='TwapSwitch'>
      <button
        onClick={() => onMarketOrder(true)}
        className={`TwapSwitchButton ${isMarketOrder &&
          'TwapSwitchButtonSelected'}`}
      >
        {t('marketPrice')}
      </button>
      <button
        onClick={() => onMarketOrder(false)}
        className={`TwapSwitchButton ${!isMarketOrder &&
          'TwapSwitchButtonSelected'}`}
      >
        {t('limitPrice')}
      </button>
    </Box>
  );
};

export const LimitInputPanel = () => {
  const { redirectWithCurrency } = useSwapRedirects();
  const { onInvertLimitPrice } = useTwapSwapActionHandlers();
  const { currencies, isMarketOrder } = useTwapContext();
  const { isTradePriceInverted } = useTwapState();
  const handleCurrencySelect = (currency: Currency) => {
    redirectWithCurrency(currency, isTradePriceInverted ? true : false);
  };

  const inCurrency = isTradePriceInverted
    ? currencies.OUTPUT
    : currencies.INPUT;
  const outCurrency = isTradePriceInverted
    ? currencies.INPUT
    : currencies.OUTPUT;

  if (isMarketOrder) return null;

  return (
    <Card className='TwapLimitPanel'>
      <Box style={{ display: 'block' }}>
        <Box className='TwapLimitPanelHeader'>
          <Box className='TwapLimitPanelHeaderLabel'>
            When 1{' '}
            {inCurrency ? (
              <CurrencyLogo currency={inCurrency} size='17px' />
            ) : (
              '-'
            )}{' '}
            {inCurrency?.symbol} is worth
          </Box>

          <button
            className='TwapLimitPanelHeaderInvert'
            onClick={() => onInvertLimitPrice(!isTradePriceInverted)}
          >
            <SwapVertIcon />
          </button>
        </Box>
        <CardInput>
          <Box style={{ display: 'flex', width: '100%' }}>
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
    </Card>
  );
};

const LimitPriceInput = () => {
  const isProMode = useIsProMode();
  const { currencies } = useTwapContext();
  const { data, isLoading } = useOptimalRate();
  const state = useTwapState();
  const { onTradePriceInput } = useTwapSwapActionHandlers();
  const marketPrice = data?.rate?.destAmount;
  const invertedMarketPrice = useInvertedAmount(marketPrice)?.toExact();

  const value = useMemo(() => {
    if (state.tradePrice !== undefined) {
      return state.tradePrice;
    }
    let result = fromRawAmount(currencies.OUTPUT, marketPrice)?.toExact();
    if (state.isTradePriceInverted) {
      result = invertedMarketPrice;
    }
    return parseFloat(Number(result).toFixed(6));
  }, [
    state.tradePrice,
    marketPrice,
    currencies.OUTPUT,
    state.isTradePriceInverted,
    invertedMarketPrice,
  ]);

  return (
    <Box className='TwapLimitPanelInput'>
      {isLoading && currencies.INPUT && currencies.OUTPUT ? (
        <Skeleton height='30px' width='100%' />
      ) : (
        <NumericalInput
          value={value || ''}
          align='left'
          color={isProMode ? 'white' : 'secondary'}
          placeholder='0.00'
          onUserInput={(val) => {
            onTradePriceInput(val);
          }}
        />
      )}
    </Box>
  );
};

const PercentButtons = () => {
  const { currencies } = useTwapContext();
  const { isTradePriceInverted } = useTwapState();
  const { onTradePriceInput } = useTwapSwapActionHandlers();
  const marketPrice = useOptimalRate().data?.rate?.destAmount;
  const invertedAmount = useInvertedAmount(marketPrice)?.toExact();

  const onPercentClick = useCallback(
    (percentage: number) => {
      if (!marketPrice || !currencies.OUTPUT) return;

      const price = isTradePriceInverted
        ? invertedAmount
        : fromRawAmount(currencies.OUTPUT, marketPrice)?.toExact();
      if (!price) return;
      const adjustment = percentage / 100;

      const newLimitPrice = parseFloat(
        (Number(price) * (1 + adjustment)).toFixed(5),
      );
      onTradePriceInput(newLimitPrice.toString() || '');
    },
    [
      marketPrice,
      currencies,
      onTradePriceInput,
      isTradePriceInverted,
      invertedAmount,
    ],
  );

  const percent = useMemo(() => {
    return [1, 5, 10].map((it) => it * (isTradePriceInverted ? -1 : 1));
  }, [isTradePriceInverted]);

  return (
    <Box className='TwapLimitPanelPercent'>
      <ResetButton />
      {percent.map((percent) => {
        return (
          <SelectorButton key={percent} onClick={() => onPercentClick(percent)}>
            {isTradePriceInverted ? '' : '+'}
            {percent}%
          </SelectorButton>
        );
      })}
    </Box>
  );
};

const ResetButton = () => {
  const { onTradePriceInput } = useTwapSwapActionHandlers();
  const _tradePrice = useTradePrice();
  const { isTradePriceInverted } = useTwapState();
  const destAmount = useOptimalRate().data?.rate?.destAmount;

  const priceDiff = useMemo(() => {
    if (!destAmount || !_tradePrice) return 0;
    const marketPrice = Number(destAmount);
    const tradePrice = Number(_tradePrice);

    if (marketPrice === 0) return 0;
    const diff = marketPrice - tradePrice;
    let percentageDiff = (diff * 100) / marketPrice;
    if (!isTradePriceInverted) {
      percentageDiff = -percentageDiff;
    }
    return parseFloat(percentageDiff.toFixed(2));
  }, [_tradePrice, destAmount, isTradePriceInverted]);
  const onClick = () => {
    onTradePriceInput(undefined);
  };

  if (priceDiff !== 0) {
    return (
      <Box className='TwapLimitPanelPercentReset' onClick={onClick}>
        <SelectorButton selected={true}>
          {Number(priceDiff) > 0 ? '+' : ''}
          {priceDiff || 0}%
        </SelectorButton>
        {priceDiff !== 0 && (
          <SelectorButton selected={true}>
            <CloseIcon />
          </SelectorButton>
        )}
      </Box>
    );
  }

  return (
    <SelectorButton onClick={() => onTradePriceInput(undefined)}>
      0%
    </SelectorButton>
  );
};

const Chunks = () => {
  const { t } = useTranslation();
  const { onChunksInput } = useTwapSwapActionHandlers();
  const { chunks } = useDerivedTwapSwapData();

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
  const { currencies } = useTwapContext();
  const inputCurrency = currencies[Field.INPUT];
  const { srcChunkAmount, chunks } = useDerivedTwapSwapData();
  const oneSrcTokenUsd = Number(
    useUSDCPrice(inputCurrency)?.toSignificant() ?? 0,
  );

  const srcChukAmountUsd = useMemo(() => {
    const srcChunkCurrencyAmount = fromRawAmount(inputCurrency, srcChunkAmount);
    return oneSrcTokenUsd * Number(srcChunkCurrencyAmount?.toExact() ?? 0);
  }, [oneSrcTokenUsd, srcChunkAmount, inputCurrency]);

  if (chunks === 1) return null;

  const amount = fromRawAmount(inputCurrency, srcChunkAmount);

  return (
    <Box className='TwapChunkSize'>
      {Number(amount?.toExact() || '0').toLocaleString('us')}{' '}
      {amount?.currency.symbol} per trade{' '}
      <small>{`($${Number(srcChukAmountUsd).toLocaleString('us')})`}</small>
    </Box>
  );
};

function DurationSelect() {
  const { t } = useTranslation();
  const { onDurationInput } = useTwapSwapActionHandlers();
  const { duration } = useDerivedTwapSwapData();

  return (
    <Card className='TwapDurationSelect'>
      <Box className='TwapDurationSelectContent'>
        <CardTitle tooltip={t('expiryTooltip')} title={t('expiry')} />
        <Box className='TwapDurationSelectButtons'>
          {resolutions
            .filter((it) => it.unit !== TimeUnit.Minutes)
            .map((option, index) => {
              const selected =
                duration.unit * duration.value === option.unit * 1;
              return (
                <SelectorButton
                  key={index}
                  selected={selected}
                  onClick={() =>
                    onDurationInput({ unit: option.unit, value: 1 })
                  }
                >
                  1 <span>{t(option.label)}</span>
                </SelectorButton>
              );
            })}
        </Box>
      </Box>
    </Card>
  );
}

const FillDelay = () => {
  const { fillDelay } = useDerivedTwapSwapData();
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
  const { isLimitPanel } = useTwapContext();

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

export const MarketPriceWarning = () => {
  const { t } = useTranslation();
  return <PriceWarning message={t('marketPriceWarning')} />;
};

const LimitPriceWarning = () => {
  const { t } = useTranslation();
  return <PriceWarning message={t('limitPriceWarning')} />;
};

export const TradePriceWarning = () => {
  const { isMarketOrder } = useTwapContext();
  return isMarketOrder ? <MarketPriceWarning /> : <LimitPriceWarning />;
};

function PriceWarning({ message }: { message: string }) {
  const { t } = useTranslation();

  return (
    <Card className='TwapPriceWarning'>
      <Box className='TwapPriceWarningContent'>
        <ReportProblemIcon />

        <p>
          {message}{' '}
          <a href={TWAP_FAQ} target='_blank' rel='noreferrer'>
            {t('learnMore')}
          </a>
        </p>
      </Box>
    </Card>
  );
}

export function SelectorButton({
  selected,
  onClick,
  children,
}: {
  selected?: boolean;
  onClick?: () => void;
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

export const MarketPriceOutputInput = ({
  handleCurrencySelect,
  title,
}: {
  handleCurrencySelect: (currency: Currency) => void;
  title: string;
}) => {
  const { currencies } = useTwapContext();
  return (
    <Card>
      <p
        style={{
          color: '#fff',
          fontSize: '13px',
        }}
      >
        {title}
      </p>
      <CurrencySelect
        currency={currencies[Field.OUTPUT]}
        otherCurrency={currencies[Field.OUTPUT]}
        handleCurrencySelect={handleCurrencySelect}
      />
    </Card>
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
