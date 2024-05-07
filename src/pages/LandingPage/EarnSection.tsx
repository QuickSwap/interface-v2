import React from 'react';
import Bonds from 'assets/images/featured/bonds.svg';
import Diamon from 'assets/images/featured/diamon.svg';
import Dragon from 'assets/images/featured/dragon.svg';
import { Box, Typography } from '@material-ui/core';

import { FeatureBlock } from 'components/FeatureBlock';
import { useTranslation } from 'react-i18next';

function EarnSection() {
  const { t } = useTranslation();

  const earn = [
    {
      img: Dragon,
      title: t('dragonslair'),
      desc: t('dragonslairDesc'),
      actionLabel: 'Stake',
      link: '/dragons',
    },
    {
      img: Diamon,
      title: t('farm'),
      desc: t('farmDesc'),
      actionLabel: 'Add',
      link: '/pools',
    },
    {
      img: Bonds,
      title: t('bonds'),
      desc: t('bondsDesc'),
      actionLabel: 'Trade Now',
      link: '/bonds',
    },
  ];
  return (
    <Box className='featureContainer'>
      <Box className='featureHeading'>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <Typography
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: '#448aff',
              lineHeight: ' 2.44',
            }}
          >
            {t('earn')}
          </Typography>
          <Typography
            style={{
              fontSize: '18px',
              color: '#ccd8e7',
              lineHeight: '1.67',
              maxWidth: '432px',
              textAlign: 'center',
            }}
          >
            {t('earnDesc')}
          </Typography>
        </Box>
      </Box>
      <Box
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          marginBottom: '128px',
        }}
      >
        {earn.map((val, index) => (
          <FeatureBlock
            key={index}
            title={val.title}
            desc={val.desc}
            actionLabel={val.actionLabel}
            image={val.img}
            link={val.link}
          />
        ))}
      </Box>
    </Box>
  );
}

export default EarnSection;
