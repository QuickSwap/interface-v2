import * as React from 'react';
import { MenuProps, styled, Menu } from '@material-ui/core';

export const StyledMenu = styled((props: MenuProps) => (
  <Menu
    {...props}
    elevation={0}
    anchorOrigin={
      props?.anchorOrigin || {
        vertical: 'bottom',
        horizontal: 'right',
      }
    }
    transformOrigin={
      props?.transformOrigin || {
        vertical: 'top',
        horizontal: 'right',
      }
    }
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    background: '#232734',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: '#c7cad9',
        marginRight: theme.spacing(1.5),
      },
    },
  },
}));
