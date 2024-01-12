import React, { useEffect, useMemo } from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import { getBulkPairData } from 'state/stake/hooks';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import FarmRewards from './FarmRewards';
import FarmsList from './FarmsList';
import { CustomSwitch, HypeLabAds } from 'components';
import { useTranslation } from 'react-i18next';
import 'pages/styles/farm.scss';
import { useDefaultFarmList } from 'state/farms/hooks';
import { useDefaultCNTFarmList } from 'state/cnt/hooks';
import { useDefaultDualFarmList } from 'state/dualfarms/hooks';
import VersionToggle from 'components/Toggle/VersionToggle';
import V3Farms from 'pages/FarmPage/V3';
import { useIsV2 } from 'state/application/hooks';
import { getConfig } from '../../config/index';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useHistory } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

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
  const v3 = config['v3'];
  const v2 = config['v2'];
  const { isV2, updateIsV2 } = useIsV2();

  const lpFarms = useDefaultFarmList();
  const cntFarms = useDefaultCNTFarmList(chainId);
  const dualFarms = useDefaultDualFarmList();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const OTHER_FARM_LINK = process.env.REACT_APP_OTHER_LP_CREATE_A_FARM_LINK;

  const pairLists = useMemo(() => {
    const stakingPairLists = Object.values(lpFarms[chainId]).map(
      (item) => item.pair,
    );
    const dualPairLists = Object.values(dualFarms[chainId]).map(
      (item) => item.pair,
    );
    const cntPairLists = Object.values(cntFarms[chainId]).map(
      (item) => item.pair,
    );

    return stakingPairLists.concat(dualPairLists).concat(cntPairLists);
  }, [chainId, lpFarms, dualFarms, cntFarms]);

  useEffect(() => {
    if (!farmAvailable) {
      history.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmAvailable]);

  useEffect(() => {
    if (!v2) {
      updateIsV2(false);
    }
  }, [updateIsV2, v2]);

  const pairListStr = pairLists.join('_');

  const fetchBulkPairData = async () => {
    if (!isV2) return null;
    const data = await getBulkPairData(chainId, pairListStr);
    return data ?? null;
  };

  const { data: bulkPairs } = useQuery({
    queryKey: ['fetchBulkPairData', isV2, chainId, pairListStr],
    queryFn: fetchBulkPairData,
    refetchInterval: 300000,
  });

  const redirectWithFarmTab = (tab: string) => {
    const currentPath = history.location.pathname + history.location.search;
    let redirectPath;
    if (parsedQuery && parsedQuery.tab) {
      redirectPath = currentPath.replace(
        `tab=${parsedQuery.tab}`,
        `tab=${tab}`,
      );
    } else {
      redirectPath = `${currentPath}${
        history.location.search === '' ? '?' : '&'
      }tab=${tab}`;
    }
    history.push(redirectPath);
  };

  const farmCategories = [
    {
      text: t('lpMining'),
      onClick: () => {
        redirectWithFarmTab(GlobalConst.v2FarmTab.LPFARM);
      },
      condition: currentTab === GlobalConst.v2FarmTab.LPFARM,
    },
    {
      text: t('dualMining'),
      onClick: () => {
        redirectWithFarmTab(GlobalConst.v2FarmTab.DUALFARM);
      },
      condition: currentTab === GlobalConst.v2FarmTab.DUALFARM,
    },
    {
      text: t('otherLPMining'),
      onClick: () => {
        redirectWithFarmTab(GlobalConst.v2FarmTab.OTHER_LP);
      },
      condition: currentTab === GlobalConst.v2FarmTab.OTHER_LP,
    },
  ];
  const helpURL = process.env.REACT_APP_HELP_URL;

  const poolId =
    parsedQuery && parsedQuery.pool ? parsedQuery.pool.toString() : undefined;

  return (
    <Box width='100%' mb={3} id='farmPage'>
      {!poolId && (
        <Box className='pageHeading'>
          <Box className='flex row items-center'>
            <h1 className='h4'>{t('farm')}</h1>
            {v2 && v3 && (
              <Box ml={2}>
                <VersionToggle />
              </Box>
            )}
          </Box>
          {helpURL && (
            <Box
              className='helpWrapper'
              onClick={() => window.open(helpURL, '_blank')}
            >
              <small>{t('help')}</small>
              <HelpIcon />
            </Box>
          )}
        </Box>
      )}
      <Box margin='0 auto 24px'>
        <HypeLabAds />
      </Box>
      {isV2 && v2 && (
        <>
          {/* Custom switch layer */}
          <Box className='flex flex-wrap justify-between'>
            <CustomSwitch
              width={450}
              height={48}
              items={farmCategories}
              isLarge={!isMobile}
            />
            {currentTab === GlobalConst.v2FarmTab.OTHER_LP && (
              <Box
                className={`flex ${isMobile ? 'mx-auto mt-1 fullWidth' : ''}`}
              >
                <a
                  className={`button ${
                    isMobile ? 'rounded-md fullWidth' : 'rounded'
                  }`}
                  target='_blank'
                  rel='noreferrer'
                  href={OTHER_FARM_LINK}
                >
                  <p className='text-center fullWidth'>{t('createAFarm')}</p>
                </a>
              </Box>
            )}
          </Box>

          {/* Rewards */}
          <Box my={3}>
            {currentTab !== GlobalConst.v2FarmTab.OTHER_LP && (
              <FarmRewards bulkPairs={bulkPairs} />
            )}
          </Box>

          {/* Farms List */}
          <Box className='farmsWrapper'>
            <FarmsList bulkPairs={bulkPairs} />
          </Box>
        </>
      )}
      {!isV2 && v3 && <V3Farms />}
    </Box>
  );
};

export default FarmPage;
