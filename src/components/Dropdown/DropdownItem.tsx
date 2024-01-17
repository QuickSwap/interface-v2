import React from 'react';
import { Box } from '@mui/material';
import { DropdownItemProps, sizes } from './types';
import Link from 'next/link';
import styles from 'styles/components/Dropdown.module.scss';

const Element: React.FC<DropdownItemProps> = ({ onClick, url, children }) => {
  return url ? (
    <Link href={url} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <Box onClick={onClick}>{children}</Box>
  );
};

const DropdownItem: React.FC<DropdownItemProps> = ({
  onClick,
  url,
  active,
  size = sizes.MEDIUM,
  children,
  ...props
}) => {
  return (
    <Box className={styles.dropdownItem} {...props}>
      <Element url={url} onClick={onClick} active={active} size={size}>
        {children}
      </Element>
    </Box>
  );
};

export default DropdownItem;
