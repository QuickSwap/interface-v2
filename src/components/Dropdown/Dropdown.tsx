import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { DropdownProps, dropdownPadding, sizes } from './types';
import 'components/styles/Dropdown.scss';

const Dropdown: React.FC<DropdownProps> = ({
  component,
  children,
  size = sizes.MEDIUM,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => setOpen((prev) => !prev);

  return (
    <Box
      borderRadius='10px'
      className='dropdownWrapper'
      width='100%'
      onClick={handleClick}
      {...props}
    >
      <Box
        className='flex'
        sx={{
          px: dropdownPadding[size].x,
          py: dropdownPadding[size].y,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {component}
        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </Box>
      {open && (
        <Box
          className='absolute'
          width='fit-content'
          overflow='hidden'
          mt='5px'
          top='85%'
          style={{
            borderBottomRightRadius: '10px',
            borderBottomLeftRadius: '10px',
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

export default Dropdown;
