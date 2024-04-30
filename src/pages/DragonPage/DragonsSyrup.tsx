import React, { useState } from 'react';
import { Box, Tab } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { ReactComponent as QUICKV2Icon } from 'assets/images/QUICKV2.svg';
import SyrupIcon from 'assets/images/syrupIcon.png';
import 'pages/styles/dragon.scss';

const DragonsSyrup: React.FC = () => {
  const [tabValue, setTabValue] = useState('1');
  const { t } = useTranslation();

  const handleTabChange = (newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Box className='dragonSyrupWrapper dragonLairBg'>
        <Box className='dragonSyrupHeader'>
          <Box className='dragonSyrupHeaderWrapper'>
            <QUICKV2Icon width='40px' height='40px' />
            <Box>
              <h5 className='text-dragon-white'>{t('dragonSyrup')}</h5>
              <small>{t('dragonSyrupTitle')}</small>
            </Box>
          </Box>
          <Box className='tab-container'>
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
