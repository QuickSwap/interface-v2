import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { Header, Footer, BetaWarningBanner } from 'components';
import Background from './Background';
import { useIsProMode } from 'state/application/hooks';

export interface PageLayoutProps {
  children: any;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const history = useHistory();
  const { isProMode, updateIsProMode } = useIsProMode();

  useEffect(() => {
    const unlisten = history.listen((location) => {
      updateIsProMode(false);
    });
    return function cleanup() {
      unlisten();
    };
  }, [history, updateIsProMode]);

  return (
    <Box className='page'>
      <BetaWarningBanner />
      <Header />
      {!isProMode && <Background fallback={false} />}
      <Box className={isProMode ? '' : 'pageWrapper'}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
