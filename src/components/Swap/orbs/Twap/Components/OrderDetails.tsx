import React, { ReactNode, useMemo } from 'react';
import { Box } from '@material-ui/core';
import { Currency } from '@uniswap/sdk';
import QuestionHelper from 'components/QuestionHelper';
import { useActiveWeb3React } from 'hooks';
import { useTranslation } from 'react-i18next';
import { formatDateFromTimeStamp, formatNumber, getEtherscanLink } from 'utils';
import { formatCurrencyAmount } from 'utils/v3/formatCurrencyAmount';
import { fromRawAmount, makeElipsisAddress } from '../../utils';
import { useFillDelayAsText } from '../hooks';

const ELIPSIS_PADDING = 5;

const FillDelay = ({
  fillDelay,
  totalChunks,
}: {
  fillDelay?: number;
  totalChunks?: number;
}) => {
  const { t } = useTranslation();
  const text = useFillDelayAsText(fillDelay);
  if (totalChunks === 1) return null;

  return (
    <TwapOrderDetailsRow
      label={t('every')}
      tooltip={t('fillDelayTooltip')}
      value={text}
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
      value={`${formatCurrencyAmount(amount, 6)} ${currency?.symbol}`}
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
      value={`${formatCurrencyAmount(amount, 6)} ${currency?.symbol}`}
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
      value={`${formatDateFromTimeStamp(
        deadline / 1000,
        'MMM DD, YYYY HH:mm',
      )} UTC`}
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
            {usd && <small>{`($${usd?.toLocaleString('en')})`}</small>}
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
        <p className='TwapOrderDetailsRowLabel'>{label}</p>
        {tooltip && <QuestionHelper text={tooltip} size={16} />}
      </Box>
      <p className='TwapOrderDetailsRowValue'>{value || '-'}</p>
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
