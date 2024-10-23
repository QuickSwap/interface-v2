import React, { lazy, useEffect, useMemo, useState } from 'react';
import { Box, Button, useMediaQuery, useTheme } from '@material-ui/core';
import { useActiveWeb3React, useIsProMode, useMasaAnalytics } from 'hooks';
import { useHistory } from 'react-router-dom';
import IntractAttribution, { trackCustomWallet } from '@intract/attribution';
import { config, passport } from '@imtbl/sdk';
import NewsletterSignupPanel from './NewsletterSignupPanel';
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
  const [headerClass, setHeaderClass] = useState('');
  const { chainId, account } = useActiveWeb3React();
  const arcxSdk = useArcxAnalytics();
  const isProMode = useIsProMode();
  const [openPassModal, setOpenPassModal] = useState(false);
  const { location } = useHistory();
  const pageWrapperClassName = useMemo(() => {
    if (isProMode) {
      return 'pageWrapper-proMode';
    } else if (location.pathname.includes('/swap')) {
      return 'pageWrapper-no-max';
    }
    return name == 'prdt' ? 'pageWrapper-no-max' : 'pageWrapper';
  }, [isProMode, location, name]);

  const { firePageViewEvent } = useMasaAnalytics();

  const { pathname } = location;
  useEffect(() => {
    const page = `https://quickswap.exchange/#${pathname}`;
    firePageViewEvent({ page, user_address: account });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
    if (arcxSdk && account) {
      arcxSdk.wallet({ chainId, account });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, account]);

  useEffect(() => {
    if (
      window.location.host !== 'quickswap.exchange' &&
      window.location.host !== 'beta.quickswap.exchange' &&
      window.location.host !== 'dogechain.quickswap.exchange' &&
      window.location.host !== 'localhost:3000' &&
      window.location.host !==
        'feature-immutable-mainnet-1.interface-v2-01.pages.dev'
    ) {
      setOpenPassModal(true);
    }
  }, []);

  useEffect(() => {
    if (process.env.REACT_APP_PASSPORT_CLIENT_ID) {
      const connector = new passport.Passport({
        baseConfig: {
          environment: config.Environment.PRODUCTION,
          publishableKey: process.env.REACT_APP_PASSPORT_PUBLISHABLE_KEY,
        },
        clientId: process.env.REACT_APP_PASSPORT_CLIENT_ID,
        redirectUri: 'https://quickswap.exchange',
        logoutRedirectUri: 'https://quickswap.exchange',
        audience: 'platform_api',
        scope: 'openid offline_access email transact',
      });
      connector.loginCallback();
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const showBetaBanner = false;
  const displayNewsletter = false;

  return (
    <Box className='page'>
      {/* {openPassModal && <PasswordModal />} */}
      {showBetaBanner && <BetaWarningBanner />}
      {displayNewsletter && <NewsletterSignupPanel />}
      <Header
        onUpdateNewsletter={(val) => {
          setHeaderClass(val ? '' : 'pageWrapper-no-max-no-news');
        }}
      />
      {!isProMode && <Background fallback={false} />}
      <Box
        className={`${pageWrapperClassName} ${headerClass}`}
        sx={{ marginTop: isMobile ? '-124px' : '0px' }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
