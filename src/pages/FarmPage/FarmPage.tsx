import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { getBulkPairData } from 'state/stake/hooks';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import FarmRewards from './FarmRewards';
import FarmsList from './FarmsList';
import { CustomSwitch } from 'components';
import { useTranslation } from 'react-i18next';
import 'pages/styles/farm.scss';
import { useDefaultFarmList } from 'state/farms/hooks';
import { useDefaultDualFarmList } from 'state/dualfarms/hooks';
import { ChainId } from '@uniswap/sdk';
import EternalFarmsPage from 'pages/EternalFarmsPage';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';
import { FarmingMyFarms } from 'components/StakerMyStakes';
import VersionToggle from 'components/Toggle/VersionToggle';
import useParsedQueryString from 'hooks/useParsedQueryString';

const FarmPage: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const [bulkPairs, setBulkPairs] = useState<any>(null);
  const [farmIndex, setFarmIndex] = useState(
    GlobalConst.farmIndex.LPFARM_INDEX,
  );
  const [v3FarmIndex, setV3FarmIndex] = useState(
    GlobalConst.v3FarmIndex.ETERNAL_FARMS_INDEX,
  );
  const chainIdOrDefault = chainId ?? ChainId.MATIC;
  const lpFarms = useDefaultFarmList();
  const dualFarms = useDefaultDualFarmList();
  const { account } = useActiveWeb3React();

  const {
    fetchEternalFarms: {
      fetchEternalFarmsFn,
      eternalFarms,
      eternalFarmsLoading,
    },
  } = useFarmingSubgraph() || {};

  const pairLists = useMemo(() => {
    const stakingPairLists = Object.values(lpFarms[chainIdOrDefault]).map(
      (item) => item.pair,
    );
    const dualPairLists = Object.values(dualFarms[chainIdOrDefault]).map(
      (item) => item.pair,
    );
    return stakingPairLists.concat(dualPairLists);
  }, [chainIdOrDefault, lpFarms, dualFarms]);

  useEffect(() => {
    getBulkPairData(pairLists).then((data) => setBulkPairs(data));
  }, [pairLists]);

  const farmCategories = [
    {
      text: t('lpMining'),
      onClick: () => {
        setFarmIndex(GlobalConst.farmIndex.LPFARM_INDEX);
      },
      condition: farmIndex === GlobalConst.farmIndex.LPFARM_INDEX,
    },
    {
      text: t('dualMining'),
      onClick: () => {
        setFarmIndex(GlobalConst.farmIndex.DUALFARM_INDEX);
      },
      condition: farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX,
    },
  ];

  const v3FarmCategories = [
    {
      text: t('myFarms'),
      onClick: () => {
        setV3FarmIndex(GlobalConst.v3FarmIndex.MY_FARMS_INDEX);
      },
      condition: v3FarmIndex === GlobalConst.v3FarmIndex.MY_FARMS_INDEX,
    },
    {
      text: t('enternalFarms'),
      onClick: () => {
        setV3FarmIndex(GlobalConst.v3FarmIndex.ETERNAL_FARMS_INDEX);
      },
      condition: v3FarmIndex === GlobalConst.v3FarmIndex.ETERNAL_FARMS_INDEX,
    },
  ];

  const {
    fetchRewards: { rewardsResult, fetchRewardsFn, rewardsLoading },
    fetchAllEvents: { fetchAllEventsFn, allEvents, allEventsLoading },
    fetchTransferredPositions: {
      fetchTransferredPositionsFn,
      transferredPositions,
      transferredPositionsLoading,
    },
    fetchHasTransferredPositions: {
      fetchHasTransferredPositionsFn,
      hasTransferredPositions,
      hasTransferredPositionsLoading,
    },
  } = useFarmingSubgraph() || {};
  const [now, setNow] = useState(Date.now());

  const parsedQuery = useParsedQueryString();
  const poolVersion =
    parsedQuery && parsedQuery.version ? (parsedQuery.version as string) : 'v3';

  return (
    <Box width='100%' mb={3} id='farmPage'>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('farm')}</h4>
          <VersionToggle baseUrl={'farm'} />
        </Box>
        <Box className='helpWrapper'>
          <small>{t('help')}</small>
          <HelpIcon />
        </Box>
      </Box>
      {poolVersion !== 'v3' && (
        <>
          <CustomSwitch
            width={300}
            height={48}
            items={farmCategories}
            isLarge={true}
          />
          <Box my={2}>
            <FarmRewards bulkPairs={bulkPairs} farmIndex={farmIndex} />
          </Box>
          <Box className='farmsWrapper'>
            <FarmsList bulkPairs={bulkPairs} farmIndex={farmIndex} />
          </Box>
        </>
      )}
      {poolVersion === 'v3' && (
        <>
          <CustomSwitch
            width={300}
            height={48}
            items={v3FarmCategories}
            isLarge={true}
          />
          <Box className='helpWrapper'>
            <Button
              onClick={() =>
                account ? fetchTransferredPositionsFn(true) : undefined
              }
            >
              Refresh
            </Button>
            <HelpIcon />
          </Box>
          <Box my={2}>
            {v3FarmIndex === GlobalConst.v3FarmIndex.MY_FARMS_INDEX && (
              <FarmingMyFarms
                data={transferredPositions}
                refreshing={transferredPositionsLoading}
                fetchHandler={() => {
                  fetchTransferredPositionsFn(true);
                }}
                now={now}
              />
            )}
            {v3FarmIndex === GlobalConst.v3FarmIndex.ETERNAL_FARMS_INDEX && (
              <EternalFarmsPage
                data={eternalFarms}
                refreshing={eternalFarmsLoading}
                fetchHandler={() => fetchEternalFarmsFn(true)}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default FarmPage;
