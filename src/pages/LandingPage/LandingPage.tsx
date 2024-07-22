import { Box } from '@material-ui/core';

import { getConfig } from 'config/index';
import { useActiveWeb3React } from 'hooks';
import EarnSection from 'pages/LandingPage/EarnSection';
import GlobalSection from 'pages/LandingPage/GlobalSection';
import TradeSection from 'pages/LandingPage/TradeSection';
import 'pages/styles/landing.scss';
import React, { useEffect } from 'react';
import { useIsV2 } from 'state/application/hooks';
import CommunityBlock from './CommunityBlock';

const LandingPage: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);

  const { updateIsV2 } = useIsV2();

  useEffect(() => {
    updateIsV2(false);
  }, [updateIsV2]);

  return (
    <div id='landing-page' style={{ width: '100%' }}>
      <GlobalSection />
      <TradeSection />
      <EarnSection />
      <Box className='communityContainer'>
        <Box className='socialContent'>
          <CommunityBlock />
        </Box>
      </Box>
    </div>
  );
};

export default LandingPage;
