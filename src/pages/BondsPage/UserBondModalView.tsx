import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import VestedTimer from './VestedTimer';
import TransferBondModal from './TransferBondModal';
import ClaimBond from './ClaimBond';
import { LiquidityDex, dexDisplayAttributes } from '@ape.swap/apeswap-lists';
import { Bond } from 'types/bond';
import { useActiveWeb3React } from 'hooks';
import { Box, Button } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import BondTokenDisplay from './BondTokenDisplay';

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
    <Box>
      {openTransferBondModal && (
        <TransferBondModal
          open={openTransferBondModal}
          onClose={() => setOpenTransferBondModal(false)}
          bond={bond}
          billId={billId ?? ''}
          chainId={chainId}
        />
      )}
      {userOwnedBillNftData?.image ? (
        <Box className='flex'>
          <img
            width={720}
            height={405}
            alt={'user-bill'}
            src={`${userOwnedBillNftData?.image + '?img-width=720'}`}
          />
        </Box>
      ) : (
        <Box className='flex'>
          <img
            width={960}
            height={540}
            alt={'loading-bill'}
            src={'/images/bills/bill-nfts.gif'}
          />
        </Box>
      )}
      <Box>
        <Box className='flex'>
          {bond?.billType !== 'reserve' ? (
            <Box className='bondTypeTag'>
              {
                dexDisplayAttributes[
                  bond?.lpToken.liquidityDex?.[chainId] ??
                    LiquidityDex.ApeSwapV2
                ].tag
              }
            </Box>
          ) : (
            ''
          )}
          <Box className='bondTypeTag'>{billType}</Box>
        </Box>
        <Box className='flex items-center'>
          <BondTokenDisplay
            token1Obj={token}
            token2Obj={
              bond.billType === 'reserve' ? earnToken.symbol : quoteToken.symbol
            }
            token3Obj={earnToken.symbol}
            stakeLP={billType !== 'reserve'}
          />
          <p>{lpToken.symbol}</p>
          <p>#{userOwnedBill?.id}</p>
        </Box>
      </Box>
      <Box>
        {attributes
          ? attributes.map((attrib) => {
              return (
                <Box key={attrib.value}>
                  <p>{attrib?.trait_type}</p>
                  <p>{attrib?.value}</p>
                </Box>
              );
            })
          : BILL_ATTRIBUTES.map((attrib) => {
              return (
                <Box key={attrib}>
                  <p>{t(attrib)}</p>
                  <Skeleton width='150px' />
                </Box>
              );
            })}
      </Box>
      <Box>
        <Box>
          <ClaimBond
            billAddress={bond.contractAddress[chainId] ?? ''}
            billIds={[billId ?? '0']}
            pendingRewards={userOwnedBill?.payout ?? '0'}
            mt={['0px']}
            earnToken={bond.earnToken.symbol}
          />
        </Box>
        <Box>
          <Button onClick={() => setOpenTransferBondModal(true)}>
            {t('Transfer')}
          </Button>
        </Box>
      </Box>
      <Box className='flex'>
        <p>{t('Fully Vested')}</p>
        <VestedTimer
          lastBlockTimestamp={userOwnedBill?.lastBlockTimestamp ?? '0'}
          vesting={userOwnedBill?.vesting ?? '0'}
          userModalFlag
        />
      </Box>
      <Box className='flex'>
        <p>{t('Claimable')}</p>
        <Box className='flex'>
          <BondTokenDisplay token1Obj={earnToken} size={25} />
          <p>
            {claimable && claimable !== 'NaN' ? (
              `${claimable} ($${claimableUsd})`
            ) : (
              <Skeleton width='150px' height='32.5px' />
            )}
          </p>
        </Box>
      </Box>
      <Box className='flex'>
        <p>{t('Pending')}</p>
        <Box>
          <BondTokenDisplay token1Obj={earnToken} size={25} />
          <p>
            {pending && pending !== 'NaN' ? (
              `${pending} ($${pendingUsd})`
            ) : (
              <Skeleton width='150px' height='32.5px' />
            )}
          </p>
        </Box>
      </Box>
      <Box className='flex'>
        <p>{t('Claimable')}</p>
        <Box className='flex'>
          <BondTokenDisplay token1Obj={earnToken} size={20} />
          <p>
            {claimable && claimable !== 'NaN' ? (
              `${claimable} ($${claimableUsd})`
            ) : (
              <Skeleton width='150px' height='32.5px' />
            )}
          </p>
        </Box>
      </Box>
      <Box className='flex'>
        <p>{t('Pending')}</p>
        <Box className='flex'>
          <BondTokenDisplay token1Obj={earnToken} size={20} />
          <p>
            {pending && pending !== 'NaN' ? (
              `${pending} ($${pendingUsd})`
            ) : (
              <Skeleton width='150px' height='32.5px' />
            )}
          </p>
        </Box>
      </Box>
      <Box className='flex'>
        <p>{t('Fully Vested')}</p>
        <VestedTimer
          lastBlockTimestamp={userOwnedBill?.lastBlockTimestamp ?? '0'}
          vesting={userOwnedBill?.vesting ?? '0'}
          userModalFlag
        />
      </Box>
    </Box>
  );
};

export default React.memo(UserBondModalView);
