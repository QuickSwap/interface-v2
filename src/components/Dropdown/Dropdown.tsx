import React, { useState } from 'react';
import { Box } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { DropdownProps } from './types';
import styles from 'styles/components/Dropdown.module.scss';

const Dropdown: React.FC<DropdownProps> = ({
  component,
  children,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => setOpen((prev) => !prev);

  return (
    <Box
      className={styles.dropdownWrapper}
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
        <Box className={styles.dropdownItemsWrapper} width='fit-content'>
          {children}
        </Box>
      )}
    </Box>
  );
};

export default Dropdown;
