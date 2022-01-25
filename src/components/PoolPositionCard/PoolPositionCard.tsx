import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { ChevronDown, ChevronUp } from 'react-feather';
import { Pair } from '@uniswap/sdk';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useStakingInfo, getBulkPairData } from 'state/stake/hooks';
import { DoubleCurrencyLogo } from 'components';
import { getAPYWithFee, getOneYearFee } from 'utils';
import PoolPositionCardDetails from './PoolPositionCardDetails';

interface PoolPositionCardProps {
  pair: Pair;
}

const PoolPositionCard: React.FC<PoolPositionCardProps> = ({ pair }) => {
  const [bulkPairData, setBulkPairData] = useState<any>(null);
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

  const stakingInfos = useStakingInfo(pair);
  const stakingInfo = useMemo(
    () => (stakingInfos && stakingInfos.length > 0 ? stakingInfos[0] : null),
    [stakingInfos],
  );

  const pairId = stakingInfo ? stakingInfo.pair : null;

  useEffect(() => {
    const pairLists = pairId ? [pairId] : [];
    getBulkPairData(pairLists).then((data) => setBulkPairData(data));
    return () => setBulkPairData(null);
  }, [pairId]);

  const [showMore, setShowMore] = useState(false);

  const apyWithFee = useMemo(() => {
    if (stakingInfo && bulkPairData) {
      const dayVolume = bulkPairData[stakingInfo.pair]?.oneDayVolumeUSD;
      const reserveUSD = bulkPairData[stakingInfo.pair]?.reserveUSD;
      const oneYearFee =
        dayVolume && reserveUSD ? getOneYearFee(dayVolume, reserveUSD) : 0;
      const apy = getAPYWithFee(
        stakingInfo.perMonthReturnInRewards ?? 0,
        oneYearFee,
      ); // compounding monthly APY
      if (apy > 100000000) {
        return '>100000000';
      } else {
        return Number(apy.toFixed(2)).toLocaleString();
      }
    }
  }, [stakingInfo, bulkPairData]);

  return (
    <Box
      width={1}
      border={`1px solid ${palette.secondary.dark}`}
      borderRadius={10}
      bgcolor={showMore ? palette.secondary.dark : 'transparent'}
      style={{ overflow: 'hidden' }}
    >
      <Box
        paddingX={isMobile ? 1.5 : 3}
        paddingY={isMobile ? 2 : 3}
        display='flex'
        alignItems='center'
        justifyContent='space-between'
      >
        <Box display='flex' alignItems='center'>
          <DoubleCurrencyLogo
            currency0={currency0}
            currency1={currency1}
            margin={true}
            size={28}
          />
          <Typography
            variant='h6'
            style={{ color: palette.text.primary, marginLeft: 16 }}
          >
            {!currency0 || !currency1
              ? 'Loading'
              : `${currency0.symbol}/${currency1.symbol}`}
          </Typography>
        </Box>

        <Box
          display='flex'
          alignItems='center'
          color={palette.primary.main}
          style={{ cursor: 'pointer' }}
          onClick={() => setShowMore(!showMore)}
        >
          <Typography variant='body1' style={{ marginRight: 8 }}>
            Manage
          </Typography>
          {showMore ? <ChevronUp size='20' /> : <ChevronDown size='20' />}
        </Box>
      </Box>

      {showMore && <PoolPositionCardDetails pair={pair} pairId={pairId} />}
      {stakingInfo && apyWithFee && (
        <Box bgcolor='#404557' paddingY={0.75} paddingX={isMobile ? 2 : 3}>
          <Typography variant='body2'>
            Earn{' '}
            <span style={{ color: palette.success.main }}>
              {apyWithFee}% APY
            </span>{' '}
            by staking your LP tokens in {currency0.symbol?.toUpperCase()} /{' '}
            {currency1.symbol?.toUpperCase()} Farm
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PoolPositionCard;
