import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { List } from '@material-ui/core';
import { useLocation, useHistory } from 'react-router-dom';
import Collapse from '@mui/material/Collapse';
import NewTag from 'assets/images/NewTag.png';

import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';

export interface HeaderMenuItem {
  text: string;
  id: string;
  link: string;
  items?: Array<HeaderMenuItem>;
  isNew?: boolean;
  isExternal?: boolean;
  target?: string;
  externalLink?: string;
  onClick?: () => void;
}

export const HeaderListItem: React.FC<{
  item: HeaderMenuItem;
  onClick?: () => void;
  menuDropdownOpen?: boolean;
}> = ({
  item,
  onClick = () => {
    return false;
  },
  menuDropdownOpen,
}) => {
  const { pathname } = useLocation();
  const history = useHistory();
  const hasSubMenu = Array.isArray(item.items);

  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    if (hasSubMenu) {
      setOpen(!open);
    } else if (item.onClick) {
      onClick();
      item.onClick();
    } else {
      onClick();
      if (item.isExternal) {
        window.open(item.externalLink, item.target);
      } else {
        history.push(item.link);
      }
    }
  };

  return (
    <>
      <ListItem
        disablePadding
        className={`menu-list-item ${
          pathname !== '/' && item.link.includes(pathname) ? 'active' : ''
        }`}
      >
        <ListItemButton onClick={handleClick} className='menu-list-item'>
          <ListItemText
            className={`mobile-btn-text menu-list-item ${
              pathname !== '/' && item.link.includes(pathname) ? 'active' : ''
            }`}
          >
            <div className='flex menu-list-item'>
              <div className='my-auto'>{item.text}</div>
              <div className='mobile-new-tag'>
                {item.isNew ? (
                  <img src={NewTag} alt='new menu' width={46} />
                ) : (
                  <></>
                )}
              </div>
            </div>
          </ListItemText>

          {hasSubMenu ? (
            open ? (
              <KeyboardArrowUp />
            ) : (
              <KeyboardArrowDown />
            )
          ) : (
            <></>
          )}
        </ListItemButton>
      </ListItem>
      {hasSubMenu && (
        <Collapse
          in={open}
          timeout='auto'
          unmountOnExit
          className='ml-1 bl-1 pl-1 dropdownMobile'
          style={{
            position: menuDropdownOpen ? 'static' : 'absolute',
            bottom: '120%',
            background: '#192338',
            borderRadius: '16px',
          }}
        >
          <List component='div'>
            {item.items?.map((d, i) => (
              <HeaderListItem
                key={`sub-menu-item-${i}`}
                item={d}
                onClick={onClick}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};
