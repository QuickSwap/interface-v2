import React, { useState } from 'react';
import { Box } from 'theme/components';
import { DualStakingInfo, StakingInfo } from 'types';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { DoubleCurrencyLogo, CurrencyLogo } from 'components';
import CircleInfoIcon from 'assets/images/circleinfo.svg';
import FarmCardDetails from './FarmCardDetails';
import {
  getAPYWithFee,
  getRewardRate,
  getStakedAmountStakingInfo,
  getTVLStaking,
  getEarnedUSDLPFarm,
  getEarnedUSDDualFarm,
  formatTokenAmount,
  formatAPY,
} from 'utils';
import { ChevronDown, ChevronUp } from 'react-feather';
import 'components/styles/FarmCard.scss';
import { Trans, useTranslation } from 'react-i18next';
import { useIsXS } from 'hooks/useMediaQuery';

const FarmCard: React.FC<{
  stakingInfo: StakingInfo | DualStakingInfo;
  stakingAPY: number;
  isLPFarm?: boolean;
}> = ({ stakingInfo, stakingAPY, isLPFarm }) => {
  const { t } = useTranslation();
  const [isExpandCard, setExpandCard] = useState(false);

  const lpStakingInfo = stakingInfo as StakingInfo;
  const dualStakingInfo = stakingInfo as DualStakingInfo;

  const token0 = stakingInfo.tokens[0];
  const token1 = stakingInfo.tokens[1];

  const currency0 = unwrappedToken(token0);
  const currency1 = unwrappedToken(token1);

  const stakedAmounts = getStakedAmountStakingInfo(stakingInfo);

  let apyWithFee: number | string = 0;

  if (stakingAPY && stakingAPY > 0 && stakingInfo.perMonthReturnInRewards) {
    apyWithFee = formatAPY(
      getAPYWithFee(stakingInfo.perMonthReturnInRewards, stakingAPY),
    );
  }

  const tvl = getTVLStaking(
    stakedAmounts?.totalStakedUSD,
    stakedAmounts?.totalStakedBase,
  );

  const lpPoolRate = getRewardRate(
    lpStakingInfo.totalRewardRate,
    lpStakingInfo.rewardToken,
  );

  const dualPoolRateA = getRewardRate(
    dualStakingInfo.totalRewardRateA,
    dualStakingInfo.rewardTokenA,
  );
  const dualPoolRateB = getRewardRate(
    dualStakingInfo.totalRewardRateB,
    dualStakingInfo.rewardTokenB,
  );

  const earnedUSDStr = isLPFarm
    ? getEarnedUSDLPFarm(lpStakingInfo)
    : getEarnedUSDDualFarm(dualStakingInfo);

  const lpRewards = lpStakingInfo.rewardTokenPrice * lpStakingInfo.rate;
  const dualRewards =
    dualStakingInfo.rateA * dualStakingInfo.rewardTokenAPrice +
    dualStakingInfo.rateB * dualStakingInfo.rewardTokenBPrice;

  const isMobile = useIsXS();

  const renderPool = (width: string) => (
    <Box className='flex items-center' width={width}>
      <DoubleCurrencyLogo
        currency0={currency0}
        currency1={currency1}
        size={28}
      />
      <Box margin='0 0 0 12px'>
        <small>
          {currency0.symbol} / {currency1.symbol} LP
        </small>
      </Box>
    </Box>
  );

  return (
    <Box
      className={`farmLPCard ${
        stakingInfo.sponsored ? 'farmSponsoredCard' : ''
      } ${isExpandCard ? 'highlightedCard' : ''}`}
    >
      {stakingInfo.sponsored && (
        <Box className='farmSponsorTag'>{t('sponsored')}</Box>
      )}
      <Box
        className='farmLPCardUp'
        onClick={() => setExpandCard(!isExpandCard)}
      >
        {isMobile ? (
          <>
            {renderPool(isExpandCard ? '95%' : '70%')}
            {!isExpandCard && (
              <Box width='25%'>
                <Box className='flex items-center'>
                  <span className='text-secondary'>{t('apy')}</span>
                  <Box margin='0 0 0 4px' height='16px'>
                    <img src={CircleInfoIcon} alt={'arrow up'} />
                  </Box>
                </Box>
                <Box margin='4px 0 0'>
                  <small className='text-success'>{apyWithFee}%</small>
                </Box>
              </Box>
            )}
            <Box width='5%' className='flex justify-end text-primary'>
              {isExpandCard ? <ChevronUp /> : <ChevronDown />}
            </Box>
          </>
        ) : (
          <>
            {renderPool('30%')}
            <Box width='20%' textAlign='center'>
              <small>{tvl}</small>
            </Box>
            <Box width='25%' textAlign='center'>
              <p className='small'>
                ${(isLPFarm ? lpRewards : dualRewards).toLocaleString('us')} /{' '}
                {t('day')}
              </p>
              {isLPFarm ? (
                <p className='small'>{lpPoolRate}</p>
              ) : (
                <>
                  <p className='small'>{dualPoolRateA}</p>
                  <p className='small'>{dualPoolRateB}</p>
                </>
              )}
            </Box>
            <Box width='15%' className='flex justify-center items-center'>
              <small className='text-success'>{apyWithFee}%</small>
              <Box margin='0 0 0 4px' height='16px'>
                <img src={CircleInfoIcon} alt={'arrow up'} />
              </Box>
            </Box>
            <Box width='20%' textAlign='right'>
              <small>{earnedUSDStr}</small>
              {isLPFarm ? (
                <Box className='flex items-center justify-end'>
                  <CurrencyLogo
                    currency={lpStakingInfo.rewardToken}
                    size='16px'
                  />
                  <small style={{ marginLeft: 5 }}>
                    {formatTokenAmount(lpStakingInfo.earnedAmount)}
                    &nbsp;{lpStakingInfo.rewardToken.symbol}
                  </small>
                </Box>
              ) : (
                <>
                  <Box className='flex items-center justify-end'>
                    <CurrencyLogo
                      currency={unwrappedToken(dualStakingInfo.rewardTokenA)}
                      size='16px'
                    />
                    <small style={{ marginLeft: 5 }}>
                      {formatTokenAmount(dualStakingInfo.earnedAmountA)}
                      &nbsp;{dualStakingInfo.rewardTokenA.symbol}
                    </small>
                  </Box>
                  <Box className='flex items-center justify-end'>
                    <CurrencyLogo
                      currency={unwrappedToken(dualStakingInfo.rewardTokenB)}
                      size='16px'
                    />
                    <small style={{ marginLeft: 5 }}>
                      {formatTokenAmount(dualStakingInfo.earnedAmountB)}
                      &nbsp;{dualStakingInfo.rewardTokenB.symbol}
                    </small>
                  </Box>
                </>
              )}
            </Box>
          </>
        )}
      </Box>

      {isExpandCard && (
        <FarmCardDetails
          stakingInfo={stakingInfo}
          stakingAPY={stakingAPY}
          isLPFarm={isLPFarm}
        />
      )}
      {stakingInfo.sponsored && stakingInfo.sponsorLink && (
        <Box className='farmSponsoredLink'>
          <Trans
            i18nKey='learnmoreproject'
            components={{
              alink: (
                <a
                  href={stakingInfo.sponsorLink}
                  rel='noreferrer'
                  target='_blank'
                />
              ),
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default FarmCard;
