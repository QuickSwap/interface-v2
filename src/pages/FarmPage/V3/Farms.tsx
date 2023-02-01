import React, { useCallback, useMemo, useState } from 'react';
import { Box } from 'theme/components';
import CustomSelector from 'components/v3/CustomSelector';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import EternalFarmsPage from 'pages/EternalFarmsPage';
import GammaFarmsPage from 'pages/GammaFarmsPage';
import { FarmingMyFarms } from 'components/StakerMyStakes';
import { SearchInput, SortColumns, CustomSwitch } from 'components';
import { GlobalConst } from 'constants/index';
import { useIsXS } from 'hooks/useMediaQuery';

export default function Farms() {
  const { t } = useTranslation();

  const parsedQuery = useParsedQueryString();
  const farmStatus =
    parsedQuery && parsedQuery.farmStatus
      ? (parsedQuery.farmStatus as string)
      : 'active';
  const isMobile = useIsXS();

  const history = useHistory();

  const redirectWithFarmStatus = (status: string) => {
    const currentPath = history.location.pathname + history.location.search;
    let redirectPath;
    if (parsedQuery && parsedQuery.farmStatus) {
      redirectPath = currentPath.replace(
        `farmStatus=${parsedQuery.farmStatus}`,
        `farmStatus=${status}`,
      );
    } else {
      redirectPath = `${currentPath}${
        history.location.search === '' ? '?' : '&'
      }farmStatus=${status}`;
    }
    history.push(redirectPath);
  };

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
  const onChangeFarmCategory = useCallback(
    (selected) => {
      history.push(`?tab=${selected?.link}`);
    },
    [history],
  );

  const selectedFarmCategory = useMemo(() => {
    const tab = v3FarmCategories.find(
      (item) => item?.link === currentTabQueried,
    );
    if (!tab) {
      return v3FarmCategories[0];
    } else {
      return tab;
    }
  }, [currentTabQueried, v3FarmCategories]);

  const farmFilters = useMemo(
    () => [
      {
        text: t('allFarms'),
        id: GlobalConst.utils.v3FarmFilter.allFarms,
      },
      {
        text: t('stablecoins'),
        id: GlobalConst.utils.v3FarmFilter.stableCoin,
      },
      {
        text: t('blueChips'),
        id: GlobalConst.utils.v3FarmFilter.blueChip,
      },
      {
        text: t('stableLPs'),
        id: GlobalConst.utils.v3FarmFilter.stableLP,
      },
      {
        text: t('otherLPs'),
        id: GlobalConst.utils.v3FarmFilter.otherLP,
      },
    ],
    [t],
  );
  const [farmFilter, setFarmFilter] = useState(farmFilters[0]);

  const [searchValue, setSearchValue] = useState('');

  const [sortBy, setSortBy] = useState(GlobalConst.utils.v3FarmSortBy.pool);
  const [sortDesc, setSortDesc] = useState(false);

  const farmStatusItems = [
    {
      text: t('active'),
      onClick: () => {
        redirectWithFarmStatus('active');
      },
      condition: farmStatus === 'active',
    },
    {
      text: t('ended'),
      onClick: () => {
        redirectWithFarmStatus('ended');
      },
      condition: farmStatus === 'ended',
    },
  ];

  const sortColumns = [
    {
      text: t('pool'),
      index: GlobalConst.utils.v3FarmSortBy.pool,
      width: '30%',
      justify: 'flex-start',
    },
    {
      text: t('tvl'),
      index: GlobalConst.utils.v3FarmSortBy.tvl,
      width: '15%',
      justify: 'flex-start',
    },
    {
      text: t('rewards'),
      index: GlobalConst.utils.v3FarmSortBy.rewards,
      width: '25%',
      justify: 'flex-start',
    },
    {
      text: t('poolAPR'),
      index: GlobalConst.utils.v3FarmSortBy.poolAPR,
      width: '15%',
      justify: 'flex-start',
    },
    {
      text: t('farmAPR'),
      index: GlobalConst.utils.v3FarmSortBy.farmAPR,
      width: '15%',
      justify: 'flex-start',
    },
  ];

  const sortByDesktopItems = sortColumns.map((item) => {
    return {
      ...item,
      onClick: () => {
        if (sortBy === item.index) {
          setSortDesc(!sortDesc);
        } else {
          setSortBy(item.index);
          setSortDesc(false);
        }
      },
    };
  });

  return (
    <Box className='bg-palette' borderRadius='10px'>
      <Box padding='16px 16px 0' className='flex flex-wrap justify-between'>
        <CustomSelector
          height='36px'
          items={v3FarmCategories}
          selectedItem={selectedFarmCategory}
          handleChange={onChangeFarmCategory}
        />
        <Box
          className='flex items-center flex-wrap'
          width={isMobile ? '100%' : 'auto'}
        >
          {selectedFarmCategory.id === 1 && (
            <Box
              margin={isMobile ? '16px 0 0' : '0'}
              width={isMobile ? '100%' : '160px'}
            >
              <CustomSwitch width='100%' height={40} items={farmStatusItems} />
            </Box>
          )}
          <Box
            margin={isMobile ? '16px 0 0' : '0 0 0 16px'}
            width={isMobile ? '100%' : '200px'}
          >
            <SearchInput
              placeholder='Search'
              value={searchValue}
              setValue={setSearchValue}
              isIconAfter
            />
          </Box>
        </Box>
      </Box>

      {selectedFarmCategory.id !== 0 && (
        <>
          <Box margin='16px 0 0' padding='0 0 0 12px' className='bg-secondary1'>
            <CustomTabSwitch
              items={farmFilters}
              selectedItem={farmFilter}
              handleTabChange={setFarmFilter}
              height='50px'
            />
          </Box>
          {!isMobile && (
            <Box margin='16px 0 0' padding='0 28px'>
              <Box width='90%'>
                <SortColumns
                  sortColumns={sortByDesktopItems}
                  selectedSort={sortBy}
                  sortDesc={sortDesc}
                />
              </Box>
            </Box>
          )}
        </>
      )}

      {selectedFarmCategory?.id === 0 && (
        <FarmingMyFarms search={searchValue} />
      )}
      {selectedFarmCategory?.id === 1 && (
        <EternalFarmsPage
          farmFilter={farmFilter.id}
          search={searchValue}
          sortBy={sortBy}
          sortDesc={sortDesc}
        />
      )}
      {selectedFarmCategory?.id === 2 && (
        <GammaFarmsPage
          farmFilter={farmFilter.id}
          search={searchValue}
          sortBy={sortBy}
          sortDesc={sortDesc}
        />
      )}
    </Box>
  );
}
