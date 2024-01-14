import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import CustomSelector from 'components/v3/CustomSelector';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
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
}

export default function Farms() {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainId);
  const merklAvailable = config['farm']['merkl'];

  const router = useRouter();
  const farmStatus = router.query.farmStatus
    ? (router.query.farmStatus as string)
    : 'active';
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const [searchValue, setSearchValue] = useState('');
  const currencyParamsArray = Object.keys(router.query)
    .map((key, index) => [key, Object.values(router.query)[index]])
    .filter((item) => item[0] !== 'version');

  const redirectWithFarmStatus = (status: string) => {
    let redirectPath;
    if (router.query.farmStatus) {
      redirectPath = router.asPath.replace(
        `farmStatus=${router.query.farmStatus}`,
        `farmStatus=${status}`,
      );
    } else {
      redirectPath = `${router.asPath}${
        currencyParamsArray.length === 0 ? '?' : '&'
      }farmStatus=${status}`;
    }
    router.push(redirectPath);
  };

  const currentTabQueried =
    router.query && router.query.tab ? (router.query.tab as string) : 'farms';

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
      let redirectPath;
      if (router.query.tab) {
        redirectPath = router.asPath.replace(
          `tab=${router.query.tab}`,
          `tab=${selected.link}`,
        );
      } else {
        redirectPath = `${router.asPath}${
          currencyParamsArray.length === 0 ? '?' : '&'
        }tab=${selected.link}`;
      }
      router.push(redirectPath);
    },
    [currencyParamsArray, router],
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
    router.query && router.query.pool
      ? router.query.pool.toString()
      : undefined;

  const token0 =
    router.query && router.query.token0
      ? router.query.token0.toString()
      : undefined;

  const token1 =
    router.query && router.query.token1
      ? router.query.token1.toString()
      : undefined;

  const isAllFarms = merklAvailable ? !!poolId : !!token0 && !!token1;

  useEffect(() => {
    router.push('/farm/v3');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return (
    <Box className={isAllFarms ? '' : 'bg-palette'} borderRadius='10px'>
      {!isAllFarms && (
        <Box
          pt={2}
          px={2}
          className='flex flex-wrap justify-between'
          gap='16px'
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
            gap='16px'
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
