import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { AlertTriangle, XCircle } from 'react-feather';
import 'components/styles/BetaWarningBanner.scss';

const BetaWarningBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(true);
  return (
    <>
      {showBanner && (
        <Box className='warningBanner'>
          <AlertTriangle size={20} />
          <caption>
            This site is in beta. By using this software, you understand,
            acknowledge and accept that Quickswap and/or the underlying software
            are provided “as is” and “as available” basis and without warranties
            or representations of any kind either expressed or implied
          </caption>
          <Box onClick={() => setShowBanner(false)} className='closeBanner'>
            <XCircle size={20} />
          </Box>
        </Box>
      )}
    </>
  );
};

export default BetaWarningBanner;
