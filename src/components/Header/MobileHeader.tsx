import { Box, Button, ButtonBase } from '@material-ui/core';
import React, { useMemo } from 'react';
import { HeaderMenuItem } from './HeaderListItem';
import { ReactComponent as ThreeDashIcon } from 'assets/images/ThreeDashIcon.svg';
import { Link } from 'react-router-dom';

interface MobileHeaderProps {
  menuItems: HeaderMenuItem[];
  isMobile?: boolean;
  isTablet?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  menuItems,
  isTablet,
  isMobile,
}) => {
  const breakPoint = useMemo(() => {
    if (isMobile) return 4;
    if (isTablet) return 5;
    return 4;
  }, [isMobile, isTablet]);

  return (
    <Box
      className='mobile_header'
      sx={{
        width: '100vw',
        position: 'fixed',
        left: '0',
        bottom: '0',
        padding: '8px',
        zIndex: '100',
      }}
    >
      <Box
        style={{
          width: '100%',
          height: '64px',
          borderRadius: '32px',
          border: 'solid 1px rgba(55, 71, 105, 0.32)',
          backgroundColor: '#192338',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8%',
        }}
      >
        {menuItems.slice(0, breakPoint).map((val, i) => (
          <Link
            to={val.link}
            key={val.id}
            style={{
              textDecoration: 'none',
              fontSize: '14px',
              color: '#cedaeb',
            }}
          >
            {val.text}
          </Link>
        ))}
        <ButtonBase
          style={{
            width: 'fit-content',
          }}
        >
          <ThreeDashIcon />
        </ButtonBase>
      </Box>
    </Box>
  );
};
export default MobileHeader;
