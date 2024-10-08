import { Box, Button, Card, LinearProgress, Menu, MenuItem, Typography } from '@material-ui/core';
import { Close, KeyboardArrowDown } from '@material-ui/icons';
import { Order, OrderStatus } from '@orbs-network/twap-sdk';
import CurrencyLogo from 'components/CurrencyLogo';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Virtuoso } from 'react-virtuoso';
import { formatDateFromTimeStamp } from 'utils';
import { useGrouppedTwapOrders, useTwapOrderCurrency } from '../hooks';
import { useTwapOrdersContext } from './context';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

export const TwapOrdersList = () => {
  const groupedOrders = useGrouppedTwapOrders();
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState(OrderStatus.All);
  const { selectedOrderId, onDismiss } = useTwapOrdersContext();
  const Row = useCallback(
    ({ data, index, style }: { data: Order[]; index: number; style?: any }) => {
      const order = data[index];

      return (
        <div style={style}>
          <TwapOrdersListItem order={order} />
        </div>
      );
    },
    [],
  );

  if (selectedOrderId) return null;

  const orders = groupedOrders?.[selectedStatus] || [];

  return (
    <Box className='TwapOrdersList'>
      <Box className='flex items-center justify-between' mb={2}>
        <OrderMenu
          onSelect={setSelectedStatus}
          selectedStatus={selectedStatus}
        />
        <Close className='text-secondary cursor-pointer' onClick={onDismiss} />
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
      <Button
        onClick={onOpen}
        id='swap-button'
        aria-controls={open ? 'swap-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        variant='text'
        disableElevation
        endIcon={<KeyboardArrowDown />}
        className={`tab tabMenu`}
      >
        {t(selectedStatus)}
      </Button>
      <Menu
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



export function TwapOrdersListItem({ order }: { order: Order }) {
  const onSelect = useTwapOrdersContext().setSelectedOrderId;
  return (
    <Box className='TwapOrdersListItem'>
      <Card
        className='TwapOrdersListItemCard'
        onClick={() => onSelect(order.id)}
      >
        <Header order={order} />
        <Progress order={order} />
        <Currencies order={order} />
      </Card>
    </Box>
  );
}

const Header = ({ order }: { order: Order }) => {
  return (
    <Box className='TwapOrdersListItemHeader'>
      <Typography className='TwapOrderTitle'>
        # {order.id} {order.orderType}{' '}
        <small>{`(${formatDateFromTimeStamp(
          order.createdAt / 1000,
          'MMM DD, YYYY HH:mm',
        )})`}</small>
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

const Currencies = ({ order }: { order: Order }) => {
  const inCurrency = useTwapOrderCurrency(order.srcTokenAddress);
  const outCurrency = useTwapOrderCurrency(order.dstTokenAddress);

  return (
    <Box className='TwapOrdersListItemCurrencies'>
      <Box className='TwapOrdersListItemCurrency'>
        <CurrencyLogo currency={inCurrency} size='24px' />
        <Typography>{inCurrency?.symbol}</Typography>
      </Box>
      <ArrowForwardIcon />
      <Box className='TwapOrdersListItemCurrency'>
        <CurrencyLogo currency={outCurrency} size='24px' />
        <Typography>{outCurrency?.symbol}</Typography>
      </Box>
    </Box>
  );
};
