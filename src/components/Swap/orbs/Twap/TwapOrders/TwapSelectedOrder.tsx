import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CurrencyLogo from 'components/CurrencyLogo';
import { useActiveWeb3React } from 'hooks';
import React, { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateFromTimeStamp, formatNumber, getEtherscanLink } from 'utils';
import { formatCurrencyAmount } from 'utils/v3/formatCurrencyAmount';
import { fromRawAmount, makeElipsisAddress } from '../../utils';
import { useOrderTitle, useTwapOrderCurrency } from '../hooks';
import { OrderDetails } from '../Components/OrderDetails';
import { useTwapOrdersContext } from './context';

const ELIPSIS_PADDING = 5;

export function TwapSelectedOrder() {
  const { selectedOrderId } = useTwapOrdersContext();
  if (!selectedOrderId) return null;
  return (
    <Box className='TwapSelectedOrder'>
      <Header />
      <Box className='TwapSelectedOrderBody'>
        <Currencies />
        <Accordions />
      </Box>
    </Box>
  );
}

const Accordions = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<number | undefined>(1);

  const onExpand = (value: number) => {
    setExpanded(value === expanded ? undefined : value);
  };

  return (
    <Box className='TwapSelectedOrderAccordions'>
      <InfoAccordion
        title={t('excecutionSummary')}
        expanded={expanded === 1}
        onExpand={() => onExpand(1)}
      >
        <Status />
        <AmountSent />
        <AmountReceived />
        <Progress />
        <ExcecutionPrice />
      </InfoAccordion>
      <InfoAccordion
        title={t('orderInfo')}
        expanded={expanded === 2}
        onExpand={() => onExpand(2)}
      >
        <LimitPrice />
        <CreatedAt />
        <Expiration />
        <SrcAmount />
        <ChunkSize />
        <Chunks />
        <FillDelay />
        <MinReceived />
        <OrderDetails.Recipient />
        <TxHash />
      </InfoAccordion>
    </Box>
  );
};

const Header = () => {
  const { t } = useTranslation();
  const { setSelectedOrderId, selectedOrder } = useTwapOrdersContext();
  const title = useOrderTitle(selectedOrder);

  if (!selectedOrder) return null;

  return (
    <Box
      className='flex items-center justify-between TwapSelectedOrderHeader'
      mb={2}
    >
      <Typography className='TwapOrderTitle'>
        # {selectedOrder.id} {title}{' '}
        <small>{`(${formatDateFromTimeStamp(
          selectedOrder.createdAt / 1000,
          'MMM DD, YYYY HH:mm',
        )})`}</small>
      </Typography>
      <Close
        className='cursor-pointer'
        onClick={() => setSelectedOrderId(undefined)}
      />
    </Box>
  );
};

const Currencies = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const { t } = useTranslation();
  if (!selectedOrder) return null;

  return (
    <Box className='TwapSelectedOrderCurrencies'>
      <CurrenciesCurrency
        address={selectedOrder?.srcTokenAddress}
        label={selectedOrder.isMarketOrder ? t('allocated') : t('sold')}
      />
      <CurrenciesCurrency
        address={selectedOrder?.dstTokenAddress}
        label={t('toBuy')}
      />
    </Box>
  );
};

const CurrenciesCurrency = ({
  label,
  address,
}: {
  label: string;
  address: string;
}) => {
  const currency = useTwapOrderCurrency(address);

  return (
    <Box className='TwapSelectedOrderCurrency'>
      <Box className='TwapSelectedOrderCurrencyLeft'>
        <Typography className='TwapSelectedOrderCurrencyLabel'>
          {label}
        </Typography>
        <Typography className='TwapSelectedOrderCurrencySymbol'>
          {currency?.symbol}
        </Typography>
      </Box>
      <CurrencyLogo currency={currency} size={'40px'} />
    </Box>
  );
};

const FillDelay = () => {
  const { selectedOrder } = useTwapOrdersContext();
  if (selectedOrder?.totalChunks === 1) return null;

  return (
    <OrderDetails.FillDelay
      fillDelay={selectedOrder?.fillDelay}
      totalChunks={selectedOrder?.totalChunks}
    />
  );
};

const TxHash = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  if (!selectedOrder?.txHash) return null;

  return (
    <OrderDetails.DetailsRow
      label={t('txHash')}
      value={
        <a
          rel='noreferrer'
          target='_blank'
          href={getEtherscanLink(chainId, selectedOrder?.txHash, 'transaction')}
        >
          {makeElipsisAddress(selectedOrder?.txHash, ELIPSIS_PADDING)}
        </a>
      }
    />
  );
};

const Chunks = () => {
  const { selectedOrder } = useTwapOrdersContext();
  if (selectedOrder?.totalChunks === 1) return null;

  return <OrderDetails.Chunks totalChunks={selectedOrder?.totalChunks} />;
};

const ChunkSize = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const inCurrency = useOrderCurrencies().inCurrency;

  if (selectedOrder?.totalChunks === 1) return null;

  return (
    <OrderDetails.ChunkSize
      srcChunk={selectedOrder?.srcBidAmount}
      inCurrency={inCurrency}
    />
  );
};

const SrcAmount = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const currency = useOrderCurrencies().inCurrency;

  return (
    <OrderDetails.SrcAmount
      srcAmount={selectedOrder?.srcAmount}
      currency={currency}
    />
  );
};

const MinReceived = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const { t } = useTranslation();
  const currency = useOrderCurrencies().outCurrency;

  if (selectedOrder?.isMarketOrder) return null;

  return (
    <OrderDetails.MinReceived
      isMarketOrder={selectedOrder?.isMarketOrder}
      dstMinAmount={selectedOrder?.dstMinAmount}
      currency={currency}
    />
  );
};

const useOrderCurrencies = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const { t } = useTranslation();

  const inCurrency = useTwapOrderCurrency(selectedOrder?.srcTokenAddress);
  const outCurrency = useTwapOrderCurrency(selectedOrder?.dstTokenAddress);
  return { inCurrency, outCurrency };
};

const CreatedAt = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const { t } = useTranslation();

  if (!selectedOrder) return null;
  return (
    <OrderDetails.DetailsRow
      label={t('createdAt')}
      value={formatDateFromTimeStamp(
        selectedOrder.createdAt / 1000,
        'MMM DD, YYYY HH:mm',
      )}
    />
  );
};

const Expiration = () => {
  const { selectedOrder } = useTwapOrdersContext();
  if (!selectedOrder) return null;

  return <OrderDetails.Deadline deadline={selectedOrder.deadline} />;
};

const LimitPrice = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const { inCurrency, outCurrency } = useOrderCurrencies();

  const price = useMemo(() => {
    if (!selectedOrder || !inCurrency || !outCurrency) return;
    return selectedOrder.getLimitPrice(
      inCurrency?.decimals,
      outCurrency?.decimals,
    );
  }, [selectedOrder, inCurrency?.decimals, outCurrency?.decimals]);
  if (selectedOrder?.isMarketOrder) return null;

  return (
    <OrderDetails.Price
      price={price}
      isMarketOrder={selectedOrder?.isMarketOrder}
      inCurrency={inCurrency}
      outCurrency={outCurrency}
    />
  );
};

const InfoAccordion = ({
  title,
  children,
  expanded,
  onExpand,
}: {
  title: string;
  children: ReactNode;
  expanded: boolean;
  onExpand: () => void;
}) => {
  return (
    <Accordion className='TwapSelectedOrderAccordion' expanded={expanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} onClick={onExpand}>
        <Typography style={{fontSize: 16}}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

const Progress = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const { t } = useTranslation();
  if (selectedOrder?.totalChunks === 1) return null;

  return (
    <OrderDetails.DetailsRow
      label={t('progress')}
      value={`${selectedOrder?.progress.toFixed(0)}%`}
    />
  );
};

const ExcecutionPrice = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const { inCurrency, outCurrency } = useOrderCurrencies();
  const { t } = useTranslation();

  const excecutionPrice = useMemo(() => {
    if (!selectedOrder || !inCurrency || !outCurrency) return undefined;
    return selectedOrder.getExcecutionPrice(
      inCurrency?.decimals,
      outCurrency?.decimals,
    );
  }, [selectedOrder, inCurrency, outCurrency]);

  return (
    <OrderDetails.DetailsRow
      label={t('excecutionPrice')}
      value={
        excecutionPrice
          ? `1 ${inCurrency?.symbol} = ${formatNumber(excecutionPrice)}
        ${outCurrency?.symbol}`
          : undefined
      }
    />
  );
};

const Status = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const { t } = useTranslation();

  return (
    <OrderDetails.DetailsRow
      label={t('status')}
      value={selectedOrder?.status}
    />
  );
};

const AmountReceived = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const { t } = useTranslation();

  const currency = useOrderCurrencies().outCurrency;

  return (
    <OrderDetails.DetailsRow
      label={t('amountReceived')}
      value={`${formatCurrencyAmount(
        fromRawAmount(currency, selectedOrder?.dstFilledAmount),
        4,
      )} ${currency?.symbol}`}
    />
  );
};

const AmountSent = () => {
  const { selectedOrder } = useTwapOrdersContext();
  const { t } = useTranslation();

  const currency = useOrderCurrencies().inCurrency;

  return (
    <OrderDetails.DetailsRow
      label={t('amountSent')}
      value={`${formatCurrencyAmount(
        fromRawAmount(currency, selectedOrder?.srcFilledAmount),
        4,
      )} ${currency?.symbol}`}
    />
  );
};
