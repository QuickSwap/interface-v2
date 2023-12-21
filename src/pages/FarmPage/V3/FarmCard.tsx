import React from 'react';
import { Box, Button } from '@material-ui/core';
import { DoubleCurrencyLogo } from 'components';
import { formatNumber, getTokenFromAddress } from 'utils';
import APRHover from 'assets/images/aprHover.png';
import { useTranslation } from 'react-i18next';
import { FarmAPRTooltip } from './FarmAPRTooltip';
import { useHistory } from 'react-router-dom';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useActiveWeb3React } from 'hooks';

interface Props {
  farm: any;
}

export const V3FarmCard: React.FC<Props> = ({ farm }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { chainId } = useActiveWeb3React();
  const parsedQuery = useParsedQueryString();
  // const rewards = farm.farms.reduce(
  //   (
  //     memo: {
  //       amount: number;
  //       token: { address: string; symbol: string; decimals: number };
  //     }[],
  //     farmItem,
  //   ) => {
  //     for (const reward of farmItem.rewards) {
  //       const existingIndex = memo.findIndex(
  //         (item) =>
  //           item.token.address.toLowerCase() ===
  //           reward.token.address.toLowerCase(),
  //       );
  //       if (existingIndex === -1) {
  //         memo.push(reward);
  //       } else {
  //         memo = [
  //           ...memo.slice(0, existingIndex),
  //           {
  //             ...memo[existingIndex],
  //             amount: memo[existingIndex].amount + reward.amount,
  //           },
  //           ...memo.slice(existingIndex + 1),
  //         ];
  //       }
  //     }
  //     return memo;
  //   },
  //   [],
  // );

  const redirectWithPool = (pool: string) => {
    const currentPath = history.location.pathname + history.location.search;
    let redirectPath;
    if (parsedQuery && parsedQuery.pool) {
      redirectPath = currentPath.replace(
        `pool=${parsedQuery.pool}`,
        `pool=${pool}`,
      );
    } else {
      redirectPath = `${currentPath}${
        history.location.search === '' ? '?' : '&'
      }pool=${pool}`;
    }
    history.push(redirectPath);
  };

  const tokenMap = useSelectedTokenList();
  const token0 = getTokenFromAddress(farm.token0, chainId, tokenMap, []);
  const token1 = getTokenFromAddress(farm.token1, chainId, tokenMap, []);

  return (
    <Box width='100%' borderRadius={16} className='bg-secondary1'>
      <Box padding={2} className='flex items-center'>
        <Box width='90%' className='flex items-center'>
          <Box width='30%' className='flex items-center' gridGap={12}>
            <DoubleCurrencyLogo
              currency0={token0}
              currency1={token1}
              size={24}
            />
            <p>
              {farm.symbolToken0}/{farm.symbolToken1}
            </p>
          </Box>
          <Box width='20%' className='flex'>
            <p>${formatNumber(farm.tvl)}</p>
          </Box>
          <Box width='20%'>
            <small>{t('upTo')}</small>
            <Box className='flex'>
              <FarmAPRTooltip farms={farm.alm}>
                <Box className='farmCardAPR' gridGap={4}>
                  <p>{formatNumber(farm.apr)}%</p>
                  <img src={APRHover} width={16} />
                </Box>
              </FarmAPRTooltip>
            </Box>
          </Box>
          <Box width='30%'>
            {/* {rewards.map((reward) => (
              <p className='small' key={reward.token.address}>
                {formatNumber(reward.amount)} {reward.token.symbol}{' '}
                <small className='text-secondary'>{t('daily')}</small>
              </p>
            ))} */}
          </Box>
        </Box>
        <Box width='10%'>
          <Button
            className='farmCardButton'
            disabled={!farm.pool}
            onClick={() => {
              if (farm.pool) {
                redirectWithPool(farm.pool);
              }
            }}
          >
            {t('view')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default V3FarmCard;
