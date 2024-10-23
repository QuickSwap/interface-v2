import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import VestedTimer from './VestedTimer';
import TransferBondModal from './TransferBondModal';
import ClaimBond from './ClaimBond';
import { LiquidityDex, dexDisplayAttributes } from '@ape.swap/apeswap-lists';
import { Bond } from 'types/bond';
import { useActiveWeb3React } from 'hooks';
import { Box, Button, Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import BondTokenDisplay from './BondTokenDisplay';
import BillNFTImage from 'assets/images/bonds/quickBond.jpg';
import {
  useUserOwnedBondNftData,
  useUserOwnedBonds,
} from 'hooks/bond/useUserBond';
import { formatUnits } from 'ethers/lib/utils';
import { formatNumber } from 'utils';
import { useCurrency, useCurrencyFromSymbol } from 'hooks/Tokens';
import { CurrencyLogo, DoubleCurrencyLogo } from 'components';

interface BondModalProps {
  onDismiss?: () => void;
  bond: Bond;
  billId: string | undefined;
}

const BILL_ATTRIBUTES = [
  'The Legend',
  'The Location',
  'The Moment',
  'The Trend',
  'The Innovation',
];

const UserBondModalView: React.FC<BondModalProps> = ({
  onDismiss,
  bond,
  billId,
}) => {
  const userOwnedBonds = useUserOwnedBonds([bond]);

  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const { earnToken, lpToken, index, billType } = bond;
  const userBond = userOwnedBonds?.find(
    (b) => billId && parseInt(b.id) === parseInt(billId),
  );
  const { data: userOwnedBondNftData } = useUserOwnedBondNftData(
    userBond,
    chainId,
  );

  const pending = formatUnits(
    userBond?.payout ?? 0,
    userBond?.bond?.earnToken?.decimals?.[chainId] ?? 18,
  );
  const pendingUsd = Number(pending) * (bond?.earnTokenPrice ?? 0);
  const claimable = formatUnits(
    userBond?.pendingRewards ?? 0,
    userBond?.bond?.earnToken?.decimals?.[chainId] ?? 18,
  );
  const attributes = userOwnedBondNftData?.attributes?.filter((attrib: any) =>
    BILL_ATTRIBUTES.includes(attrib.trait_type),
  );
  const claimableUsd = Number(claimable) * (bond?.earnTokenPrice ?? 0);

  const [openTransferBondModal, setOpenTransferBondModal] = useState(false);
  const showCaseToken = useCurrency(
    userBond?.bond.showcaseToken?.address[chainId] ??
      userBond?.bond.earnToken.address[chainId],
  );

  return (
    <>
      {openTransferBondModal && userBond && (
        <TransferBondModal
          open={openTransferBondModal}
          onClose={() => setOpenTransferBondModal(false)}
          userBond={userBond}
          chainId={chainId}
        />
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='flex'>
            <img
              width='100%'
              height='auto'
              alt={userOwnedBondNftData?.image ? 'user bill' : 'loading bill'}
              src={`${
                userOwnedBondNftData?.image
                  ? `${userOwnedBondNftData?.image}?img-width=720`
                  : BillNFTImage
              }`}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box height='100%' className='flex flex-col justify-between'>
            <Box>
              <Box className='flex'>
                {bond?.billType !== 'reserve' && (
                  <Box className='bondTypeTag' mr='5px'>
                    {
                      dexDisplayAttributes[
                        bond?.lpToken.liquidityDex?.[chainId] ??
                          LiquidityDex.ApeSwapV2
                      ].tag
                    }
                  </Box>
                )}
                <Box className='bondTypeTag'>{billType}</Box>
              </Box>
              <Box className='flex items-center' mt='12px' gridGap={8}>
                <CurrencyLogo
                  currency={showCaseToken ?? undefined}
                  size='32px'
                />
                <h5>{bond.earnToken.symbol}</h5>
                <p className='weight-600'>#{userBond?.id}</p>
              </Box>
            </Box>
            <Box>
              {attributes
                ? attributes.map((attrib: any) => {
                    return (
                      <Box
                        key={attrib.value}
                        className='flex justify-between'
                        mb='8px'
                      >
                        <small className='text-gray32 weight-600'>
                          {attrib?.trait_type}
                        </small>
                        <small className='text-gray32 weight-600'>
                          {attrib?.value}
                        </small>
                      </Box>
                    );
                  })
                : BILL_ATTRIBUTES.map((attrib) => {
                    return (
                      <Box
                        key={attrib}
                        className='flex justify-between'
                        mb='8px'
                      >
                        <small className='text-gray32 weight-600'>
                          {t(attrib)}
                        </small>
                        <Skeleton width='150px' />
                      </Box>
                    );
                  })}
            </Box>
            <Box className='bondModalButtonsWrapper'>
              <Box width='49%'>
                <ClaimBond
                  billAddress={bond.contractAddress[chainId] ?? ''}
                  billIds={[billId ?? '0']}
                  pendingRewards={userBond?.payout ?? '0'}
                  mt={['0px']}
                  earnToken={bond.earnToken.symbol}
                />
              </Box>
              <Box width='49%'>
                <Button
                  disabled={!userBond}
                  onClick={() => setOpenTransferBondModal(true)}
                >
                  {t('Transfer')}
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Box className='userBondInfoWrapper' mt='32px'>
        <Box>
          <p>{t('Fully Vested')}</p>
          <VestedTimer
            lastBlockTimestamp={userBond?.lastBlockTimestamp ?? '0'}
            vesting={userBond?.vesting ?? '0'}
            userModalFlag
          />
        </Box>
        <Box>
          <p>{t('Claimable')}</p>
          <Box className='flex'>
            <BondTokenDisplay token1Obj={earnToken} size={25} />
            <Box ml='6px'>
              {claimable && claimable !== 'NaN' ? (
                <h5>{`${formatNumber(claimable)} ($${formatNumber(
                  claimableUsd,
                )})`}</h5>
              ) : (
                <Skeleton width='150px' height='32.5px' />
              )}
            </Box>
          </Box>
        </Box>
        <Box>
          <p>{t('Pending')}</p>
          <Box className='flex'>
            <BondTokenDisplay token1Obj={earnToken} size={25} />
            <Box ml='6px'>
              {pending && pending !== 'NaN' ? (
                <h5>{`${formatNumber(pending)} ($${formatNumber(
                  pendingUsd,
                )})`}</h5>
              ) : (
                <Skeleton width='150px' height='32.5px' />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default React.memo(UserBondModalView);
