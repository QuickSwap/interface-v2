import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import styles from 'styles/components/CustomMenu.module.scss';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue]);
  return (
    <Box className={styles.customMenuWrapper}>
      <Box
        className={styles.customMenuHeader}
        onClick={() => setOpenMenu(!openMenu)}
      >
        <small>
          {title} {menuItem?.text}
        </small>
        {openMenu ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </Box>
      {openMenu && (
        <Box className={styles.customMenuContent}>
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
