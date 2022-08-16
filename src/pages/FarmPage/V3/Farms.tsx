import { Box } from '@material-ui/core';
import { StyledDarkBox } from 'components/AddLiquidityV3/CommonStyledElements';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';
import useParsedQueryString from 'hooks/useParsedQueryString';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import EternalFarmsPage from 'pages/EternalFarmsPage';
import { FarmingMyFarms } from 'components/StakerMyStakes';

export default function Farms() {
  const { t } = useTranslation();

  const parsedQuery = useParsedQueryString();

  const history = useHistory();

  const currentTabQueried =
    parsedQuery && parsedQuery.tab ? (parsedQuery.tab as string) : 'my-farms';

  const v3FarmCategories = [
    {
      text: t('My Farms'),
      id: 0,
      link: 'my-farms',
    },
    {
      text: t('Enternal Farms'),
      id: 1,
      link: 'eternal-farms',
    },
  ];
  const handleTabSwitch = useCallback(
    (event, selectedIndex) => {
      const tab = v3FarmCategories?.[selectedIndex];
      history.push(`?tab=${tab?.link}`);
    },
    [currentTabQueried, history],
  );

  const selectedTab = useMemo(() => {
    const tab = v3FarmCategories.find(
      (item) => item?.link === currentTabQueried,
    );
    if (!tab) {
      return v3FarmCategories[0];
    } else {
      return tab;
    }
  }, [currentTabQueried]);

  const {
    fetchEternalFarms: {
      fetchEternalFarmsFn,
      eternalFarms,
      eternalFarmsLoading,
    },
  } = useFarmingSubgraph() || {};

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

  console.log(' farms data ', { eternalFarms, transferredPositions });

  return (
    <StyledDarkBox>
      <Box width='100%' mt={2}>
        <CustomTabSwitch
          width={300}
          height={58}
          items={v3FarmCategories}
          selectedItem={selectedTab}
          handleTabChange={handleTabSwitch}
        />

        {selectedTab?.id === 0 && (
          <Box mt={2}>
            <FarmingMyFarms
              data={transferredPositions}
              refreshing={transferredPositionsLoading}
              fetchHandler={() => {
                fetchTransferredPositionsFn(true);
              }}
              now={now}
            />
            <FarmingMyFarms
              data={transferredPositions}
              refreshing={transferredPositionsLoading}
              fetchHandler={() => {
                fetchTransferredPositionsFn(true);
              }}
              now={now}
            />
          </Box>
        )}
        {selectedTab?.id === 1 && (
          <EternalFarmsPage
            data={eternalFarms}
            refreshing={eternalFarmsLoading}
            fetchHandler={() => fetchEternalFarmsFn(true)}
          />
        )}
      </Box>
    </StyledDarkBox>
  );
}
