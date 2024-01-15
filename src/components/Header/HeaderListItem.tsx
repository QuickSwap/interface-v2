import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { List } from '@mui/icons-material';
import { useRouter } from 'next/router';
import Collapse from '@mui/material/Collapse';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import styles from 'styles/components/Header.module.scss';

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
}> = ({
  item,
  onClick = () => {
    return false;
  },
}) => {
  const router = useRouter();
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
        router.push(item.link);
      }
    }
  };

  return (
    <>
      <ListItem
        disablePadding
        className={`${styles.menuListItem} ${
          router.pathname !== '/' && item.link.includes(router.pathname)
            ? 'active'
            : ''
        }`}
      >
        <ListItemButton onClick={handleClick} className={styles.menuListItem}>
          <ListItemText
            className={`${styles.mobileBtnText} ${styles.menuListItem} ${
              router.pathname !== '/' && item.link.includes(router.pathname)
                ? 'active'
                : ''
            }`}
          >
            <div className={`flex ${styles.menuListItem}`}>
              <div className='my-auto'>{item.text}</div>
              <div className={styles.mobileNewTag}>
                {item.isNew ? (
                  <picture>
                    <img
                      src='/assets/images/NewTag.png'
                      alt='new menu'
                      width={46}
                    />
                  </picture>
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
          className='ml-1 bl-1 pl-1'
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
