import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import { HypeLabAds } from 'components';
import { useTranslation } from 'react-i18next';
import 'pages/styles/farm.scss';
import V3Farms from 'pages/FarmPage/V3';
import { getConfig } from '../../config/index';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useHistory } from 'react-router-dom';

const FarmPage: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const history = useHistory();
  const parsedQuery = useParsedQueryString();
  const currentTab =
    parsedQuery && parsedQuery.tab
      ? (parsedQuery.tab as string)
      : GlobalConst.v2FarmTab.OTHER_LP;
  const { t } = useTranslation();
  const config = getConfig(chainId);
  const farmAvailable = config['farm']['available'];

  if (!farmAvailable) {
    location.href = '/';
  }

  useEffect(() => {
    if (!farmAvailable) {
      history.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmAvailable]);

  return (
    <Box width='100%' mb={3} id='farmPage'>
      <Box margin='0 auto 24px'>
        <HypeLabAds />
      </Box>
      <V3Farms />
    </Box>
  );
};

export default FarmPage;
