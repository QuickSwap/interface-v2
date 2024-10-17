import {
  Box,
  Button,
  LinearProgress,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import { Close, KeyboardArrowDown } from '@material-ui/icons';
import { Order, OrderStatus } from '@orbs-network/twap-sdk';
import CurrencyLogo from 'components/CurrencyLogo';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Virtuoso } from 'react-virtuoso';
import { formatDateFromTimeStamp } from 'utils';
import {
  useGrouppedTwapOrders,
  useOrderTitle,
  useTwapOrderCurrency,
} from '../hooks';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { Card } from '../Components/Components';
import { Currency } from '@uniswap/sdk';
import { Skeleton } from '@material-ui/lab';

export const TwapOrdersList = ({
  onClose,
  onOrderSelect,
  hide,
}: {
  onClose: () => void;
  onOrderSelect: (id: number) => void;
  hide: boolean;
}) => {
  const groupedOrders = useGrouppedTwapOrders();
  const [selectedStatus, setSelectedStatus] = useState(OrderStatus.All);
  const Row = useCallback(
    ({ data, index, style }: { data: Order[]; index: number; style?: any }) => {
      const order = data[index];

      return (
        <div style={style}>
          <TwapOrdersListItem
            order={order}
            onSelect={() => onOrderSelect(order.id)}
          />
        </div>
      );
    },
    [onOrderSelect],
  );

  if (hide) return null;

  const orders = groupedOrders?.[selectedStatus] || [];

  return (
    <Box className='TwapOrdersList'>
      <Box className='flex items-center justify-between' mb={2}>
        <OrderMenu
          onSelect={setSelectedStatus}
          selectedStatus={selectedStatus}
        />
        <Close className='cursor-pointer' onClick={onClose} />
      </Box>
      {orders.length === 0 ? (
        <EmptyList selectedStatus={selectedStatus} />
      ) : (
        <Virtuoso
          totalCount={orders.length}
          itemContent={(index) => Row({ data: orders, index })}
        />
      )}
    </Box>
  );
};

const EmptyList = ({ selectedStatus }: { selectedStatus: OrderStatus }) => {
  const { t } = useTranslation();

  return (
    <Typography className='TwapOrdersListEmpty'>
      {' '}
      {selectedStatus === OrderStatus.All
        ? `No ${t('orders')}`
        : `No ${t(selectedStatus)} orders`}
    </Typography>
  );
};

const OrderMenu = ({
  selectedStatus,
  onSelect,
}: {
  selectedStatus: OrderStatus;
  onSelect: (status: OrderStatus) => void;
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
    (value: OrderStatus) => {
      handleClose();
      onSelect(value);
    },
    [handleClose, onSelect],
  );

  return (
    <>
      <button onClick={onOpen} className='TwapOrderMenuButton'>
        <p>{t(selectedStatus)}</p>
        <KeyboardArrowDown />
      </button>
      <Menu
        className='TwapOrderMenu'
        id='order-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'swap-button',
          role: 'listbox',
        }}
      >
        {Object.values(OrderStatus).map((status, index) => {
          const selected = selectedStatus === status;
          return (
            <MenuItem
              className='TwapOrderMenuItem'
              key={status}
              disabled={selected}
              selected={selected}
              onClick={() => handleMenuItemClick(status)}
            >
              {t(status)}
              {selected && <Box ml={5} className='selectedMenuDot' />}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export function TwapOrdersListItem({
  order,
  onSelect,
}: {
  order: Order;
  onSelect: () => void;
}) {
  const inCurrency = useTwapOrderCurrency(order.srcTokenAddress);
  const outCurrency = useTwapOrderCurrency(order.dstTokenAddress);

  const _onSelect = () => {
    if (!inCurrency || !outCurrency) return;
    onSelect();
  };

  return (
    <Box className='TwapOrdersListItem'>
      <Card className='TwapOrdersListItemCard' onClick={_onSelect}>
        <Header order={order} />
        <Progress order={order} />
        <Currencies inCurrency={inCurrency} outCurrency={outCurrency} />
      </Card>
    </Box>
  );
}

const Header = ({ order }: { order: Order }) => {
  const title = useOrderTitle(order);
  return (
    <Box className='TwapOrdersListItemHeader'>
      <Typography className='TwapOrderTitle'>
        # {order.id} {title}{' '}
      </Typography>
      <Typography>{order.status}</Typography>
    </Box>
  );
};

const Progress = ({ order }: { order: Order }) => {
  return (
    <Box className='TwapOrdersListItemProgress'>
      <LinearProgress variant='determinate' value={order.progress} />
      <Typography>{parseFloat(Number(order.progress).toFixed(2))}%</Typography>
    </Box>
  );
};

const Currencies = ({
  inCurrency,
  outCurrency,
}: {
  inCurrency?: Currency;
  outCurrency?: Currency;
}) => {
  return (
    <Box className='TwapOrdersListItemCurrencies'>
      <Box className='TwapOrdersListItemCurrency'>
        {!inCurrency ? (
          <Skeleton width={24} height={24} />
        ) : (
          <CurrencyLogo currency={inCurrency} size='24px' />
        )}
        {inCurrency && <Typography>{inCurrency?.symbol}</Typography>}
      </Box>
      <ArrowForwardIcon />
      <Box className='TwapOrdersListItemCurrency'>
        {!outCurrency ? (
          <Skeleton width={24} height={24} />
        ) : (
          <CurrencyLogo currency={outCurrency} size='24px' />
        )}
        {outCurrency && <Typography>{outCurrency?.symbol}</Typography>}
      </Box>
    </Box>
  );
};
