import React, { useCallback, useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import CustomSelector from 'components/v3/CustomSelector';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import EternalFarmsPage from 'components/pages/farms/EternalFarmsPage';
import GammaFarmsPage from 'components/pages/farms/GammaFarmsPage';
import { FarmingMyFarms } from 'components/StakerMyStakes';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { SelectorItem } from 'components/v3/CustomSelector/CustomSelector';
import { SearchInput, SortColumns, CustomSwitch } from 'components';
import { GammaPair, GammaPairs, GlobalConst } from 'constants/index';

export default function Farms() {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;

  const router = useRouter();
  const farmStatus = router.query.farmStatus
    ? (router.query.farmStatus as string)
    : 'active';
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const allGammaFarms = useMemo(() => {
    return chainId
      ? ([] as GammaPair[])
          .concat(...Object.values(GammaPairs[chainId]))
          .filter((item) => item.ableToFarm)
      : [];
  }, [chainId]);

  const redirectWithFarmStatus = (status: string) => {
    let redirectPath;
    if (router.query.farmStatus) {
      redirectPath = router.asPath.replace(
        `farmStatus=${router.query.farmStatus}`,
        `farmStatus=${status}`,
      );
    } else {
      redirectPath = '';
      // redirectPath = `${currentPath}${
      //   history.location.search === '' ? '?' : '&'
      // }farmStatus=${status}`;
    }
    router.push(redirectPath);
  };

  const currentTabQueried = router.query.tab
    ? (router.query.tab as string)
    : allGammaFarms.length > 0
    ? 'gamma-farms'
    : 'eternal-farms';

  const v3FarmCategories = useMemo(() => {
    return allGammaFarms.length > 0
      ? [
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
        ]
      : [
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
        ];
  }, [t, allGammaFarms]);
  const onChangeFarmCategory = useCallback(
    (selected: SelectorItem) => {
      router.push(`?tab=${selected?.link}`);
    },
    [router],
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
      width: 0.3,
      justify: 'flex-start',
    },
    {
      text: t('tvl'),
      index: GlobalConst.utils.v3FarmSortBy.tvl,
      width: 0.2,
      justify: 'flex-start',
    },
    {
      text: t('rewards'),
      index: GlobalConst.utils.v3FarmSortBy.rewards,
      width: 0.3,
      justify: 'flex-start',
    },
    {
      text: t('apr'),
      index: GlobalConst.utils.v3FarmSortBy.apr,
      width: 0.2,
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
      <Box pt={2} px={2} className='flex flex-wrap justify-between'>
        <CustomSelector
          height={36}
          items={v3FarmCategories}
          selectedItem={selectedFarmCategory}
          handleChange={onChangeFarmCategory}
        />
        <Box
          className='flex flex-wrap items-center'
          width={isMobile ? '100%' : 'auto'}
        >
          {selectedFarmCategory.id === 1 && (
            <Box mt={isMobile ? 2 : 0} width={isMobile ? '100%' : 160}>
              <CustomSwitch width='100%' height={40} items={farmStatusItems} />
            </Box>
          )}
          <Box
            mt={isMobile ? 2 : 0}
            ml={isMobile ? 0 : 2}
            width={isMobile ? '100%' : 200}
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
          <Box mt={2} pl='12px' className='bg-secondary1'>
            <CustomTabSwitch
              items={farmFilters}
              selectedItem={farmFilter}
              handleTabChange={setFarmFilter}
              height={50}
            />
          </Box>
          {!isMobile && (
            <Box mt={2} px={3.5}>
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
        <FarmingMyFarms search={searchValue} chainId={chainIdToUse} />
      )}
      {selectedFarmCategory?.id === 1 && (
        <EternalFarmsPage
          farmFilter={farmFilter.id}
          search={searchValue}
          sortBy={sortBy}
          sortDesc={sortDesc}
          chainId={chainIdToUse}
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
