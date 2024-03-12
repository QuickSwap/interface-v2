import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, useTheme, useMediaQuery } from '@material-ui/core';
import { CustomModal, QuestionHelper } from 'components';
import BondTokenDisplay from './BondTokenDisplay';
import { formatNumber } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { UserBond } from 'types/bond';
import { Skeleton } from '@material-ui/lab';
import { formatUnits } from 'ethers/lib/utils';
import VestedTimer from './VestedTimer';
import UserBondModalView from './UserBondModalView';
import ClaimBond from './ClaimBond';

interface BondItemProps {
  userBond: UserBond;
}

const UserBondItem: React.FC<BondItemProps> = ({ userBond }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const [openModal, setOpenModal] = useState(false);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const isTablet = useMediaQuery(breakpoints.down('sm'));

  const token1Obj = userBond.bond.token;
  const token2Obj =
    userBond.bond.billType === 'reserve'
      ? userBond.bond.earnToken
      : userBond.bond.quoteToken;
  const token3Obj = userBond.bond.earnToken;
  const stakeLP = userBond.bond.billType !== 'reserve';

  const pending = Number(
    formatUnits(
      userBond.totalPayout ?? '0',
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
      {openModal && (
        <CustomModal
          open={openModal}
          modalWrapper='bondModalWrapper'
          onClose={() => {
            setOpenModal(false);
          }}
        >
          <UserBondModalView
            bond={userBond.bond}
            billId={userBond.id}
            onDismiss={() => setOpenModal(false)}
          />
        </CustomModal>
      )}
      <Box
        className='flex items-center'
        width={isMobile ? '100%' : isTablet ? '51%' : '30%'}
        my='6px'
      >
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
            {` -> `}
            {stakeLP ? token3Obj?.symbol : token2Obj?.symbol}
          </h6>
        </Box>
      </Box>
      <Box
        width={isMobile ? '100%' : isTablet ? '49%' : '17%'}
        my='6px'
        className={isMobile ? 'flex items-center justify-between' : ''}
      >
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
      <Box
        width={isMobile ? '100%' : isTablet ? '51%' : '17%'}
        my='6px'
        className={isMobile ? 'flex items-center justify-between' : ''}
      >
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
      <Box width={isMobile ? '100%' : isTablet ? '49%' : '16%'} my='6px'>
        <VestedTimer
          lastBlockTimestamp={userBond.lastBlockTimestamp ?? '0'}
          vesting={userBond.vesting ?? '0'}
          mobileFlag={isMobile}
        />
      </Box>
      <Box
        width={isTablet ? '100%' : '20%'}
        className='flex justify-between'
        my='6px'
      >
        <Box width='49%'>
          <ClaimBond
            billAddress={userBond.address}
            billIds={[userBond.id]}
            pendingRewards={userBond.pendingRewards ?? '0'}
            earnToken={userBond.bond.earnToken.symbol}
          />
        </Box>
        <Box width='49%'>
          <Button onClick={() => setOpenModal(true)}>{t('view')}</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UserBondItem;
