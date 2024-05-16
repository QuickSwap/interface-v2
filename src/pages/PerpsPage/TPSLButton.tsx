import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTPSLOrder } from '@orderly.network/hooks';
import { Box, Button, Popover } from '@material-ui/core';
import { API } from '@orderly.network/types';
import { useQuery } from '@tanstack/react-query';
import { ColoredSlider } from 'components';
import { formatNumber } from 'utils';
import { formatDecimalInput } from 'utils/numbers';
import TPSLOrderConfirmModal from './TPSLOrderConfirmModal';
import { TPPnLInput } from './TPPnLInput';

export const TPSLButton: React.FC<{
  position: API.PositionExt;
  maxQuantity?: number;
  defaultOrder?: any;
  label?: string;
}> = ({ position, maxQuantity, defaultOrder, label = 'TP/SL' }) => {
  const [openConfirm, setOpenConfirm] = useState(false);

  const [computedOrder, { setValue, submit }] = useTPSLOrder(position, {
    defaultOrder,
  });

  const tpOrderError = useMemo(() => {
    if (!computedOrder.tp_trigger_price) return;
    if (
      position.position_qty > 0
        ? Number(computedOrder.tp_trigger_price) < position.mark_price
        : Number(computedOrder.tp_trigger_price) > position.mark_price
    ) {
      return `Minimum trigger price should be ${
        position.position_qty > 0 ? 'greater' : 'less'
      } than ${formatNumber(position.mark_price)}`;
    }
    return;
  }, [
    computedOrder.tp_trigger_price,
    position.mark_price,
    position.position_qty,
  ]);

  const slOrderError = useMemo(() => {
    if (!computedOrder.sl_trigger_price) return;
    if (
      position.position_qty > 0
        ? Number(computedOrder.sl_trigger_price) > position.mark_price
        : Number(computedOrder.sl_trigger_price) < position.mark_price
    ) {
      return `Maximum trigger price should be ${
        position.position_qty > 0 ? 'less' : 'greater'
      } than ${formatNumber(position.mark_price)}`;
    }
    return;
  }, [
    computedOrder.sl_trigger_price,
    position.mark_price,
    position.position_qty,
  ]);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  const token = position.symbol.split('_')?.[1];
  const quoteToken = position.symbol.split('_')?.[2];

  const inputRef = useRef<any>(null);

  const quantityPercent = maxQuantity
    ? (Number(computedOrder.quantity ?? 0) / maxQuantity) * 100
    : 0;
  const isEntirePosition = quantityPercent === 100;

  const { data: orderFilter } = useQuery({
    queryKey: ['orderly-filter', position.symbol],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.REACT_APP_ORDERLY_API_URL}/v1/public/info/${position.symbol}`,
      );
      const data = await res.json();
      return data?.data ?? null;
    },
  });

  useEffect(() => {
    if (open && maxQuantity && maxQuantity > 0) {
      setValue('quantity', maxQuantity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, maxQuantity]);

  useEffect(() => {
    if (!isEntirePosition) {
      inputRef?.current?.focus();
    }
  }, [isEntirePosition]);

  const [tpPriceFocused, setTPPriceFocused] = useState(false);
  const [slPriceFocused, setSLPriceFocused] = useState(false);

  const disabledConfirm = useMemo(() => {
    if (
      maxQuantity &&
      (!computedOrder.quantity || Number(computedOrder.quantity) > maxQuantity)
    ) {
      return true;
    }
    if (!computedOrder.sl_trigger_price && !computedOrder.tp_trigger_price)
      return true;
    if (slOrderError || tpOrderError) return true;
    return false;
  }, [
    computedOrder.quantity,
    computedOrder.sl_trigger_price,
    computedOrder.tp_trigger_price,
    maxQuantity,
    slOrderError,
    tpOrderError,
  ]);

  const estTPPnL = computedOrder.tp_pnl;
  const estSLPnL = computedOrder.sl_pnl;

  return (
    <>
      <Button className='orderTableActionButton' onClick={handleClick}>
        {label}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box padding={2} maxWidth={400} className='tpslWrapper'>
          {maxQuantity && (
            <>
              {' '}
              <Box className='flex items-center' width='100%' gridGap={8}>
                <Box
                  className={`tpslInputWrapper ${
                    isEntirePosition ? 'border-secondary1' : 'border-primary'
                  }`}
                  flex={1}
                  gridGap={8}
                  onClick={() => {
                    setValue('quantity', '');
                  }}
                >
                  <small>Quantity</small>
                  <input
                    ref={inputRef}
                    value={computedOrder.quantity}
                    style={{ opacity: isEntirePosition ? 0 : 1 }}
                    onChange={(e) => {
                      const value = formatDecimalInput(
                        e.target.value,
                        orderFilter && orderFilter.base_tick > 0
                          ? Math.log10(1 / Number(orderFilter.base_tick))
                          : undefined,
                      );
                      if (value !== null) {
                        setValue('quantity', value);
                      }
                    }}
                  />
                  <small>{isEntirePosition ? 'Entire Position' : token}</small>
                </Box>
                <Box
                  className={`tpslPositionButton ${
                    isEntirePosition ? 'border-primary' : 'border-gray2'
                  }`}
                  onClick={() => {
                    if (isEntirePosition) {
                      setValue('quantity', '');
                    } else {
                      setValue('quantity', maxQuantity.toString());
                    }
                  }}
                >
                  <small
                    className={
                      isEntirePosition ? 'text-primary' : 'text-secondary'
                    }
                  >
                    Position
                  </small>
                </Box>
              </Box>
              <Box
                className='leverageSquareWrapper'
                margin='20px 4px 16px 12px'
              >
                {[0, 1, 2, 3, 4].map((item) => (
                  <Box
                    key={item}
                    className={`leverageSquare
                ${quantityPercent > item * 25 ? ' filledSquare' : ''}`}
                    left={`calc(${(item / 4) * 100}% - 8px)`}
                  />
                ))}
                <ColoredSlider
                  min={0}
                  max={100}
                  step={1}
                  value={quantityPercent}
                  handleChange={(_, percent) => {
                    const value = formatDecimalInput(
                      ((Number(percent) / 100) * maxQuantity).toString(),
                      orderFilter && orderFilter.base_tick > 0
                        ? Math.log10(1 / Number(orderFilter.base_tick))
                        : undefined,
                    );
                    if (value !== null) {
                      setValue('quantity', value);
                    }
                  }}
                />
              </Box>
              <Box className='flex items-center justify-between'>
                <small>0%</small>
                <small>Max {formatNumber(maxQuantity)}</small>
              </Box>
            </>
          )}
          <Box
            className={maxQuantity ? 'border-top' : ''}
            mt={maxQuantity ? 1.5 : 0}
            pt={maxQuantity ? 1.5 : 0}
            pb={1.5}
          >
            <Box className='flex justify-between'>
              <small>Take profit</small>
              <small>
                Est. Pnl:{' '}
                <small
                  className={
                    estTPPnL
                      ? estTPPnL > 0
                        ? 'text-success'
                        : 'text-error'
                      : ''
                  }
                >
                  {estTPPnL ? formatNumber(estTPPnL) : '-'}
                </small>
              </small>
            </Box>
            <Box className='flex' gridGap={8} mt={1}>
              <Box
                className={`tpslInputWrapper ${
                  tpOrderError
                    ? 'border-error'
                    : tpPriceFocused
                    ? 'border-primary'
                    : 'border-secondary1'
                }`}
                flex={1}
                gridGap={8}
              >
                <small>TP price</small>
                <input
                  value={computedOrder.tp_trigger_price}
                  placeholder={quoteToken}
                  onFocus={() => setTPPriceFocused(true)}
                  onBlur={() => setTPPriceFocused(false)}
                  onChange={(e) => {
                    const value = formatDecimalInput(
                      e.target.value,
                      orderFilter && orderFilter.quote_tick > 0
                        ? Math.log10(1 / Number(orderFilter.quote_tick))
                        : undefined,
                    );
                    if (value !== null) {
                      setValue('tp_trigger_price', value);
                    }
                  }}
                />
              </Box>
              <TPPnLInput
                type='TP'
                quote={quoteToken}
                onChange={setValue}
                values={{
                  PnL: computedOrder.tp_pnl,
                  Offset: computedOrder.tp_offset,
                  'Offset%': computedOrder.tp_offset_percentage,
                }}
              />
            </Box>
            {tpOrderError && (
              <Box mt='5px'>
                <p className='span text-error'>{tpOrderError}</p>
              </Box>
            )}
            <Box className='flex justify-between' mt={1.5}>
              <small>Stop loss</small>
              <small>
                Est. Pnl:{' '}
                <small
                  className={
                    estSLPnL
                      ? estSLPnL > 0
                        ? 'text-success'
                        : 'text-error'
                      : ''
                  }
                >
                  {estSLPnL ? formatNumber(estSLPnL) : '-'}
                </small>
              </small>
            </Box>
            <Box className='flex' gridGap={8} mt={1}>
              <Box
                className={`tpslInputWrapper ${
                  slOrderError
                    ? 'border-error'
                    : slPriceFocused
                    ? 'border-primary'
                    : 'border-secondary1'
                }`}
                flex={1}
                gridGap={8}
              >
                <small>SL price</small>
                <input
                  value={computedOrder.sl_trigger_price}
                  placeholder={quoteToken}
                  onFocus={() => setSLPriceFocused(true)}
                  onBlur={() => setSLPriceFocused(false)}
                  onChange={(e) => {
                    const value = formatDecimalInput(
                      e.target.value,
                      orderFilter && orderFilter.quote_tick > 0
                        ? Math.log10(1 / Number(orderFilter.quote_tick))
                        : undefined,
                    );
                    if (value !== null) {
                      setValue('sl_trigger_price', value);
                    }
                  }}
                />
              </Box>
              <TPPnLInput
                type='SL'
                quote={quoteToken}
                onChange={setValue}
                values={{
                  PnL: computedOrder.sl_pnl,
                  Offset: computedOrder.sl_offset,
                  'Offset%': computedOrder.sl_offset_percentage,
                }}
              />
            </Box>
            {slOrderError && (
              <Box mt='5px'>
                <p className='span text-error'>{slOrderError}</p>
              </Box>
            )}
          </Box>
          <Box className='flex' mt={1} gridGap={8}>
            <Button className='perpsCancelButton' onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className='perpsConfirmButton'
              disabled={disabledConfirm}
              onClick={() => setOpenConfirm(true)}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Popover>
      {openConfirm && (
        <TPSLOrderConfirmModal
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          position={position}
          order={computedOrder}
          onSubmit={submit}
          onSuccess={handleClose}
        />
      )}
    </>
  );
};
