import { Box, Typography } from '@material-ui/core';
import { Currency } from '@uniswap/sdk';
import QuestionHelper from 'components/QuestionHelper';
import { useActiveWeb3React } from 'hooks';
import React, { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateFromTimeStamp, formatNumber, getEtherscanLink } from 'utils';
import { formatCurrencyAmount } from 'utils/v3/formatCurrencyAmount';
import { fromRawAmount, makeElipsisAddress } from '../utils';

const ELIPSIS_PADDING = 5;

const FillDelayAsText = ({ fillDelay }: { fillDelay?: number }) => {
  const { t } = useTranslation();
  const text = useMemo(() => {
    if (!fillDelay) return;

    const days = Math.floor(fillDelay / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (fillDelay % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((fillDelay % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((fillDelay % (1000 * 60)) / 1000);

    const arr: string[] = [];

    if (days) {
      arr.push(`${days} ${t('days')} `);
    }
    if (hours) {
      arr.push(`${hours} ${t('hours')} `);
    }
    if (minutes) {
      arr.push(`${minutes} ${t('minutes')}`);
    }
    if (seconds) {
      arr.push(`${seconds} ${t('seconds')}`);
    }

    return arr.join(' ');
  }, [fillDelay, t]);

  return <>{text}</>;
};

const FillDelay = ({
  fillDelay,
  totalChunks,
}: {
  fillDelay?: number;
  totalChunks?: number;
}) => {
  const { t } = useTranslation();

  if (totalChunks === 1) return null;

  return (
    <TwapOrderDetailsRow
      label={t('every')}
      tooltip={t('fillDelayTooltip')}
      value={<FillDelayAsText fillDelay={fillDelay} />}
    />
  );
};

const Recipient = () => {
  const { account, chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  if (!account) return null;

  return (
    <TwapOrderDetailsRow
      label={t('recipient')}
      value={
        <a
          target='_blank'
          href={getEtherscanLink(chainId, account as string, 'address')}
          rel='noreferrer'
        >
          {makeElipsisAddress(account, ELIPSIS_PADDING)}
        </a>
      }
    />
  );
};

const Chunks = ({ totalChunks }: { totalChunks?: number }) => {
  const { t } = useTranslation();
  if (totalChunks === 1) return null;

  return (
    <TwapOrderDetailsRow
      label={t('numOfTrades')}
      tooltip={t('numOfTradesTooltip')}
      value={formatNumber(totalChunks)}
    />
  );
};

const ChunkSize = ({
  srcChunk,
  inCurrency,
}: {
  srcChunk?: string;
  inCurrency?: Currency;
}) => {
  const { t } = useTranslation();

  const amount = useMemo(() => {
    return fromRawAmount(inCurrency, srcChunk);
  }, [srcChunk, inCurrency]);

  return (
    <TwapOrderDetailsRow
      label={t('individualTradeSize')}
      tooltip={t('individualTradeSizeTooltip')}
      value={`${formatNumber(amount?.toExact())} ${inCurrency?.symbol}`}
    />
  );
};

const SrcAmount = ({
  srcAmount,
  currency,
}: {
  srcAmount?: string;
  currency?: Currency;
}) => {
  const { t } = useTranslation();
  const amount = fromRawAmount(currency, srcAmount);
  return (
    <TwapOrderDetailsRow
      label={t('amountOut')}
      value={`${formatCurrencyAmount(amount, 4)} ${currency?.symbol}`}
    />
  );
};

const MinReceived = ({
  isMarketOrder,
  dstMinAmount,
  currency,
}: {
  isMarketOrder?: boolean;
  dstMinAmount?: string;
  currency?: Currency;
}) => {
  const { t } = useTranslation();
  const amount = fromRawAmount(currency, dstMinAmount);
  if (isMarketOrder) return null;

  return (
    <TwapOrderDetailsRow
      label={t('minReceived')}
      tooltip={t('minimumReceivedTooltip')}
      value={`${formatCurrencyAmount(amount, 4)} ${currency?.symbol}`}
    />
  );
};

const Deadline = ({ deadline }: { deadline?: number }) => {
  const { t } = useTranslation();

  if (!deadline) return null;

  return (
    <TwapOrderDetailsRow
      label={t('expiry')}
      tooltip={t('expiryTooltip')}
      value={formatDateFromTimeStamp(deadline / 1000, 'MMM DD, YYYY HH:mm')}
    />
  );
};

const Price = ({
  price,
  isMarketOrder,
  inCurrency,
  outCurrency,
  usd,
}: {
  price?: string;
  isMarketOrder?: boolean;
  inCurrency?: Currency;
  outCurrency?: Currency;
  usd?: number;
}) => {
  const { t } = useTranslation();

  return (
    <TwapOrderDetailsRow
      label={isMarketOrder ? t('marketPrice') : t('limitPrice')}
      value={
        !price ? (
          undefined
        ) : (
          <>
            1 {inCurrency?.symbol} = {formatNumber(price, 3)}{' '}
            {outCurrency?.symbol}{' '}
            <small>{`($${usd?.toLocaleString('en')})`}</small>
          </>
        )
      }
    />
  );
};

const OrderDetails = ({ children }: { children: ReactNode }) => {
  return <Box className='TwapOrderDetails'>{children}</Box>;
};

export const TwapOrderDetailsRow = ({
  label,
  value,
  tooltip,
}: {
  label: string;
  value?: ReactNode;
  tooltip?: string;
}) => {
  return (
    <Box className='TwapOrderDetailsRow'>
      <Box className='TwapOrderDetailsRowLeft'>
        <Typography className='TwapOrderDetailsRowLabel'>{label}</Typography>
        {tooltip && <QuestionHelper text={tooltip} size={16} />}
      </Box>
      <Typography className='TwapOrderDetailsRowValue'>
        {value || '-'}
      </Typography>
    </Box>
  );
};

OrderDetails.Price = Price;
OrderDetails.Deadline = Deadline;
OrderDetails.SrcAmount = SrcAmount;
OrderDetails.MinReceived = MinReceived;
OrderDetails.ChunkSize = ChunkSize;
OrderDetails.Chunks = Chunks;
OrderDetails.Recipient = Recipient;
OrderDetails.FillDelay = FillDelay;
OrderDetails.DetailsRow = TwapOrderDetailsRow;

export { OrderDetails };
