import React from 'react';
import { Box } from '@material-ui/core';
import { Token } from '@uniswap/sdk';
import { V3Farm } from './Farms';

interface Props {
  farm: { token0: Token; token1: Token; farms: V3Farm[] };
}

export const V3FarmCard: React.FC<Props> = ({ farm }) => {
  return <Box></Box>;
};

export default V3FarmCard;
