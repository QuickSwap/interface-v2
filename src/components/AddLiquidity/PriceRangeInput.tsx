import { Box } from '@material-ui/core';
import React from 'react';
import { ReactComponent as AddIcon } from 'assets/images/AddIconBtn.svg';
import { ReactComponent as RemoveIcon } from 'assets/images/RemoveIconBtn.svg';
import { StyledBox, StyledLabel, StyledNumber } from './CommonStyledElements';

export default function PriceRangeInput() {
  return (
    <StyledBox
      width={200}
      height={100}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
      }}
    >
      <StyledLabel fontSize='13px' color='#696c80'>
        Min Price
      </StyledLabel>

      <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <AddIcon />
        <StyledNumber fontSize='18px'> 0.47069</StyledNumber>
        <RemoveIcon />
      </Box>

      <StyledLabel fontSize='13px' color='#696c80'>
        USDC per MATIC
      </StyledLabel>
    </StyledBox>
  );
}
