import React from 'react';
import {
  Box,
  Drawer,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { List } from '@mui/material';
import { Close } from '@mui/icons-material';
import { HeaderListItem, HeaderMenuItem } from './HeaderListItem';
import styles from 'styles/components/Header.module.scss';

export const MobileMenuDrawer: React.FC<{ menuItems: HeaderMenuItem[] }> = ({
  menuItems = [],
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Box className={styles.mobileMenuContainer}>
      <Box className={styles.mobileMenuClosedContainer}>
        {menuItems.slice(0, 3).map((item, i) => (
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
        <picture>
          <img src='/assets/images/ThreeDashIcon.svg' alt='Three Dash Icon' />
        </picture>
      </Box>

      <Drawer anchor='bottom' open={open} onClose={() => setOpen(false)}>
        <Box role='presentation'>
          <Box className={styles.mobileMenuDrawerContainer}>
            <List>
              {menuItems.map((item, index) => (
                <HeaderListItem
                  key={'item' + index}
                  item={item}
                  onClick={() => setOpen(false)}
                />
              ))}
              <ListItem disablePadding className={styles.closeItem}>
                <ListItemButton
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <ListItemText className={styles.mobileBtnText}>
                    <Box className='flex' mt={1}>
                      <Box className='my-auto ml-auto'>Close</Box>
                      <Box ml={1} pt={1}>
                        <Close />
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
