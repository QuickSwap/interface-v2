import React, { useEffect, useMemo, useRef, useState } from 'react';
import { OrderParams, useOrderEntry } from '@orderly.network/hooks';
import { Box, Button, Popover } from '@material-ui/core';
import { API, OrderSide, OrderType } from '@orderly.network/types';
import { useQuery } from '@tanstack/react-query';
import { ColoredSlider } from 'components';
import { ArrowDropDown, ArrowDropUp } from '@material-ui/icons';
import { formatNumber } from 'utils';
import { formatDecimalInput } from 'utils/numbers';
import { positions } from '@orderly.network/perp';
import TPSLOrderConfirmModal from './TPSLOrderConfirmModal';

export const TPSLButton: React.FC<{
  position: API.PositionExt;
  maxQuantity: number;
}> = ({ position, maxQuantity }) => {
  const [quantity, setQuantity] = useState('');
  const [tpPrice, setTPPrice] = useState('');
  const [slPrice, setSLPrice] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);

  const tpOrder: OrderParams = {
    order_type: OrderType.STOP_MARKET,
    side: position.position_qty < 0 ? OrderSide.BUY : OrderSide.SELL,
    symbol: position.symbol,
    isStopOrder: true,
    order_quantity: quantity,
    trigger_price: tpPrice,
  };

  const slOrder: OrderParams = {
    order_type: OrderType.STOP_MARKET,
    side: position.position_qty < 0 ? OrderSide.BUY : OrderSide.SELL,
    symbol: position.symbol,
    isStopOrder: true,
    order_quantity: quantity,
    trigger_price: slPrice,
  };

  const { onSubmit: onTPSubmit, helper: tpHelper } = useOrderEntry(tpOrder, {
    watchOrderbook: true,
  });

  const { onSubmit: onSLSubmit, helper: slHelper } = useOrderEntry(slOrder, {
    watchOrderbook: true,
  });

  const { data: tpOrderValidation } = useQuery({
    queryKey: ['orderly-tp-order-validation', tpOrder],
    queryFn: async () => {
      const validation = await tpHelper.validator(tpOrder);
      return validation;
    },
  });

  const { data: slOrderValidation } = useQuery({
    queryKey: ['orderly-sl-order-validation', slOrder],
    queryFn: async () => {
      const validation = await slHelper.validator(slOrder);
      return validation;
    },
  });

  const tpOrderError = useMemo(() => {
    if (tpPrice === '') return;
    if (Number(tpPrice) < position.mark_price) {
      return `Minimum trigger price should be greater than ${formatNumber(
        position.mark_price,
      )}`;
    }
    if (tpOrderValidation && Object.values(tpOrderValidation).length > 0) {
      const validationErrors: any[] = Object.values(tpOrderValidation);
      return validationErrors[0]?.message;
    }
    return;
  }, [position.mark_price, tpOrderValidation, tpPrice]);

  const slOrderError = useMemo(() => {
    if (slPrice === '') return;
    if (Number(slPrice) > position.mark_price) {
      return `Maximum trigger price should be less than ${formatNumber(
        position.mark_price,
      )}`;
    }
    if (slOrderValidation && Object.values(slOrderValidation).length > 0) {
      const validationErrors: any[] = Object.values(slOrderValidation);
      return validationErrors[0]?.message;
    }
    return;
  }, [position.mark_price, slOrderValidation, slPrice]);

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

  const quantityPercent = (Number(quantity) / maxQuantity) * 100;
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
    if (open && maxQuantity > 0) {
      setQuantity(maxQuantity.toString());
    }
  }, [open, maxQuantity]);

  useEffect(() => {
    if (!isEntirePosition) {
      inputRef?.current?.focus();
    }
  }, [isEntirePosition]);

  const [openTPDropdown, setOpenTPDropdown] = useState(false);
  const [openSLDropdown, setOpenSLDropdown] = useState(false);

  const dropdownOptions = ['PnL', 'Offset', 'Offset%'];
  const [selectedOption, setSelectedOption] = useState('PnL');
  const [tpValue, setTPValue] = useState('');
  const [slValue, setSLValue] = useState('');
  const [tpPriceFocused, setTPPriceFocused] = useState(false);
  const [tpValueFocused, setTPValueFocused] = useState(false);
  const [slPriceFocused, setSLPriceFocused] = useState(false);
  const [slValueFocused, setSLValueFocused] = useState(false);

  const disabledConfirm = useMemo(() => {
    if (Number(quantity) === 0 || Number(quantity) > maxQuantity) {
      return true;
    }
    if (!Number(tpPrice) && !Number(slPrice)) return true;
    if (slOrderError || tpOrderError) return true;
    return false;
  }, [maxQuantity, quantity, slOrderError, slPrice, tpOrderError, tpPrice]);

  const getEstPnL = (quantity: string, trigger_price: string) => {
    if (!quantity || !trigger_price) return;
    return positions.unrealizedPnL({
      qty: Number(quantity),
      openPrice: position.average_open_price,
      markPrice: Number(trigger_price),
    });
  };

  const estTPPnL = getEstPnL(quantity, tpPrice);
  const estSLPnL = getEstPnL(quantity, slPrice);

  const getOrderValue = (
    quantity: string,
    triggerPrice: string,
    option: string,
    isTP?: boolean,
  ) => {
    if (!triggerPrice || !quantity) return;
    if (option === 'PnL') {
      return getEstPnL(quantity, triggerPrice);
    } else if (option === 'Offset') {
      return (
        (isTP ? 1 : -1) * (Number(triggerPrice) - position.average_open_price)
      );
    } else if (option === 'Offset%') {
      return (
        (isTP ? 1 : -1) *
        (((Number(triggerPrice) - position.average_open_price) /
          position.average_open_price) *
          100)
      );
    }
  };

  const getOrderPrice = (
    quantity: string,
    value: number,
    option: string,
    isTP?: boolean,
  ) => {
    if (!value || !Number(quantity)) return;
    if (option === 'PnL') {
      return value / Number(quantity) + position.average_open_price;
    } else if (option === 'Offset') {
      return (isTP ? 1 : -1) * value + position.average_open_price;
    } else if (option === 'Offset%') {
      return (
        ((isTP ? 1 : -1) * value * position.average_open_price) / 100 +
        position.average_open_price
      );
    }
  };

  return (
    <>
      <Button className='orderTableActionButton' onClick={handleClick}>
        TP/SL
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
          <Box className='flex items-center' width='100%' gridGap={8}>
            <Box
              className={`tpslInputWrapper ${
                isEntirePosition ? 'border-secondary1' : 'border-primary'
              }`}
              flex={1}
              gridGap={8}
              onClick={() => {
                setQuantity('');
              }}
            >
              <small>Quantity</small>
              <input
                ref={inputRef}
                value={quantity}
                style={{ opacity: isEntirePosition ? 0 : 1 }}
                onChange={(e) => {
                  const value = formatDecimalInput(
                    e.target.value,
                    orderFilter && orderFilter.base_tick > 0
                      ? Math.log10(1 / Number(orderFilter.base_tick))
                      : undefined,
                  );
                  if (value !== null) {
                    setQuantity(value);
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
                  setQuantity('');
                } else {
                  setQuantity(maxQuantity.toString());
                }
              }}
            >
              <small
                className={isEntirePosition ? 'text-primary' : 'text-secondary'}
              >
                Position
              </small>
            </Box>
          </Box>
          <Box className='leverageSquareWrapper' margin='20px 4px 16px 12px'>
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
                  setQuantity(value);
                }
              }}
            />
          </Box>
          <Box className='flex items-center justify-between'>
            <small>0%</small>
            <small>Max {formatNumber(maxQuantity)}</small>
          </Box>
          <Box className='border-top' mt={1.5} py={1.5}>
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
                  ref={inputRef}
                  value={tpPrice}
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
                      setTPPrice(value);
                      const orderValue = getOrderValue(
                        quantity,
                        value,
                        selectedOption,
                        true,
                      );
                      setTPValue(orderValue ? orderValue.toFixed(2) : '');
                    }
                  }}
                />
              </Box>
              <Box
                className={`tpslInputWrapper ${
                  tpValueFocused ? 'border-primary' : 'border-secondary1'
                }`}
                flex={1}
                gridGap={8}
              >
                <small>{selectedOption}</small>
                <Box className='flex items-center' position='relative'>
                  <input
                    ref={inputRef}
                    value={tpValue}
                    placeholder={
                      selectedOption === 'Offset%' ? '%' : quoteToken
                    }
                    onFocus={() => setTPValueFocused(true)}
                    onBlur={() => setTPValueFocused(false)}
                    onChange={(e) => {
                      const val = formatDecimalInput(e.target.value);
                      if (val !== null) {
                        setTPValue(val);
                        const price = getOrderPrice(
                          quantity,
                          Number(val),
                          selectedOption,
                          true,
                        );
                        if (price !== undefined) {
                          setTPPrice(
                            price.toFixed(
                              orderFilter && orderFilter.quote_tick > 0
                                ? Math.log10(1 / Number(orderFilter.quote_tick))
                                : undefined,
                            ),
                          );
                        }
                      }
                    }}
                  />
                  <Box
                    className='flex items-center'
                    onClick={() => {
                      setOpenTPDropdown(!openTPDropdown);
                    }}
                  >
                    {openTPDropdown ? <ArrowDropUp /> : <ArrowDropDown />}
                  </Box>
                  {openTPDropdown && (
                    <Box className='tpSLDropdown'>
                      {dropdownOptions.map((option) => (
                        <Box
                          key={option}
                          onClick={() => {
                            setSelectedOption(option);
                            setOpenTPDropdown(false);
                            const tpOrderValue = getOrderValue(
                              quantity,
                              tpPrice,
                              option,
                              true,
                            );
                            setTPValue(
                              tpOrderValue ? tpOrderValue.toFixed(2) : '',
                            );
                            const slOrderValue = getOrderValue(
                              quantity,
                              slPrice,
                              option,
                            );
                            setSLValue(
                              slOrderValue ? slOrderValue.toFixed(2) : '',
                            );
                          }}
                        >
                          <small>{option}</small>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
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
                  ref={inputRef}
                  value={slPrice}
                  placeholder={quoteToken}
                  onFocus={() => setSLPriceFocused(true)}
                  onBlur={() => setSLPriceFocused(false)}
                  onChange={(e) => {
                    const value = formatDecimalInput(
                      e.target.value,
                      orderFilter && orderFilter.base_tick > 0
                        ? Math.log10(1 / Number(orderFilter.base_tick))
                        : undefined,
                    );
                    if (value !== null) {
                      setSLPrice(value);
                      const orderValue = getOrderValue(
                        quantity,
                        value,
                        selectedOption,
                      );
                      setSLValue(orderValue ? orderValue.toFixed(2) : '');
                    }
                  }}
                />
              </Box>
              <Box
                className={`tpslInputWrapper ${
                  slValueFocused ? 'border-primary' : 'border-secondary1'
                }`}
                flex={1}
                gridGap={8}
              >
                <small>{selectedOption}</small>
                <Box className='flex items-center' position='relative'>
                  <input
                    ref={inputRef}
                    value={slValue}
                    placeholder={
                      selectedOption === 'Offset%' ? '%' : quoteToken
                    }
                    onFocus={() => setSLValueFocused(true)}
                    onBlur={() => setSLValueFocused(false)}
                    onChange={(e) => {
                      const val = formatDecimalInput(e.target.value);
                      if (val !== null) {
                        const valNumber =
                          selectedOption === 'PnL'
                            ? Number(val) * -1
                            : Number(val);
                        setSLValue(valNumber.toString());
                        const price = getOrderPrice(
                          quantity,
                          valNumber,
                          selectedOption,
                        );
                        if (price !== undefined) {
                          setSLPrice(
                            price.toFixed(
                              orderFilter && orderFilter.quote_tick > 0
                                ? Math.log10(1 / Number(orderFilter.quote_tick))
                                : undefined,
                            ),
                          );
                        }
                      }
                    }}
                  />
                  <Box
                    className='flex items-center'
                    onClick={() => {
                      setOpenSLDropdown(!openSLDropdown);
                    }}
                  >
                    {openSLDropdown ? <ArrowDropUp /> : <ArrowDropDown />}
                  </Box>
                  {openSLDropdown && (
                    <Box className='tpSLDropdown'>
                      {dropdownOptions.map((option) => (
                        <Box
                          key={option}
                          onClick={() => {
                            setSelectedOption(option);
                            setOpenSLDropdown(false);
                            const tpOrderValue = getOrderValue(
                              quantity,
                              tpPrice,
                              option,
                              true,
                            );
                            setTPValue(
                              tpOrderValue ? tpOrderValue.toFixed(2) : '',
                            );
                            const slOrderValue = getOrderValue(
                              quantity,
                              slPrice,
                              option,
                            );
                            setSLValue(
                              slOrderValue ? slOrderValue.toFixed(2) : '',
                            );
                          }}
                        >
                          <small>{option}</small>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
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
          tpOrder={Number(tpPrice) ? tpOrder : undefined}
          slOrder={Number(slPrice) ? slOrder : undefined}
          onTPSubmit={onTPSubmit}
          onSLSubmit={onSLSubmit}
        />
      )}
    </>
  );
};
