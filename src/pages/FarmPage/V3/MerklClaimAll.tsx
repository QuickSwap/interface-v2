import React from 'react';
import { Box, Button, useMediaQuery, useTheme } from '@material-ui/core';
import ClaimAllBg from 'assets/images/claimAllBg.png';
import { useTranslation } from 'react-i18next';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import { formatNumber, getTokenFromAddress } from 'utils';
import { useClaimMerklRewards } from 'hooks/useClaimMerklRewards';
import { Skeleton } from '@material-ui/lab';
import { CurrencyLogo, CustomTooltip } from 'components';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useActiveWeb3React } from 'hooks';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'ethers/lib/utils';

export const MerklClaimAll: React.FC = () => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();
  const fetchUserRewardsMerklFarms = async () => {
    if (!account) {
      return [];
    }
    const res = await fetch(
      `${process.env.REACT_APP_MERKL_API_URL}/v3/userRewards?chainId=${chainId}&user=${account}&proof=true`,
    );
    const retData = await res.json();
    const data: any[] = [];
    for (const [key, value] of Object.entries<any>(retData)) {
      const token = getTokenFromAddress(key, chainId, tokenMap, []);
      data.push({
        address: key,
        unclaimed: Number(formatUnits(value.unclaimed, value.decimals)),
        symbol: value.symbol,
        token,
      });
    }
    return data;
  };
  const { isLoading: loadingFarms, data: merklRewards } = useQuery({
    queryKey: ['fetchUserRewardsMerklFarms', chainId, account],
    queryFn: fetchUserRewardsMerklFarms,
    refetchInterval: 60000,
  });

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const tokens = merklRewards ? merklRewards.map((item) => item.address) : [];

  const {
    loading: loadingRewardTokenPrices,
    prices: rewardTokenPrices,
  } = useUSDCPricesFromAddresses(tokens as string[]);

  const rewardsUSD = merklRewards?.reduce((total: number, reward: any) => {
    const rewardTokenPrice =
      rewardTokenPrices?.find(
        (item) => item.address.toLowerCase() === reward.address.toLowerCase(),
      )?.price ?? 0;
    return total + rewardTokenPrice * reward.unclaimed;
  }, 0);

  const { claiming, claimReward } = useClaimMerklRewards();

  return (
    <Box className={isMobile ? 'claimAllBox mobile' : 'claimAllBox'}>
      <img src={ClaimAllBg} width='100%' />
      <Box className='flex flex-col' gridGap={8}>
        <p>{t('myrewards')}</p>
        {loadingRewardTokenPrices || loadingFarms ? (
          <Skeleton variant='rect' width={100} height={27} />
        ) : merklRewards && merklRewards.length > 0 ? (
          <CustomTooltip
            placement='bottom-start'
            title={
              <Box className='flex flex-col' gridGap={8}>
                {merklRewards.map((reward) => (
                  <Box
                    className='flex justify-between'
                    width={200}
                    key={reward.address}
                  >
                    <Box className='flex items-center' gridGap={8}>
                      <CurrencyLogo size='16px' currency={reward.token} />
                      <small>{reward.symbol}</small>
                    </Box>
                    <small>{formatNumber(reward.unclaimed)}</small>
                  </Box>
                ))}
              </Box>
            }
          >
            <h6>${formatNumber(rewardsUSD)}</h6>
          </CustomTooltip>
        ) : (
          <h6>${formatNumber(rewardsUSD)}</h6>
        )}
      </Box>
      <Button disabled={claiming} onClick={claimReward}>
        {claiming ? t('claiming') : t('claimAll')}
      </Button>
    </Box>
  );
};
