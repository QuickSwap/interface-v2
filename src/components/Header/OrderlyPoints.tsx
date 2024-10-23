import React, { useRef, useState } from 'react';
import { Box } from '@material-ui/core';
import { useOnClickOutside } from 'hooks/v3/useOnClickOutside';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import QuickPerpsIcon from 'assets/images/quickPerpsIcon.svg';
import OrderlyPointsDropdown from './OrderlyPointsDropdown';

export const OrderlyPoints: React.FC = () => {
  const [openOrderlyPoints, setOpenOrderlyPoints] = useState(false);
  const orderlyPoints = useRef<any>(null);
  useOnClickOutside(orderlyPoints, () => {
    setOpenOrderlyPoints(false);
  });
  return (
    <div className='headerDropdownWrapper' ref={orderlyPoints}>
      <Box
        className='headerDropdown'
        onClick={() => setOpenOrderlyPoints(!openOrderlyPoints)}
      >
        <img src={QuickPerpsIcon} width={24} className='orderlyPointsIcon' />
        <small className='orderlyPointsTitle'>Trading Rewards</small>
        {openOrderlyPoints ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </Box>
      {openOrderlyPoints && <OrderlyPointsDropdown />}
    </div>
  );
};
