import React, { useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
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
    <div className='customMenuWrapper'>
      <div className='customMenuHeader' onClick={() => setOpenMenu(!openMenu)}>
        <small>
          {title} {menuItem?.text}
        </small>
        {openMenu ? <ChevronUp /> : <ChevronDown />}
      </div>
      {openMenu && (
        <div className='customMenuContent'>
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                item.onClick();
                setOpenMenu(false);
                setMenuItem(item);
              }}
            >
              <small className='text-secondary'>{item.text}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomMenu;
