import React from 'react';
import { Box, Button, useMediaQuery, useTheme } from '@material-ui/core';
import ClaimAllBg from 'assets/images/claimAllBg.png';
import { useTranslation } from 'react-i18next';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import { formatNumber } from 'utils';
import { useClaimMerklRewards } from 'hooks/useClaimMerklRewards';
import { Skeleton } from '@material-ui/lab';
import { CurrencyLogo, CustomTooltip } from 'components';
import { useActiveWeb3React } from 'hooks';
import { useGetMerklRewards } from 'hooks/v3/useV3Farms';

export const MerklClaimAll: React.FC = () => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();

  const { isLoading: loadingFarms, data: merklRewards } = useGetMerklRewards(
    chainId,
    account,
  );

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
