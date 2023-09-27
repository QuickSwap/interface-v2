import React from 'react';
import { Box } from '@material-ui/core';
import { DropdownItemProps, dropdownItemPadding, sizes } from './types';
import { Link } from 'react-router-dom';

const Element: React.FC<DropdownItemProps> = ({ onClick, url, children }) => {
  return url ? (
    <Link to={url} onClick={onClick}>
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
    <Box
      className='cursor-pointer'
      {...props}
      sx={{
        px: dropdownItemPadding[size].x,
        py: dropdownItemPadding[size].y,
        width: '100%',
        color: 'text',
        borderRadius: '10px',
      }}
    >
      <Element url={url} onClick={onClick} active={active} size={size}>
        {children}
      </Element>
    </Box>
  );
};

export default DropdownItem;
