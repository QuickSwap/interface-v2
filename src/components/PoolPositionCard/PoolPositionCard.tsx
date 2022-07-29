import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@material-ui/core';
import { ChevronDown, ChevronUp } from 'react-feather';
import { ChainId, Pair } from '@uniswap/sdk';
import { unwrappedToken } from 'utils/wrappedCurrency';
import {
  useStakingInfo,
  getBulkPairData,
  useDualStakingInfo,
} from 'state/stake/hooks';
import { DoubleCurrencyLogo } from 'components';
import { formatAPY, getAPYWithFee, getOneYearFee } from 'utils';
import PoolPositionCardDetails from './PoolPositionCardDetails';
import 'components/styles/PoolPositionCard.scss';
import { Trans, useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';
import PoolPositionCardDetailsV3 from './PoolPositionCardDetailsV3';
import {
  StyledBlueTag,
  StyledFilledBox,
  StyledGreenTag,
  StyledLabel,
} from 'components/AddLiquidityV3/CommonStyledElements';
import { ReactComponent as ExpandIcon } from 'assets/images/expand_circle.svg';
import { ReactComponent as ExpandIconUp } from 'assets/images/expand_circle_up.svg';
import { ReactComponent as WarningIcon } from 'assets/images/warning_icon.svg';

const PoolPositionCard: React.FC<{ pair: Pair }> = ({ pair }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const [bulkPairData, setBulkPairData] = useState<any>(null);
  const chainIdOrDefault = chainId ?? ChainId.MATIC;
  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

  const stakingInfos = useStakingInfo(chainIdOrDefault, pair);
  const dualStakingInfos = useDualStakingInfo(chainIdOrDefault, pair);
  const stakingInfo = useMemo(
    () =>
      stakingInfos.length > 0
        ? stakingInfos[0]
        : dualStakingInfos.length > 0
        ? dualStakingInfos[0]
        : null,
    [stakingInfos, dualStakingInfos],
  );

  const pairId = pair.liquidityToken.address;

  useEffect(() => {
    const pairLists = [pairId];
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
      return formatAPY(
        getAPYWithFee(stakingInfo.perMonthReturnInRewards ?? 0, oneYearFee),
      );
    }
  }, [stakingInfo, bulkPairData]);

  return (
    <StyledFilledBox>
      <Box
        className='flex justify-between items-center'
        height={83}
        borderRadius={10}
      >
        <Box ml={2.5}>
          <Box className='flex item-start'>
            <DoubleCurrencyLogo
              currency0={currency0}
              currency1={currency1}
              size={28}
            />
            <p className='weight-600' style={{ marginLeft: 16 }}>
              {!currency0 || !currency1
                ? 'Loading'
                : `${currency0.symbol}/${currency1.symbol}`}
            </p>

            <Box
              bgcolor={' rgba(15, 198, 121, 0.3)'}
              className='flex items-center'
              px={1.5}
              ml={1.5}
              borderRadius={8}
            >
              <Box
                height={10}
                width={10}
                borderRadius={'50%'}
                bgcolor='#0fc679'
                mr={1}
              ></Box>
              <StyledLabel fontSize='12px' color='#0fc679'>
                in range
              </StyledLabel>
            </Box>
            <Box
              bgcolor={'rgba(68, 138, 255, 0.3)'}
              className='flex items-center'
              px={1.5}
              ml={1}
              borderRadius={8}
            >
              <StyledLabel fontSize='12px' color='#c7cad9'>
                0.05% Fee
              </StyledLabel>
            </Box>
            <Box
              bgcolor={'#ffa000'}
              className='flex items-center'
              px={1.5}
              ml={1}
              borderRadius={8}
            >
              <Box mr={0.5}>
                <WarningIcon />
              </Box>
              <StyledLabel fontSize='12px' color='#12131a'>
                Out of range
              </StyledLabel>
            </Box>
          </Box>
          {!showMore && (
            <Box mt={1}>
              <StyledLabel fontSize='12px' color='#696c80'>
                Min 0.58183 USDC per MATIC Max 0.64855 USDC per MATIC
              </StyledLabel>
            </Box>
          )}
        </Box>

        <Box
          mr={2.5}
          onClick={() => setShowMore(!showMore)}
          className='cursor-pointer'
        >
          {showMore ? <ExpandIconUp /> : <ExpandIcon />}
        </Box>
      </Box>
      {showMore && <PoolPositionCardDetailsV3 pair={pair} />}
      {stakingInfo && !stakingInfo.ended && apyWithFee && (
        <Box className='poolPositionAPYWrapper'>
          <small>
            <Trans
              i18nKey='poolAPYDesc'
              values={{
                apy: apyWithFee,
                symbol1: currency0.symbol?.toUpperCase(),
                symbol2: currency1.symbol?.toUpperCase(),
              }}
              components={{ pspan: <small className='text-success' /> }}
            />
          </small>
        </Box>
      )}
    </StyledFilledBox>

    // <Box
    //   className={`poolPositionCard ${
    //     showMore ? 'bg-secondary2' : 'bg-transparent'
    //   }`}
    // >
    //   <Box className='poolPositionCardTop'>
    //     <Box className='flex items-center'>
    //       <DoubleCurrencyLogo
    //         currency0={currency0}
    //         currency1={currency1}
    //         size={28}
    //       />
    // <p className='weight-600' style={{ marginLeft: 16 }}>
    //   {!currency0 || !currency1
    //     ? 'Loading'
    //     : `${currency0.symbol}/${currency1.symbol}`}
    // </p>
    //     </Box>

    //     <Box
    //       className='flex items-center text-primary cursor-pointer'
    //       onClick={() => setShowMore(!showMore)}
    //     >
    //       <p style={{ marginRight: 8 }}>{t('manage')}</p>
    //       {showMore ? <ChevronUp size='20' /> : <ChevronDown size='20' />}
    //     </Box>
    //   </Box>

    // {showMore && <PoolPositionCardDetailsV3 pair={pair} />}
    // {stakingInfo && !stakingInfo.ended && apyWithFee && (
    //   <Box className='poolPositionAPYWrapper'>
    //     <small>
    //       <Trans
    //         i18nKey='poolAPYDesc'
    //         values={{
    //           apy: apyWithFee,
    //           symbol1: currency0.symbol?.toUpperCase(),
    //           symbol2: currency1.symbol?.toUpperCase(),
    //         }}
    //         components={{ pspan: <small className='text-success' /> }}
    //       />
    //     </small>
    //   </Box>
    // )}
    // </Box>
  );
};

export default PoolPositionCard;
