import React, { useCallback, useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import EternalFarmsPage from 'pages/EternalFarmsPage';
import { FarmingMyFarms } from 'components/StakerMyStakes';
import { TabItem } from 'components/v3/CustomTabSwitch/CustomTabSwitch';
import { SearchInput } from 'components';

export default function Farms() {
  const { t } = useTranslation();

  const parsedQuery = useParsedQueryString();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

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
        text: t('quickswapFarms'),
        id: 1,
        link: 'eternal-farms',
      },
      {
        text: t('gammaFarms'),
        id: 2,
        link: 'gamma-farms',
        hasSeparator: true,
      },
    ],
    [t],
  );
  const handleTabSwitch = useCallback(
    (selectedTab: TabItem) => {
      history.push(`?tab=${selectedTab?.link}`);
    },
    [history],
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

  const [searchValue, setSearchValue] = useState('');

  return (
    <Box className='bg-palette' borderRadius={10}>
      <Box pt={2} px={2} className='flex flex-wrap justify-between'>
        <CustomTabSwitch
          height={36}
          items={v3FarmCategories}
          selectedItem={selectedTab}
          handleTabChange={handleTabSwitch}
        />
        <Box
          mt={isMobile ? 2 : 0}
          ml={isMobile ? 0 : 2}
          width={isMobile ? 1 : 200}
        >
          <SearchInput
            placeholder='Search'
            value={searchValue}
            setValue={setSearchValue}
            isIconAfter
          />
        </Box>
      </Box>

      <Box mt={2}>
        {selectedTab?.id === 0 && <FarmingMyFarms />}
        {selectedTab?.id === 1 && <EternalFarmsPage />}
      </Box>
    </Box>
  );
}
