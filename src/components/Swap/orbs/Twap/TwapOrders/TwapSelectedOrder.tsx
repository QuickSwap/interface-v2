import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CurrencyLogo from 'components/CurrencyLogo';
import { useActiveWeb3React } from 'hooks';
import React, { createContext, ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateFromTimeStamp, formatNumber, getEtherscanLink } from 'utils';
import { formatCurrencyAmount } from 'utils/v3/formatCurrencyAmount';
import { fromRawAmount, makeElipsisAddress } from '../../utils';
import {
  useCancelOrder,
  useOrderTitle,
  useTwapOrderCurrency,
  useTwapOrdersQuery,
} from '../hooks';
import { OrderDetails } from '../Components/OrderDetails';
import { Order, OrderStatus } from '@orbs-network/twap-sdk';

interface ContextType {
  selectedOrder: Order;
}
const Context = createContext({} as ContextType);

const useSelectedOrderContext = () => {
  return React.useContext(Context);
};

const ContextProvider = ({
  children,
  selectedOrderId,
}: {
  children: ReactNode;
  selectedOrderId?: number;
}) => {
  const { data: orders } = useTwapOrdersQuery();
  const selectedOrder = useMemo(
    () => orders?.find((order: Order) => order.id === selectedOrderId),
    [orders, selectedOrderId],
  );

  if (!selectedOrder) return null;

  return (
    <Context.Provider value={{ selectedOrder }}>{children}</Context.Provider>
  );
};

const ELIPSIS_PADDING = 5;

export function TwapSelectedOrder({
  selectedOrderId,
  onClose,
}: {
  selectedOrderId?: number;
  onClose: () => void;
}) {
  return (
    <ContextProvider selectedOrderId={selectedOrderId}>
      <Box className='TwapSelectedOrder'>
        <Header onClose={onClose} />
        <Box className='TwapSelectedOrderBody'>
          <Currencies />
          <Accordions />
          <CancelButton />
        </Box>
      </Box>
    </ContextProvider>
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

const Header = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const { selectedOrder } = useSelectedOrderContext();
  const title = useOrderTitle(selectedOrder);

  return (
    <Box
      className='flex items-center justify-between TwapSelectedOrderHeader'
      mb={2}
    >
      <Typography className='TwapOrderTitle'>
        # {selectedOrder.id} {title}
      </Typography>
      <Close className='cursor-pointer' onClick={onClose} />
    </Box>
  );
};

const Currencies = () => {
  const { selectedOrder } = useSelectedOrderContext();
  const { t } = useTranslation();

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
  const { selectedOrder } = useSelectedOrderContext();
  if (selectedOrder.totalChunks === 1) return null;

  return (
    <OrderDetails.FillDelay
      fillDelay={selectedOrder?.fillDelay}
      totalChunks={selectedOrder?.totalChunks}
    />
  );
};

const TxHash = () => {
  const { selectedOrder } = useSelectedOrderContext();
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  if (!selectedOrder.txHash) return null;

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
  const { selectedOrder } = useSelectedOrderContext();
  if (selectedOrder.totalChunks === 1) return null;

  return <OrderDetails.Chunks totalChunks={selectedOrder?.totalChunks} />;
};

const ChunkSize = () => {
  const { selectedOrder } = useSelectedOrderContext();
  const inCurrency = useOrderCurrencies().inCurrency;

  if (selectedOrder.totalChunks === 1) return null;

  return (
    <OrderDetails.ChunkSize
      srcChunk={selectedOrder?.srcBidAmount}
      inCurrency={inCurrency}
    />
  );
};

const SrcAmount = () => {
  const { selectedOrder } = useSelectedOrderContext();
  const currency = useOrderCurrencies().inCurrency;

  return (
    <OrderDetails.SrcAmount
      srcAmount={selectedOrder?.srcAmount}
      currency={currency}
    />
  );
};

const MinReceived = () => {
  const { selectedOrder } = useSelectedOrderContext();
  const { t } = useTranslation();
  const currency = useOrderCurrencies().outCurrency;

  if (selectedOrder.isMarketOrder) return null;

  return (
    <OrderDetails.MinReceived
      isMarketOrder={selectedOrder?.isMarketOrder}
      dstMinAmount={selectedOrder?.dstMinAmount}
      currency={currency}
    />
  );
};

const useOrderCurrencies = () => {
  const { selectedOrder } = useSelectedOrderContext();

  const inCurrency = useTwapOrderCurrency(selectedOrder?.srcTokenAddress);
  const outCurrency = useTwapOrderCurrency(selectedOrder?.dstTokenAddress);
  return { inCurrency, outCurrency };
};

const CreatedAt = () => {
  const { selectedOrder } = useSelectedOrderContext();
  const { t } = useTranslation();

  return (
    <OrderDetails.DetailsRow
      label={t('createdAt')}
      value={`${formatDateFromTimeStamp(
        selectedOrder.createdAt / 1000,
        'MMM DD, YYYY HH:mm',
      )} UTC`}
    />
  );
};

const CancelButton = () => {
  const { selectedOrder } = useSelectedOrderContext();
  const { t } = useTranslation();
  const { mutate: cancelOrder, isLoading } = useCancelOrder();

  if (selectedOrder.status !== OrderStatus.Open) return null;

  return (
    <Box className='swapButtonWrapper'>
      <Box width={'100%'}>
        <Button
          disabled={isLoading}
          fullWidth
          onClick={() => cancelOrder(selectedOrder.id)}
        >
          {isLoading ? t('loading') : t('cancelOrder')}
        </Button>
      </Box>
    </Box>
  );
};

const Expiration = () => {
  const { selectedOrder } = useSelectedOrderContext();

  return <OrderDetails.Deadline deadline={selectedOrder.deadline} />;
};

const LimitPrice = () => {
  const { selectedOrder } = useSelectedOrderContext();
  const { inCurrency, outCurrency } = useOrderCurrencies();

  const price = useMemo(() => {
    if (!inCurrency || !outCurrency) return;
    return selectedOrder.getLimitPrice(
      inCurrency?.decimals,
      outCurrency?.decimals,
    );
  }, [selectedOrder, inCurrency?.decimals, outCurrency?.decimals]);
  if (!price) return null;

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
        <Typography style={{ fontSize: 16 }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

const Progress = () => {
  const { selectedOrder } = useSelectedOrderContext();
  const { t } = useTranslation();
  if (selectedOrder.totalChunks === 1) return null;

  return (
    <OrderDetails.DetailsRow
      label={t('progress')}
      value={`${selectedOrder?.progress.toFixed(0)}%`}
    />
  );
};

const ExcecutionPrice = () => {
  const { selectedOrder } = useSelectedOrderContext();
  const { inCurrency, outCurrency } = useOrderCurrencies();
  const { t } = useTranslation();

  const excecutionPrice = useMemo(() => {
    if (!inCurrency || !outCurrency) return undefined;
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
  const { selectedOrder } = useSelectedOrderContext();
  const { t } = useTranslation();

  return (
    <OrderDetails.DetailsRow
      label={t('status')}
      value={selectedOrder?.status}
    />
  );
};

const AmountReceived = () => {
  const { selectedOrder } = useSelectedOrderContext();
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
  const { selectedOrder } = useSelectedOrderContext();
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
