import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import CustomSelector from 'components/v3/CustomSelector';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { FarmingMyFarms } from 'components/StakerMyStakes';
import { useActiveWeb3React } from 'hooks';
import { ChainId, Token } from '@uniswap/sdk';
import { SelectorItem } from 'components/v3/CustomSelector/CustomSelector';
import { SearchInput, CustomSwitch } from 'components';
import AllMerklFarms from './AllMerklFarms';
import { getConfig } from 'config/index';
import AllV3Farms from './AllV3Farms';

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
    return [
      {
        text: t('farms'),
        id: 1,
        link: 'farms',
      },
      {
        text: t('myFarms'),
        id: 0,
        link: 'my-farms',
      },
    ];
  }, [t]);

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
    <Box className={isAllFarms ? '' : 'bg-palette'} borderRadius={10}>
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
          <Box
            className='flex items-center flex-wrap'
            width={isMobile ? '100%' : 'auto'}
            gridGap='16px'
          >
            <Box width={isMobile ? '100%' : 200}>
              <SearchInput
                placeholder='Search'
                value={searchValue}
                setValue={setSearchValue}
                isIconAfter
              />
            </Box>
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
        <FarmingMyFarms search={searchValue} chainId={chainIdToUse} />
      )}
      {selectedFarmCategory.id === 1 &&
        (merklAvailable ? (
          <AllMerklFarms searchValue={searchValue} farmStatus={farmStatus} />
        ) : (
          <AllV3Farms searchValue={searchValue} farmStatus={farmStatus} />
        ))}
    </Box>
  );
}
