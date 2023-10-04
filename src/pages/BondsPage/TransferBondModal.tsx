import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import VestedTimer from './VestedTimer';
import TransferBond from './TransferBond';
import { Bond } from 'types/bond';
import { ChainId } from '@uniswap/sdk';
import { CustomModal } from 'components';
import BondTokenDisplay from './BondTokenDisplay';
import { Box, Grid } from '@material-ui/core';
import { Close, ReportProblemOutlined, Check } from '@material-ui/icons';

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
  const { token, earnToken, lpToken, quoteToken, userOwnedBillsData } = bond;
  const billNftAddress = bond.billNnftAddress[chainId];
  const userOwnedBill = userOwnedBillsData?.find(
    (b) => parseInt(b.id) === parseInt(billId),
  );
  const pending = userOwnedBill?.payout ?? 0;

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box p='20px'>
        <Box className='flex justify-between border-bottom' pb='16px'>
          <h5>{t('tranferBond')}</h5>
          <Close />
        </Box>
        <Box className='flex' mt='20px'>
          <p>{t('Transferring')}: </p>
        </Box>
        <Box className='flex items-center' margin='8px 0 24px'>
          <BondTokenDisplay
            token1Obj={token}
            token2Obj={bond.billType === 'reserve' ? earnToken : quoteToken}
            stakeLP={bond.billType !== 'reserve'}
          />
          <Box ml='12px'>
            <h5 className='text-gray32'>
              {lpToken.symbol} #{userOwnedBill?.id}
            </h5>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <p className='text-secondary'>{t('vestingTime')}</p>
            <VestedTimer
              lastBlockTimestamp={userOwnedBill?.lastBlockTimestamp ?? '0'}
              vesting={userOwnedBill?.vesting ?? '0'}
              transferModalFlag
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <p className='text-secondary'>{t('pending')}</p>
            <Box className='flex items-center'>
              <BondTokenDisplay token1Obj={earnToken} size={20} />
              <Box ml='5px'>
                <h5 className='text-gray32'>{pending}</h5>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Box mt='24px' className='bondTranferInput'>
          <p className='weight-600'>{t('receivingAddress')}:</p>
          <input
            placeholder={t('pasteAddressHere')}
            value={toAddress}
            onChange={(e: any) => setToAddress(e.target.value)}
          />
        </Box>
        <Box className='bondTransferWarning' mt='12px'>
          <Box>
            <ReportProblemOutlined />
          </Box>
          <p>{t('bondTransferWarning')}</p>
        </Box>
        <Box
          my='20px'
          className='bondTransferConfirm'
          onClick={() => setConfirmSend((prev) => !prev)}
        >
          <Box className={confirmSend ? 'bg-primary' : 'bg-white'}>
            {confirmSend && <Check />}
          </Box>
          <small>{t('bondTransferUnderstand')}</small>
        </Box>
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
