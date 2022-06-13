import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { Header, Footer, BetaWarningBanner } from 'components';
import Background from './Background';
import { useIsProMode } from 'state/application/hooks';

export interface PageLayoutProps {
  children: any;
  name?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, name }) => {
  const history = useHistory();
  const { isProMode, updateIsProMode } = useIsProMode();
  const getPageWrapperClassName = () => {
    if (isProMode) {
      return '';
    }
    return name == 'prdt' ? 'pageWrapper-no-max' : 'pageWrapper';
  };
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
      <Box className={getPageWrapperClassName()}>{children}</Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
