import React from 'react';
import { Box } from '@mui/material';
import styles from 'styles/components/Header.module.scss';
import { HeaderListItem, HeaderMenuItem } from './HeaderListItem';
import { NewSparkleTag } from './NewSparkleTag';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { StyledMenu } from './StyledMenu';
import { useRouter } from 'next/router';

export const HeaderDesktopItem: React.FC<{ item: HeaderMenuItem }> = ({
  item,
}) => {
  const router = useRouter();
  const hasSubMenu = Array.isArray(item.items);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    if (hasSubMenu) {
      //   setOpen(!open);
      setAnchorEl(event.currentTarget);
    } else if (item.onClick) {
      //   onClick();
      item.onClick();
    } else {
      //   onClick();
      if (item.isExternal) {
        window.open(item.externalLink, item.target);
      } else {
        router.push(item.link);
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        key={item.id}
        id={item.id}
        className={`${styles.menuItem} ${
          router.pathname !== '/' && item.link.includes(router.pathname)
            ? styles.activeMenuItem
            : ''
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
      <StyledMenu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {item.items?.map((d, i) => (
          <HeaderListItem
            key={'desktop-sub-menu-item' + i}
            item={d}
            onClick={handleClose}
          />
        ))}
      </StyledMenu>
    </>
  );
};
