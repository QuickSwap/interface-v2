import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import Header from 'components/Header';
import Footer from 'components/Footer';
import BetaWarningBanner from 'components/BetaWarningBanner';
import CustomModal from 'components/CustomModal';
import Background from './Background';
import { useRouter } from 'next/router';

export interface PageLayoutProps {
  children: any;
  name?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, name }) => {
  const { chainId, account } = useActiveWeb3React();
  const isProMode = useIsProMode();
  const router = useRouter();
  const arcxSDK = (window as any).arcx;
  const [openPassModal, setOpenPassModal] = useState(false);
  const pageWrapperClassName = useMemo(() => {
    if (isProMode) {
      return '';
    } else if (router.asPath.includes('/swap')) {
      return 'pageWrapper-no-max';
    }
    return name == 'prdt' ? 'pageWrapper-no-max' : 'pageWrapper';
  }, [isProMode, name, router.asPath]);

  useEffect(() => {
    if (
      window.location.host !== 'quickswap.exchange' &&
      window.location.host !== 'beta.quickswap.exchange' &&
      window.location.host !== 'dogechain.quickswap.exchange' &&
      window.location.host !== 'localhost:3000' &&
      window.location.host !== 'testing-orbs.interface-v2-01.pages.dev'
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
      <Box className={pageWrapperClassName}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
