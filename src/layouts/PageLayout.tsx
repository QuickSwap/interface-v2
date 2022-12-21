import React, { useEffect, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { Header, Footer, BetaWarningBanner, CustomModal } from 'components';
import Background from './Background';
import { useActiveWeb3React } from 'hooks';
import { useArcxAnalytics } from '@arcxmoney/analytics';
import useParsedQueryString from 'hooks/useParsedQueryString';

export interface PageLayoutProps {
  children: any;
  name?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, name }) => {
  const { chainId, account } = useActiveWeb3React();
  const parsedQs = useParsedQueryString();
  const isProMode = Boolean(
    parsedQs.isProMode && parsedQs.isProMode === 'true',
  );
  const arcxSDK = useArcxAnalytics();
  const [openPassModal, setOpenPassModal] = useState(false);
  const getPageWrapperClassName = () => {
    if (isProMode) {
      return 'pageProModeWrapper';
    }
    return name == 'prdt' ? 'pageWrapper-no-max' : 'pageWrapper';
  };

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
      if (devPass === 'devPass') {
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
