import React from 'react';
import { Box, Typography, Menu, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { KeyboardArrowDown } from '@material-ui/icons';

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
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuItem, setMenuItem] = React.useState<CustomMenuItem | null>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Box
        className={classes.wrapper}
        onClick={(evt: any) => setAnchorEl(evt.currentTarget)}
      >
        <Typography variant='body2'>
          {title} {menuItem?.text}
        </Typography>
        <KeyboardArrowDown />
      </Box>
      <Menu
        id='demo-positioned-menu'
        aria-labelledby='demo-positioned-button'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              item.onClick();
              handleClose();
              setMenuItem(item);
            }}
          >
            {item.text}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default CustomMenu;
