import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import VestedTimer from './VestedTimer';
import TransferBond from './TransferBond';
import { Bond } from 'types/bond';
import { ChainId } from '@uniswap/sdk';
import { CustomModal } from 'components';
import BondTokenDisplay from './BondTokenDisplay';
import { Box } from '@material-ui/core';

interface TransferBillModalProps {
  open: boolean;
  onClose?: () => void;
  bond: Bond;
  billId: string;
  chainId: ChainId;
}

const TransferBillModal: React.FC<TransferBillModalProps> = ({
  open,
  onClose,
  bond,
  billId,
  chainId,
}) => {
  const { t } = useTranslation();
  const [confirmSend, setConfirmSend] = useState(false);
  const [toAddress, setToAddress] = useState('');
  const { earnToken, lpToken, userOwnedBillsData } = bond;
  const billNftAddress = bond.billNnftAddress[chainId];
  const userOwnedBill = userOwnedBillsData?.find(
    (b) => parseInt(b.id) === parseInt(billId),
  );
  const pending = userOwnedBill?.payout ?? 0;

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box className='flex' mt='20px'>
        <p> {t('Transferring')}: </p>
      </Box>
      <Box>
        <p>
          {lpToken.symbol} #{userOwnedBill?.id}
        </p>
        <Box className='flex'>
          <Box>
            <p>{t('Vesting time')}</p>
            <VestedTimer
              lastBlockTimestamp={userOwnedBill?.lastBlockTimestamp ?? '0'}
              vesting={userOwnedBill?.vesting ?? '0'}
              transferModalFlag
            />
          </Box>
          <Box>
            <p>{t('Pending')}</p>
            <Box>
              <BondTokenDisplay token1Obj={earnToken} size={20} />
              <p>{pending}</p>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box>
        <p>{t('Receiving Address')}:</p>
        <input
          placeholder={t('Paste the address here')}
          value={toAddress}
          onChange={(e: any) => setToAddress(e.target.value)}
          style={{ width: '345px', border: 'none' }}
        />
      </Box>
      <Box>
        <p>
          <span>{t('WARNING')}</span>
          {t(
            'When transfering the NFT all pending rewards will also be transfered to the receiver address.',
          )}
        </p>
      </Box>
      <Box onClick={() => setConfirmSend((prev) => !prev)}>
        <input type='checkbox' checked={confirmSend} />
        <p>
          {t(
            'I understand the new wallet gains ownership of all unclaimed assets.',
          )}
        </p>
      </Box>
      <Box>
        <TransferBond
          billNftAddress={billNftAddress ?? ''}
          billId={billId}
          toAddress={toAddress}
          disabled={!confirmSend}
        />
      </Box>
    </CustomModal>
  );
};

export default React.memo(TransferBillModal);
