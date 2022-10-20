import React, { useCallback, useMemo } from 'react';
import { Box } from '@material-ui/core';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import EternalFarmsPage from 'pages/EternalFarmsPage';
import { FarmingMyFarms } from 'components/StakerMyStakes';

export default function Farms() {
  const { t } = useTranslation();

  const parsedQuery = useParsedQueryString();

  const history = useHistory();

  const currentTabQueried =
    parsedQuery && parsedQuery.tab
      ? (parsedQuery.tab as string)
      : 'eternal-farms';

  const v3FarmCategories = useMemo(
    () => [
      {
        text: t('myFarms'),
        id: 0,
        link: 'my-farms',
      },
      {
        text: t('farms'),
        id: 1,
        link: 'eternal-farms',
      },
    ],
    [t],
  );
  const handleTabSwitch = useCallback(
    (event, selectedIndex) => {
      const tab = v3FarmCategories?.[selectedIndex];
      history.push(`?tab=${tab?.link}`);
    },
    [history, v3FarmCategories],
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
  }, [currentTabQueried, v3FarmCategories]);

  return (
    <Box className='bg-palette' borderRadius={10}>
      <Box width='100%' mt={2}>
        <Box className='v3-farm-tabs-wrapper'>
          <CustomTabSwitch
            width={300}
            height={67}
            items={v3FarmCategories}
            selectedItem={selectedTab}
            handleTabChange={handleTabSwitch}
          />
        </Box>

        <Box mt={2}>
          {selectedTab?.id === 0 && <FarmingMyFarms />}
          {selectedTab?.id === 1 && <EternalFarmsPage />}
        </Box>
      </Box>
    </Box>
  );
}
