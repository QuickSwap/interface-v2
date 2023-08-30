import React, { lazy, useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import { useHistory } from 'react-router-dom';
import IntractAttribution, { trackCustomWallet } from '@intract/attribution';
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
  const { chainId, account } = useActiveWeb3React();
  const isProMode = useIsProMode();
  const arcxSDK = (window as any).arcx;
  const [openPassModal, setOpenPassModal] = useState(false);
  const { location } = useHistory();
  const pageWrapperClassName = useMemo(() => {
    if (isProMode) {
      return '';
    } else if (location.pathname.includes('/swap')) {
      return 'pageWrapper-no-max';
    }
    return name == 'prdt' ? 'pageWrapper-no-max' : 'pageWrapper';
  }, [isProMode, location, name]);

  const intractKey = process.env.REACT_APP_INTRACT_KEY;
  useEffect(() => {
    if (intractKey) {
      IntractAttribution(intractKey, {
        configAllowCookie: true,
      });
    }
  }, [intractKey]);

  useEffect(() => {
    if (account) {
      trackCustomWallet(account);
    }
  }, [account]);

  useEffect(() => {
    if (
      window.location.host !== 'quickswap.exchange' &&
      window.location.host !== 'beta.quickswap.exchange' &&
      window.location.host !== 'dogechain.quickswap.exchange' &&
      window.location.host !== 'localhost:3000' &&
      window.location.host !== 'testing-wcv2.interface-v2-01.pages.dev'
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
      if (devPass === 'gammaPass' || devPass === 'testPass') {
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
      <Box className={pageWrapperClassName}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
