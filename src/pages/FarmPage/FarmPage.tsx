import React, { useEffect, useMemo, useState } from 'react';
import { Box } from 'theme/components';
import { getBulkPairData } from 'state/stake/hooks';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import FarmRewards from './FarmRewards';
import FarmsList from './FarmsList';
import { AdsSlider, CustomSwitch } from 'components';
import { useTranslation } from 'react-i18next';
import 'pages/styles/farm.scss';
import { useDefaultFarmList } from 'state/farms/hooks';
import { useDefaultCNTFarmList } from 'state/cnt/hooks';
import { useDefaultDualFarmList } from 'state/dualfarms/hooks';
import { ChainId } from '@uniswap/sdk';
import VersionToggle from 'components/Toggle/VersionToggle';
import V3Farms from 'pages/FarmPage/V3';
import { useIsV2 } from 'state/application/hooks';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useHistory } from 'react-router-dom';
import { useIsXS } from 'hooks/useMediaQuery';

const FarmPage: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const history = useHistory();
  const parsedQuery = useParsedQueryString();
  const currentTab =
    parsedQuery && parsedQuery.tab
      ? (parsedQuery.tab as string)
      : GlobalConst.v2FarmTab.LPFARM;
  const { t } = useTranslation();
  const [bulkPairs, setBulkPairs] = useState<any>(null);
  const isMobile = useIsXS();

  const chainIdOrDefault = chainId ?? ChainId.MATIC;
  const lpFarms = useDefaultFarmList();
  const cntFarms = useDefaultCNTFarmList(chainIdOrDefault);
  const dualFarms = useDefaultDualFarmList();
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

  const { isV2 } = useIsV2();

  return (
    <Box width='100%' margin='0 0 24px' id='farmPage'>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('farm')}</h4>
          <Box margin='0 0 0 16px'>
            <VersionToggle />
          </Box>
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
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='0 auto 24px'>
        <AdsSlider sort='farms' />
      </Box>
      {isV2 && (
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
          <Box margin='24px 0'>
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
