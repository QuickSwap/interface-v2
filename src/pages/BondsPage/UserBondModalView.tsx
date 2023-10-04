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
import BillNFTImage from 'assets/images/bonds/bill-nfts.gif';

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
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const {
    token,
    quoteToken,
    earnToken,
    lpToken,
    index,
    userOwnedBillsData,
    userOwnedBillsNftData,
    billType,
  } = bond;
  const userOwnedBill = userOwnedBillsData?.find(
    (b) => billId && parseInt(b.id) === parseInt(billId),
  );
  const userOwnedBillNftData = userOwnedBillsNftData?.find(
    (b) => billId && parseInt(b.tokenId) === parseInt(billId),
  );
  const pending = userOwnedBill?.payout ?? 0;
  const pendingUsd = (Number(pending) * (bond?.earnTokenPrice ?? 0))?.toFixed(
    2,
  );
  const claimable = userOwnedBill?.pendingRewards ?? 0;
  const attributes = userOwnedBillNftData?.attributes?.filter((attrib) =>
    BILL_ATTRIBUTES.includes(attrib.trait_type),
  );
  const claimableUsd = (
    Number(claimable) * (bond?.earnTokenPrice ?? 0)
  )?.toFixed(2);

  const [openTransferBondModal, setOpenTransferBondModal] = useState(false);

  return (
    <>
      {openTransferBondModal && (
        <TransferBondModal
          open={openTransferBondModal}
          onClose={() => setOpenTransferBondModal(false)}
          bond={bond}
          billId={billId ?? ''}
          chainId={chainId}
        />
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='flex'>
            <img
              width='100%'
              height='auto'
              alt={userOwnedBillNftData?.image ? 'user bill' : 'loading bill'}
              src={`${
                userOwnedBillNftData?.image
                  ? `${userOwnedBillNftData?.image}?img-width=720`
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
              <Box className='flex items-center' mt='12px'>
                <BondTokenDisplay
                  token1Obj={token}
                  token2Obj={
                    bond.billType === 'reserve' ? earnToken : quoteToken
                  }
                  token3Obj={earnToken}
                  stakeLP={billType !== 'reserve'}
                />
                <Box margin='0 8px 0 12px'>
                  <h5>{lpToken.symbol}</h5>
                </Box>
                <p className='weight-600'>#{userOwnedBill?.id}</p>
              </Box>
            </Box>
            <Box>
              {attributes
                ? attributes.map((attrib) => {
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
                  pendingRewards={userOwnedBill?.payout ?? '0'}
                  mt={['0px']}
                  earnToken={bond.earnToken.symbol}
                />
              </Box>
              <Box width='49%'>
                <Button onClick={() => setOpenTransferBondModal(true)}>
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
            lastBlockTimestamp={userOwnedBill?.lastBlockTimestamp ?? '0'}
            vesting={userOwnedBill?.vesting ?? '0'}
            userModalFlag
          />
        </Box>
        <Box>
          <p>{t('Claimable')}</p>
          <Box className='flex'>
            <BondTokenDisplay token1Obj={earnToken} size={25} />
            <Box ml='6px'>
              {claimable && claimable !== 'NaN' ? (
                <h5>{`${claimable} ($${claimableUsd})`}</h5>
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
                <h5>{`${pending} ($${pendingUsd})`}</h5>
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
