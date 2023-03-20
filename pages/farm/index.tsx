import React, { useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { getBulkPairData } from 'state/stake/hooks';
import { HelpOutline } from '@mui/icons-material';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import FarmRewards from 'components/pages/farms/FarmRewards';
import FarmsList from 'components/pages/farms/FarmsList';
import { AdsSlider, CustomSwitch } from 'components';
import { useTranslation } from 'next-i18next';
import { useDefaultFarmList } from 'state/farms/hooks';
import { useDefaultCNTFarmList } from 'state/cnt/hooks';
import { useDefaultDualFarmList } from 'state/dualfarms/hooks';
import { ChainId } from '@uniswap/sdk';
import VersionToggle from 'components/Toggle/VersionToggle';
import V3Farms from 'components/pages/farms/V3/Farms';
import { useIsV2 } from 'state/application/hooks';
import { useRouter } from 'next/router';

const FarmPage: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const router = useRouter();
  const currentTab = router.query.tab
    ? (router.query.tab as string)
    : GlobalConst.v2FarmTab.LPFARM;
  const { t } = useTranslation();
  const [bulkPairs, setBulkPairs] = useState<any>(null);

  const chainIdOrDefault = chainId ?? ChainId.MATIC;
  const lpFarms = useDefaultFarmList();
  const cntFarms = useDefaultCNTFarmList(chainIdOrDefault);
  const dualFarms = useDefaultDualFarmList();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const OTHER_FARM_LINK = process.env.REACT_APP_OTHER_LP_CREATE_A_FARM_LINK;

  const pairLists = useMemo(() => {
    const stakingPairLists = Object.values(lpFarms[chainIdOrDefault]).map(
      (item) => item.pair,
    );
    const dualPairLists = Object.values(dualFarms[chainIdOrDefault]).map(
      (item) => item.pair,
    );
    const cntPairLists = Object.values(cntFarms[chainIdOrDefault]).map(
      (item) => item.pair,
    );

    return stakingPairLists.concat(dualPairLists).concat(cntPairLists);
  }, [chainIdOrDefault, lpFarms, dualFarms, cntFarms]);

  useEffect(() => {
    getBulkPairData(pairLists).then((data) => setBulkPairs(data));
  }, [pairLists]);

  const redirectWithFarmTab = (tab: string) => {
    const currentPath = router.asPath;
    let redirectPath;
    if (router.query.tab) {
      redirectPath = currentPath.replace(
        `tab=${router.query.tab}`,
        `tab=${tab}`,
      );
    } else {
      redirectPath = '';
      // redirectPath = `${currentPath}${
      //   router.location.search === '' ? '?' : '&'
      // }tab=${tab}`;
    }
    router.push(redirectPath);
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

  const { isV2 } = useIsV2();

  return (
    <Box width='100%' mb={3} id='farmPage'>
      <Box className='pageHeading'>
        <Box className='flex items-center row'>
          <h4>{t('farm')}</h4>
          <Box ml={2}>
            <VersionToggle />
          </Box>
        </Box>
        {helpURL && (
          <Box
            className='helpWrapper'
            onClick={() => window.open(helpURL, '_blank')}
          >
            <small>{t('help')}</small>
            <HelpOutline />
          </Box>
        )}
      </Box>
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='0 auto 24px'>
        <AdsSlider sort='farms' />
      </Box>
      {isV2 && (
        <>
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
      {!isV2 && <V3Farms />}
    </Box>
  );
};

export default FarmPage;
