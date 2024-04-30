import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import 'components/styles/HeaderHomepage.scss';
import { HeaderListItem, HeaderMenuItem } from './HeaderListItem';
import { NewSparkleTag } from './NewSparkleTag';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { StyledMenu } from './StyledMenu';
import { Box } from '@material-ui/core';

export const HeaderDesktopItem: React.FC<{ item: HeaderMenuItem }> = ({
  item,
}) => {
  const { pathname } = useLocation();
  const history = useHistory();
  const hasSubMenu = Array.isArray(item.items);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    if (hasSubMenu) {
      setAnchorEl(null);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (hasSubMenu) {
      setAnchorEl(event.currentTarget);
    } else if (item.onClick) {
      item.onClick();
    } else {
      if (item.isExternal) {
        window.open(item.externalLink, item.target);
      } else {
        history.push(item.link);
      }
    }
  };

  return (
    <div className='navMenu'>
      <Box
        key={item.id}
        id={item.id}
        className={`menuItem  ${
          pathname !== '/' && item.link.includes(pathname) ? 'active' : ''
        }`}
        onClick={handleClick}
      >
        <small>{item.text}</small>
        {item.isNew && <NewSparkleTag />}
        {hasSubMenu ? (
          open ? (
            <KeyboardArrowUp />
          ) : (
            <KeyboardArrowDown />
          )
        ) : (
          <></>
        )}
      </Box>

      <div className='dropdown-wrapper'>
        <div id='basic-menu' className='subMenu dropdown'>
          {item.items?.map((d, i) => (
            <HeaderListItem
              key={'desktop-sub-menu-item' + i}
              item={d}
              onClick={handleClose}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
