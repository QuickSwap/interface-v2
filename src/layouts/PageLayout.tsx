import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useActiveWeb3React, useIsProMode, useMasaAnalytics } from 'hooks';
import NewsletterSignupPanel from './NewsletterSignupPanel';
import Header from 'components/Header';
import Footer from 'components/Footer';
import BetaWarningBanner from 'components/BetaWarningBanner';
import CustomModal from 'components/CustomModal';
import Background from './Background';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
const IntractTracking = dynamic(() => import('./IntractTracking'), {
  ssr: false,
});

export interface PageLayoutProps {
  children: any;
  name?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, name }) => {
  const [headerClass, setHeaderClass] = useState('');
  const { account } = useActiveWeb3React();
  const isProMode = useIsProMode();
  const router = useRouter();
  const [openPassModal, setOpenPassModal] = useState(false);
  const pageWrapperClassName = useMemo(() => {
    if (isProMode) {
      return 'pageWrapper-proMode';
    } else if (router.asPath.includes('/swap')) {
      return 'pageWrapper-no-max';
    }
    return name == 'prdt' ? 'pageWrapper-no-max' : 'pageWrapper';
  }, [isProMode, name, router.asPath]);

  const { firePageViewEvent } = useMasaAnalytics();

  const { pathname } = router;
  useEffect(() => {
    const page = `https://quickswap.exchange/#${pathname}`;
    firePageViewEvent({ page, user_address: account });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (
      window.location.host !== 'quickswap.exchange' &&
      window.location.host !== 'beta.quickswap.exchange' &&
      window.location.host !== 'dogechain.quickswap.exchange' &&
      window.location.host !== 'localhost:3000' &&
      window.location.host !== 'interface-v2-seven.vercel.app'
    ) {
      setOpenPassModal(true);
    }
  }, []);

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
  const displayNewsletter = false;

  return (
    <Box className='page'>
      <IntractTracking />
      {openPassModal && <PasswordModal />}
      {showBetaBanner && <BetaWarningBanner />}
      {displayNewsletter && <NewsletterSignupPanel />}
      <Header
        onUpdateNewsletter={(val) => {
          setHeaderClass(val ? '' : 'pageWrapper-no-max-no-news');
        }}
      />
      {!isProMode && <Background fallback={false} />}
      <Box className={`${pageWrapperClassName} ${headerClass}`}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
