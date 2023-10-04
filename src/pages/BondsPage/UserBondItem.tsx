import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@material-ui/core';
import { QuestionHelper } from 'components';
import BuyBondModal from './BuyBondModal';
import BondTokenDisplay from './BondTokenDisplay';
import { formatCompact, formatNumber } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { BigNumber } from 'ethers';
import { Bond, UserBond } from 'types/bond';
import { Skeleton } from '@material-ui/lab';
import { formatUnits } from 'ethers/lib/utils';
import VestedTimer from './VestedTimer';

interface BondItemProps {
  userBond: UserBond;
}

const UserBondItem: React.FC<BondItemProps> = ({ userBond }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const [openModal, setOpenModal] = useState(false);

  const token1Obj = userBond.bond.token;
  const token2Obj =
    userBond.bond.billType === 'reserve'
      ? userBond.bond.earnToken
      : userBond.bond.quoteToken;
  const token3Obj = userBond.bond.earnToken;
  const stakeLP = userBond.bond.billType !== 'reserve';

  const pending = Number(
    formatUnits(
      userBond.payout ?? '0',
      userBond.bond?.earnToken?.decimals?.[chainId] ?? 18,
    ),
  );

  const claimable = Number(
    formatUnits(
      userBond.pendingRewards ?? '0',
      userBond.bond?.earnToken?.decimals?.[chainId] ?? 18,
    ),
  );

  return (
    <Box mb={2} className='bondItemWrapper'>
      <Box className='flex items-center' width='30%'>
        <BondTokenDisplay
          token1Obj={token1Obj}
          token2Obj={token2Obj}
          token3Obj={token3Obj}
          stakeLP={stakeLP}
        />
        <Box className='flex flex-col items-start' ml={2}>
          <Box className='bondTypeTag'>{userBond.bond.billType}</Box>
          <h6>
            {token1Obj?.symbol}
            {stakeLP ? `/${token2Obj?.symbol}` : ''}
          </h6>
        </Box>
      </Box>
      <Box width='20%'>
        <Box className='flex items-center'>
          <small>{t('claimable')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text={t('userBondClaimTooltip')} size={16} />
          </Box>
        </Box>
        {userBond.loading ? (
          <Skeleton width={80} height={20} />
        ) : (
          <Box className='flex items-end'>
            <p>{formatNumber(claimable)}</p>
            <Box className='flex' margin='0 0 3px 4px'>
              <span className='text-secondary'>
                ($
                {formatNumber((userBond.bond.earnTokenPrice ?? 0) * claimable)})
              </span>
            </Box>
          </Box>
        )}
      </Box>
      <Box width='20%'>
        <Box className='flex items-center'>
          <small>{t('pending')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text={t('userBondPendingTooltip')} size={16} />
          </Box>
        </Box>
        <Box className='flex'>
          {userBond.loading ? (
            <Skeleton width={50} height={20} />
          ) : (
            <Box className='flex items-end'>
              <p>{formatNumber(pending)}</p>
              <Box className='flex' margin='0 0 3px 4px'>
                <span className='text-secondary'>
                  ($
                  {formatNumber((userBond.bond.earnTokenPrice ?? 0) * pending)})
                </span>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <Box width='20%'>
        <Box className='flex items-center'>
          <small>{t('fullyVested')}</small>

          <Box className='flex' ml='5px'>
            <QuestionHelper text={t('userBondVestedTimeTooltip')} size={16} />
          </Box>
        </Box>
        <Box className='flex'>
          {userBond.loading ? (
            <Skeleton width={50} height={20} />
          ) : (
            <VestedTimer
              lastBlockTimestamp={userBond.lastBlockTimestamp ?? '0'}
              vesting={userBond.vesting ?? '0'}
              mobileFlag
            />
          )}
        </Box>
      </Box>
      <Box width='10%'>
        <Button fullWidth onClick={() => setOpenModal(true)}>
          {t('buy')}
        </Button>
      </Box>
    </Box>
  );
};

export default UserBondItem;
