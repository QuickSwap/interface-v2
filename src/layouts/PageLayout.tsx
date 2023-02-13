import React, { lazy, useEffect, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useIsProMode } from 'state/application/hooks';
import { useActiveWeb3React } from 'hooks';
import { useArcxAnalytics } from '@arcxmoney/analytics';
const Header = lazy(() => import('components/Header'));
const Footer = lazy(() => import('components/Footer'));
const BetaWarningBanner = lazy(() => import('components/BetaWarningBanner'));
const CustomModal = lazy(() => import('components/CustomModal'));
const Background = lazy(() => import('./Background'));

export interface PageLayoutProps {
  children: any;
  name?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, name }) => {
  const history = useHistory();
  const { chainId, account } = useActiveWeb3React();
  const arcxSDK = useArcxAnalytics();
  const { isProMode, updateIsProMode } = useIsProMode();
  const [openPassModal, setOpenPassModal] = useState(false);
  const getPageWrapperClassName = () => {
    console.log('getPageWrapperClassName => ', location);
    if (isProMode) {
      return '';
    } else if (location.href.indexOf('/swap?') > 0) {
      return 'pageWrapper-no-max';
    }
    return name == 'prdt' ? 'pageWrapper-no-max' : 'pageWrapper';
  };
  useEffect(() => {
    const unlisten = history.listen((location) => {
      const willBeSwapPage = location.pathname === '/swap';

      // disallow the pro mode except for the swap page
      if (!willBeSwapPage) {
        updateIsProMode(false);
      }
    });
    return function cleanup() {
      unlisten();
    };
  }, [history, updateIsProMode]);

  useEffect(() => {
    if (
      window.location.host !== 'quickswap.exchange' &&
      window.location.host !== 'beta.quickswap.exchange' &&
      window.location.host !== 'localhost:3000'
    ) {
      setOpenPassModal(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (arcxSDK && account && chainId) {
        await arcxSDK.connectWallet({ account, chain: chainId });
      }
    })();
  }, [account, chainId, arcxSDK]);

  const PasswordModal = () => {
    const [devPass, setDevPass] = useState('');
    const confirmPassword = () => {
      if (devPass === 'gammaPass' || devPass === 'devPass') {
        setOpenPassModal(false);
      }
    };
    return (
      <CustomModal open={openPassModal} onClose={confirmPassword}>
        <Box className='devPassModal'>
          <p>Please input password to access dev site.</p>
          <input
            type='password'
            value={devPass}
            onChange={(e) => {
              setDevPass(e.target.value);
            }}
          />
          <Box textAlign='right'>
            <Button onClick={confirmPassword}>Confirm</Button>
          </Box>
        </Box>
      </CustomModal>
    );
  };

  const showBetaBanner = false;

  return (
    <Box className='page'>
      {openPassModal && <PasswordModal />}
      {showBetaBanner && <BetaWarningBanner />}
      <Header />
      {!isProMode && <Background fallback={false} />}
      <Box className={getPageWrapperClassName()}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
