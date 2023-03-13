import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import 'components/styles/CustomMenu.scss';

interface CustomMenuItem {
  text: string;
  onClick: () => void;
}

interface CustomMenuProps {
  title: string;
  menuItems: CustomMenuItem[];
  selectedValue?: string;
}

const CustomMenu: React.FC<CustomMenuProps> = ({
  title,
  menuItems,
  selectedValue,
}) => {
  const [openMenu, setOpenMenu] = React.useState(false);
  const [menuItem, setMenuItem] = React.useState<CustomMenuItem | undefined>(
    undefined,
  );
  useEffect(() => {
    if (selectedValue) {
      setMenuItem(menuItems.find((item) => item.text === selectedValue));
    }
  }, [selectedValue, menuItems]);
  return (
    <Box className='customMenuWrapper'>
      <Box className='customMenuHeader' onClick={() => setOpenMenu(!openMenu)}>
        <small>
          {title} {menuItem?.text}
        </small>
        {openMenu ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </Box>
      {openMenu && (
        <Box className='customMenuContent'>
          {menuItems.map((item, index) => (
            <Box
              key={index}
              onClick={() => {
                item.onClick();
                setOpenMenu(false);
                setMenuItem(item);
              }}
            >
              <small className='text-secondary'>{item.text}</small>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CustomMenu;
