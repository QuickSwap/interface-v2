import React from 'react';
import { useMediaQuery, useTheme } from '@material-ui/core';
import { Banner } from '@hypelab/sdk-react';
import { BannerEmbed } from '@spindl-xyz/embed-react';
import { useActiveWeb3React } from 'hooks';

const HypeLabAds: React.FC = () => {
  const { isActive, account } = useActiveWeb3React();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  return (
    <div className='flex justify-center'>
      {isActive && (
        <BannerEmbed
          publisherId='quickswap' // required (get from Spindl team)
          placementId='swap_page' // required (get from Spindl team)
          style={{
            maxWidth: '728px',
            width: '100%',
            height: '90px',
          }} // recommended to add desired width/height
          address={account}
        />
      )}
      {!isActive && isMobile && <Banner placement='4177d327af' />}
      {!isActive && !isMobile && <Banner placement='f70b3ef021' />}
    </div>
  );
};

export default HypeLabAds;
