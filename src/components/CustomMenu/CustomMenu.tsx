import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';

const useStyles = makeStyles(({ palette }) => ({
  wrapper: {
    borderRadius: 10,
    border: `1px solid ${palette.secondary.dark}`,
    height: '100%',
    width: '100%',
    padding: '0 8px 0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: palette.text.secondary,
  },
  menuContent: {
    borderRadius: 10,
    border: `1px solid ${palette.secondary.dark}`,
    padding: 12,
    background: palette.background.paper,
    position: 'relative',
    zIndex: 2,
    marginTop: 8,
  },
}));

interface CustomMenuItem {
  text: string;
  onClick: () => void;
}

interface CustomMenuProps {
  title: string;
  menuItems: CustomMenuItem[];
}

const CustomMenu: React.FC<CustomMenuProps> = ({ title, menuItems }) => {
  const classes = useStyles();
  const [openMenu, setOpenMenu] = React.useState(false);
  const [menuItem, setMenuItem] = React.useState<CustomMenuItem | null>(null);
  return (
    <>
      <Box className={classes.wrapper} onClick={() => setOpenMenu(!openMenu)}>
        <Typography variant='body2'>
          {title} {menuItem?.text}
        </Typography>
        {openMenu ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </Box>
      {openMenu && (
        <Box className={classes.menuContent}>
          {menuItems.map((item, index) => (
            <Box
              my={1}
              key={index}
              onClick={() => {
                item.onClick();
                setOpenMenu(false);
                setMenuItem(item);
              }}
            >
              <Typography variant='body2' color='textSecondary'>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};

export default CustomMenu;
