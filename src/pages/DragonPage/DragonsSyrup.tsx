import React, { useState } from 'react';
import { Box, Tab, useMediaQuery } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { ReactComponent as QUICKV2Icon } from 'assets/images/quickIcon.svg';
import SyrupIcon from 'assets/images/syrupIcon.png';
import 'pages/styles/dragon.scss';
import { useTheme } from '@material-ui/core/styles';

const DragonsSyrup: React.FC = () => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [tabValue, setTabValue] = useState('1');
  const { t } = useTranslation();

  const handleTabChange = (newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Box className='dragonSyrupWrapper dragonLairBg'>
        <Box
          className={isMobile ? 'dragonSyrupHeaderMobile' : 'dragonSyrupHeader'}
        >
          <Box className='dragonSyrupHeaderWrapper'>
            <QUICKV2Icon
              width='40px'
              height='40px'
              style={{
                display: isMobile ? 'none' : '',
              }}
            />
            <Box>
              <h5 className='text-dragon-white'>{t('dragonSyrup')}</h5>
              <small>{t('dragonSyrupTitle')}</small>
            </Box>
          </Box>
          <Box
            className='tab-container'
            style={{
              width: isMobile ? '170px' : '',
              marginTop: isMobile ? '20px' : '',
            }}
          >
            <button
              className={tabValue === '1' ? 'active' : ''}
              onClick={() => handleTabChange('1')}
            >
              Active
            </button>
            <button
              className={tabValue === '0' ? 'active' : ''}
              onClick={() => handleTabChange('0')}
            >
              Ended
            </button>
          </Box>
        </Box>
        {tabValue === '1' && (
          <Box className='dragonSyrupContainer'>
            <Box className='text-center'>
              <img src={SyrupIcon} />
              <h5>{t('dragonSyrupPoolUnavailable')}</h5>
            </Box>
          </Box>
        )}
        {tabValue === '0' && (
          <Box className='dragonSyrupContainer'>
            <Box className='text-center'>
              <img src={SyrupIcon} />
              <h5>{t('dragonSyrupPoolUnavailable')}</h5>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default DragonsSyrup;
