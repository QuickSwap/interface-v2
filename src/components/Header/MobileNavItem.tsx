import React, { useState } from 'react';
import { HeaderMenuItem } from './HeaderListItem';
import { Box } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import Fire from 'assets/images/fire-new.svg';

interface MobileNavItemProps {
  navItem: HeaderMenuItem;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ navItem }) => {
  const [isActive, setIsActive] = useState(false);
  console.log('🚀 ~ isActive:', isActive);

  return (
    <>
      {navItem.items ? (
        <Box>
          <Box
            style={{
              display: 'flex',
              gap: '4px',
              height: '48px',
              alignItems: 'center',
              fontSize: '16px',
            }}
            onClick={() => {
              setIsActive(!isActive);
            }}
          >
            {navItem.text}
            <KeyboardArrowDown
              style={{
                transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: '0.3s ease-in-out',
              }}
            />
          </Box>
          {navItem.items && (
            <Box
              style={{
                // height: isActive ? 'auto' : '0px',
                maxHeight: isActive ? '90px' : '0px',
                overflow: 'hidden',
                transition: '0.3s ease-in-out',
                paddingLeft: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {navItem.items.map((item, index) => {
                return (
                  <Link
                    key={index}
                    to={item.link}
                    style={{
                      color: '#c7cad9',
                      textDecoration: 'none',
                      fontSize: '14px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      gap: '4px',
                    }}
                  >
                    {item.text}
                    {item.isNew && <img src={Fire} alt='fire' />}
                  </Link>
                );
              })}
            </Box>
          )}
        </Box>
      ) : (
        <Box
          style={{
            display: 'flex',
            height: '48px',
            alignItems: 'center',
            verticalAlign: 'center',
            fontSize: '16px',
          }}
        >
          <Link
            onClick={navItem.onClick}
            to={navItem.link}
            style={{
              color: '#c7cad9',
              textDecoration: 'none',
              width: '100%',
            }}
          >
            {navItem.text}
          </Link>
        </Box>
      )}
    </>
  );
};
export default MobileNavItem;
