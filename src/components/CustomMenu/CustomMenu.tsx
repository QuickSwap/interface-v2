import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import 'components/styles/CustomMenu.scss';

interface CustomMenuItem {
  text: string;
  onClick: () => void;
}

interface CustomMenuProps {
  title: string;
  menuItems: CustomMenuItem[];
}

const CustomMenu: React.FC<CustomMenuProps> = ({ title, menuItems }) => {
  const [openMenu, setOpenMenu] = React.useState(false);
  const [menuItem, setMenuItem] = React.useState<CustomMenuItem | null>(null);
  return (
    <>
      <Box className='customMenuWrapper' onClick={() => setOpenMenu(!openMenu)}>
        <Typography variant='body2'>
          {title} {menuItem?.text}
        </Typography>
        {openMenu ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </Box>
      {openMenu && (
        <Box className='menuContent'>
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
