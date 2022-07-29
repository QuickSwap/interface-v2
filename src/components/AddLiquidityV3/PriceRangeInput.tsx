import { Box } from '@material-ui/core';
import React from 'react';
import { ReactComponent as AddIcon } from 'assets/images/AddIconBtn.svg';
import { ReactComponent as RemoveIcon } from 'assets/images/RemoveIconBtn.svg';
import { StyledBox, StyledLabel, StyledNumber } from './CommonStyledElements';
import NumericalInput from 'components/NumericalInput';

interface PriceRangeInputProps {
  label?: string;
  bottomLabel?: string;
  id?: string;
  onMinusClick?: () => void;
  onPlusClick?: () => void;
  setAmount: (val: string) => void;
  amount: any;
}

const PriceRangeInput: React.FC<PriceRangeInputProps> = ({
  label,
  bottomLabel,
  id,
  onMinusClick,
  onPlusClick,
  amount,
  setAmount,
}) => {
  return (
    <StyledBox
      id={id}
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
        {label}
      </StyledLabel>

      <Box className='flex justify-around items-center' width={'93%'}>
        <AddIcon className='cursor-pointer' onClick={onMinusClick} />
        <NumericalInput
          value={amount}
          align='center'
          placeholder='0.00'
          onUserInput={(val) => {
            setAmount(val);
          }}
        />
        <RemoveIcon className='cursor-pointer' onClick={onPlusClick} />
      </Box>

      <StyledLabel fontSize='13px' color='#696c80'>
        {bottomLabel}
      </StyledLabel>
    </StyledBox>
  );
};

export default PriceRangeInput;
