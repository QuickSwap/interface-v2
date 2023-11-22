import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Button, List } from '@material-ui/core';
import { ReactComponent as ThreeDashIcon } from 'assets/images/ThreeDashIcon.svg';
import { ReactComponent as CloseIcon } from 'assets/images/close_v3.svg';
import { Link, useLocation, useHistory } from 'react-router-dom';

export const MobileMenuDrawer: React.FC<{ menuItems: any[] }> = ({
  menuItems = [],
}) => {
  const { pathname } = useLocation();
  const history = useHistory();
  const [state, setState] = React.useState(false);
  return (
    <Box className='mobileMenuContainer'>
      <Box className='mobileMenuClosedContainer'>
        {menuItems.slice(0, 3).map((item, i) => (
          <Box
            key={'item' + i}
            className={`mobileMenuItem ${
              pathname !== '/' && item.link.includes(pathname) ? 'active' : ''
            }`}
            onClick={() => {
              setState(false);
              if (item.onClick) {
                item.onClick();
              } else {
                if (item.isExternal) {
                  window.open(item.externalLink, item.target);
                } else {
                  history.push(item.link);
                }
              }
            }}
          >
            {item.text}
          </Box>
        ))}
        <ThreeDashIcon
          style={{ marginTop: '4px' }}
          onClick={() => setState(true)}
        />
      </Box>

      <Drawer anchor='bottom' open={state} onClose={() => setState(false)}>
        <Box role='presentation'>
          <Box className='mobileMenuDrawerContainer'>
            <List>
              {menuItems.map((item, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setState(false);
                      if (item.onClick) {
                        item.onClick();
                      } else {
                        if (item.isExternal) {
                          window.open(item.externalLink, item.target);
                        } else {
                          history.push(item.link);
                        }
                      }
                    }}
                  >
                    <ListItemText
                      className={`mobile-btn-text ${
                        pathname !== '/' && item.link.includes(pathname)
                          ? 'active'
                          : ''
                      }`}
                    >
                      {item.text}
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
              <ListItem disablePadding className='close-item'>
                <ListItemButton
                  onClick={() => {
                    setState(false);
                  }}
                >
                  <ListItemText className='mobile-btn-text'>
                    <Box className='flex' mt={1}>
                      <Box className='my-auto ml-auto'>Close</Box>
                      <Box ml={1}>
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
