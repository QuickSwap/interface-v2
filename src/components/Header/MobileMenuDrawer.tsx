import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { List } from '@material-ui/core';
import { ReactComponent as ThreeDashIcon } from 'assets/images/ThreeDashIcon.svg';
import { ReactComponent as CloseIcon } from 'assets/images/close_v3.svg';
import { HeaderListItem, HeaderMenuItem } from './HeaderListItem';

export const MobileMenuDrawer: React.FC<{ menuItems: HeaderMenuItem[] }> = ({
  menuItems = [],
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Box className='mobileMenuContainer'>
      <Box className='mobileMenuClosedContainer'>
        {menuItems
          .filter((item) => !item.items)
          .slice(0, 3)
          .map((item, i) => (
            <HeaderListItem
              key={'item' + i}
              item={item}
              onClick={() => setOpen(false)}
            />
          ))}
      </Box>
      <Box
        className='cursor-pointer'
        style={{ marginTop: '4px', paddingLeft: '24px' }}
        onClick={() => setOpen(true)}
      >
        <ThreeDashIcon />
      </Box>

      <Drawer anchor='bottom' open={open} onClose={() => setOpen(false)}>
        <Box role='presentation'>
          <Box className='mobileMenuDrawerContainer'>
            <List>
              {menuItems.map((item, index) => (
                <HeaderListItem
                  key={'item' + index}
                  item={item}
                  onClick={() => setOpen(false)}
                />
              ))}
              <ListItem disablePadding className='close-item'>
                <ListItemButton
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <ListItemText className='mobile-btn-text'>
                    <Box className='flex' mt={1}>
                      <Box className='my-auto ml-auto'>Close</Box>
                      <Box ml={1} pt={1}>
                        <CloseIcon />
                      </Box>
                    </Box>
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};
