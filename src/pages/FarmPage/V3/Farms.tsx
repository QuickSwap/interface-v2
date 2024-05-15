import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
} from '@material-ui/core';
import CustomSelector from 'components/v3/CustomSelector';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { FarmingMyFarms } from 'components/StakerMyStakes';
import { useActiveWeb3React } from 'hooks';
import { ChainId, Token } from '@uniswap/sdk';
import { SelectorItem } from 'components/v3/CustomSelector/CustomSelector';
import { SearchInput, CustomSwitch, ToggleSwitch } from 'components';
import AllMerklFarms from './AllMerklFarms';
import MyRewardFarms from './MyRewardFarms';
import { getConfig } from 'config/index';
import AllV3Farms from './AllV3Farms';
import { MerklClaimAll } from './MerklClaimAll';
import { FeeAmount } from 'v3lib/utils';
import 'components/styles/FarmMain.scss';
import { GlobalConst } from 'constants/index';

export interface V3Farm {
  token0?: Token;
  token1?: Token;
  title?: string;
  tvl: number;
  rewards: {
    amount: number;
    token: { address: string; symbol: string; decimals: number };
  }[];
  rewardUSD: number;
  poolAPR: number;
  farmAPR: number;
  type: string;
  loading?: boolean;
  fee?: FeeAmount;
}

export default function Farms() {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainId);
  const merklAvailable = config['farm']['merkl'];

  const parsedQuery = useParsedQueryString();
  const farmStatus =
    parsedQuery && parsedQuery.farmStatus
      ? (parsedQuery.farmStatus as string)
      : 'active';
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const history = useHistory();

  const [searchValue, setSearchValue] = useState('');
  const [selectedSort, setSelectedSort] = useState(
    GlobalConst.utils.v3FarmSortBy.pool,
  );
  const [isOld, setIsOld] = useState(true);

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
    parsedQuery && parsedQuery.tab ? (parsedQuery.tab as string) : 'farms';

  const v3FarmCategories = useMemo(() => {
    return isOld
      ? [
          {
            text: t('allFarms'),
            id: 1,
            link: 'farms',
          },
          {
            text: t('myrewards'),
            id: 0,
            link: 'my-rewards',
          },
          {
            text: t('myFarms'),
            id: 2,
            link: 'my-farms',
          },
        ]
      : [
          {
            text: t('allFarms'),
            id: 1,
            link: 'farms',
          },
          {
            text: t('myrewards'),
            id: 0,
            link: 'my-rewards',
          },
        ];
  }, [t, isOld]);

  const onChangeFarmCategory = useCallback(
    (selected: SelectorItem) => {
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

  const sortItems = [
    {
      label: t('pool'),
      value: GlobalConst.utils.v3FarmSortBy.pool,
    },
    {
      label: t('tvl'),
      value: GlobalConst.utils.v3FarmSortBy.tvl,
    },
    {
      label: t('apr'),
      value: GlobalConst.utils.v3FarmSortBy.apr,
    },
    {
      label: t('rewards'),
      value: GlobalConst.utils.v3FarmSortBy.rewards,
    },
  ];

  const poolId =
    parsedQuery && parsedQuery.pool ? parsedQuery.pool.toString() : undefined;

  const token0 =
    parsedQuery && parsedQuery.token0
      ? parsedQuery.token0.toString()
      : undefined;

  const token1 =
    parsedQuery && parsedQuery.token1
      ? parsedQuery.token1.toString()
      : undefined;

  const isAllFarms = merklAvailable ? !!poolId : !!token0 && !!token1;

  useEffect(() => {
    history.push('/farm');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return (
    <>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h1 className='h4'>{t('farms')}</h1>
        </Box>
      </Box>
      {merklAvailable && <MerklClaimAll />}
      <Box className='bg-palette' borderRadius={10}>
        {!isAllFarms && (
          <Box
            pt={2}
            px={2}
            className='flex flex-wrap justify-between'
            gridGap={16}
          >
            <CustomSelector
              height={36}
              items={v3FarmCategories}
              selectedItem={selectedFarmCategory}
              handleChange={onChangeFarmCategory}
            />
            {isMobile && !poolId && (
              <Box className='flex items-center' gridGap={6}>
                <small className='text-secondary'>{t('oldFarms')}</small>
                <ToggleSwitch
                  toggled={isOld}
                  onToggle={() => setIsOld(!isOld)}
                />
              </Box>
            )}
            <Box
              className={
                isMobile
                  ? 'flex items-center flex-wrap justify-between'
                  : 'flex items-center flex-wrap'
              }
              width={isMobile ? '100%' : 'auto'}
              gridGap='16px'
            >
              <Box width={isMobile ? 150 : 200}>
                <SearchInput
                  placeholder='Search'
                  value={searchValue}
                  setValue={setSearchValue}
                  isIconAfter={false}
                />
              </Box>
              {!(isMobile && poolId) && (
                <Box className='sortSelectBox'>
                  <label>Sort by: </label>
                  <Select value={selectedSort} className='sortSelect'>
                    {sortItems.map((item) => (
                      <MenuItem
                        key={item.value}
                        value={item.value}
                        onClick={() => {
                          setSelectedSort(item.value);
                        }}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              )}
              {!isMobile && (
                <Box className='flex items-center' gridGap={6}>
                  <small className='text-secondary'>{t('oldFarms')}</small>
                  <ToggleSwitch
                    toggled={isOld}
                    onToggle={() => setIsOld(!isOld)}
                  />
                </Box>
              )}
              {selectedFarmCategory.id !== 0 && !merklAvailable && (
                <Box width={isMobile ? '100%' : 160}>
                  <CustomSwitch
                    width='100%'
                    height={40}
                    items={farmStatusItems}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}

        {selectedFarmCategory?.id === 0 && (
          <MyRewardFarms
            searchValue={searchValue}
            farmStatus={farmStatus}
            sortValue={selectedSort}
          />
        )}
        {selectedFarmCategory.id === 1 &&
          (merklAvailable ? (
            <AllMerklFarms
              searchValue={searchValue}
              farmStatus={farmStatus}
              sortValue={selectedSort}
            />
          ) : (
            <AllV3Farms searchValue={searchValue} farmStatus={farmStatus} />
          ))}
        {selectedFarmCategory.id === 2 && (
          <FarmingMyFarms search={searchValue} chainId={chainIdToUse} />
        )}
      </Box>
    </>
  );
}
