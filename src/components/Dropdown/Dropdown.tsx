import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { DropdownProps, sizes } from './types';
import '~/components/styles/Dropdown.scss';

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
      className='dropdownWrapper'
      borderRadius='10px'
      width='100%'
      onClick={handleClick}
      {...props}
    >
      <Box className='flex items-center cursor-pointer'>
        {component}
        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </Box>
      {open && (
        <Box className='dropdownItemsWrapper' width='fit-content'>
          {children}
        </Box>
      )}
    </Box>
  );
};

export default Dropdown;
