import React from 'react';
import { Box, Button } from 'theme/components';
import { CurrencyLogo } from 'components';
import { useFarmingHandlers } from 'hooks/useStakerHandlers';
import { FarmingType } from 'models/enums';
import Loader from 'components/Loader';
import { formatReward } from 'utils/formatReward';
import { Token } from '@uniswap/sdk';
import { useV3StakeData } from 'state/farms/hooks';
import { useActiveWeb3React } from 'hooks';
import { getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useTranslation } from 'react-i18next';
import { useIsXS } from 'hooks/useMediaQuery';

interface FarmCardDetailProps {
  el: any;
}

export default function FarmCardDetail({ el }: FarmCardDetailProps) {
  const { t } = useTranslation();
  const rewardToken = el.eternalRewardToken;
  const earned = el.eternalEarned;
  const bonusEarned = el.eternalBonusEarned;
  const bonusRewardToken = el.eternalBonusRewardToken;

  const { chainId } = useActiveWeb3React();
  const isMobile = useIsXS();

  const { v3Stake } = useV3StakeData();
  const { txType, selectedTokenId, txConfirmed, txError, selectedFarmingType } =
    v3Stake ?? {};

  const { eternalCollectRewardHandler, withdrawHandler, claimRewardsHandler } =
    useFarmingHandlers() || {};

  const tokenMap = useSelectedTokenList();
  const farmRewardToken =
    chainId && rewardToken
      ? getTokenFromAddress(rewardToken.id, chainId, tokenMap, [
          new Token(
            chainId,
            rewardToken.id,
            Number(rewardToken.decimals),
            rewardToken.symbol,
          ),
        ])
      : undefined;

  const HOPTokenAddress = '0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc';

  const farmBonusRewardToken =
    chainId && bonusRewardToken
      ? getTokenFromAddress(
          el.pool &&
            el.pool.id &&
            el.pool.id.toLowerCase() ===
              '0x0db644468cd5c664a354e31aa1f6dba1d1dead47'
            ? HOPTokenAddress
            : bonusRewardToken.id,
          chainId,
          tokenMap,
          [
            new Token(
              chainId,
              el.pool &&
              el.pool.id &&
              el.pool.id.toLowerCase() ===
                '0x0db644468cd5c664a354e31aa1f6dba1d1dead47'
                ? HOPTokenAddress
                : bonusRewardToken.id,
              Number(bonusRewardToken.decimals),
              bonusRewardToken.symbol,
            ),
          ],
        )
      : undefined;

  return (
    <Box
      margin='8px 0 0'
      borderRadius='12px'
      className='flex bg-palette justify-evenly items-center flex-wrap'
    >
      <Box padding='12px' width='100%'>
        <Box>
          <p>{t('eternalFarming')}</p>
        </Box>
        {!el.eternalFarming && (
          <>
            <Box className='flex justify-center items-center' height='130px'>
              <small className='text-secondary'>{t('noEternalFarms')}</small>
            </Box>
            <Box width='100%'>
              <Button
                width='100%'
                disabled={
                  selectedTokenId === el.id &&
                  txType === 'withdraw' &&
                  !txConfirmed &&
                  !txError
                }
                onClick={() => {
                  withdrawHandler(el.id);
                }}
              >
                {selectedTokenId === el.id &&
                txType === 'withdraw' &&
                !txConfirmed &&
                !txError ? (
                  <>
                    <Loader size={'1rem'} stroke={'var(--white)'} />
                    <Box margin='0 0 0 5px'>
                      <small>{t('withdrawing')}</small>
                    </Box>
                  </>
                ) : (
                  <>
                    <small>{t('withdraw')}</small>
                  </>
                )}
              </Button>
            </Box>
          </>
        )}
        {el.eternalFarming && (
          <>
            <Box className='flex flex-wrap' margin='16px 0 0' padding='16px'>
              <Box width={!isMobile && bonusRewardToken ? '50%' : '100%'}>
                <small className='text-secondary'>{t('earnedRewards')}</small>
                <Box margin='8px 0 0'>
                  <Box className='flex items-center'>
                    {farmRewardToken && (
                      <CurrencyLogo size={'24px'} currency={farmRewardToken} />
                    )}

                    <Box margin='0 0 0 6px'>
                      <p>{`${formatReward(earned)} ${rewardToken.symbol}`}</p>
                    </Box>
                  </Box>
                </Box>
              </Box>
              {farmBonusRewardToken && (
                <Box
                  margin={isMobile ? '16px 0 0' : '0'}
                  width={!isMobile ? '50%' : '100%'}
                  textAlign={isMobile ? 'left' : 'right'}
                >
                  <small className='text-secondary'>{t('earnedBonus')}</small>
                  <Box
                    margin='8px 0 0'
                    className={`flex items-center ${
                      isMobile ? '' : 'justify-end'
                    }`}
                  >
                    <CurrencyLogo
                      size={'24px'}
                      currency={farmBonusRewardToken}
                    />
                    <Box margin='0 0 0 6px'>
                      <p>{`${formatReward(bonusEarned)} ${
                        farmBonusRewardToken.symbol
                      }`}</p>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            <Box
              margin='16px 0 0'
              className='flex justify-between items-center flex-wrap'
            >
              <Box width={isMobile ? '100%' : '49%'}>
                <Button
                  width='100%'
                  disabled={
                    (selectedTokenId === el.id &&
                      txType === 'eternalCollectReward' &&
                      !txConfirmed &&
                      !txError) ||
                    (el.eternalEarned == 0 && el.eternalBonusEarned == 0)
                  }
                  onClick={() => {
                    eternalCollectRewardHandler(el.id, { ...el });
                  }}
                >
                  {selectedTokenId === el.id &&
                  txType === 'eternalCollectReward' &&
                  !txConfirmed &&
                  !txError ? (
                    <>
                      <Loader size={'18px'} stroke={'var(--white)'} />
                      <Box margin='0 0 0 5px'>
                        <small>{t('claiming')}</small>
                      </Box>
                    </>
                  ) : (
                    <small>{t('claim')}</small>
                  )}
                </Button>
              </Box>
              <Box width={isMobile ? '100%' : '49%'}>
                <Button
                  width='100%'
                  style={{ marginTop: isMobile ? '16px' : 0 }}
                  disabled={
                    selectedTokenId === el.id &&
                    selectedFarmingType === FarmingType.ETERNAL &&
                    txType === 'claimRewards' &&
                    !txConfirmed &&
                    !txError
                  }
                  onClick={() => {
                    claimRewardsHandler(el.id, { ...el }, FarmingType.ETERNAL);
                  }}
                >
                  {selectedTokenId === el.id &&
                  selectedFarmingType === FarmingType.ETERNAL &&
                  txType === 'claimRewards' &&
                  !txConfirmed &&
                  !txError ? (
                    <>
                      <Loader size={'18px'} stroke={'var(--white)'} />
                      <Box margin='0 0 0 5px'>
                        <small>{t('undepositing')}</small>
                      </Box>
                    </>
                  ) : (
                    <small>{t('undeposit')}</small>
                  )}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
