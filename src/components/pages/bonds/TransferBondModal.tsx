import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import VestedTimer from './VestedTimer';
import TransferBond from './TransferBond';
import { UserBond } from 'types/bond';
import { ChainId } from '@uniswap/sdk';
import { CustomModal } from 'components';
import BondTokenDisplay from './BondTokenDisplay';
import { Box, Grid } from '@mui/material';
import { Close, ReportProblemOutlined, Check } from '@mui/icons-material';
import { formatUnits } from 'ethers/lib/utils';
import { formatNumber } from 'utils';
import styles from 'styles/pages/Bonds.module.scss';

interface TransferBillModalProps {
  open: boolean;
  onClose?: () => void;
  userBond: UserBond;
  chainId: ChainId;
}

const TransferBillModal: React.FC<TransferBillModalProps> = ({
  open,
  onClose,
  userBond,
  chainId,
}) => {
  const { t } = useTranslation();
  const [confirmSend, setConfirmSend] = useState(false);
  const [toAddress, setToAddress] = useState('');
  const { token, earnToken, lpToken, quoteToken } = userBond.bond;
  const billNftAddress = userBond.bond.billNnftAddress[chainId];
  const pending = formatUnits(
    userBond?.payout ?? 0,
    userBond?.bond?.earnToken?.decimals?.[chainId] ?? 18,
  );

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box p='20px'>
        <Box className='flex justify-between border-bottom' pb='16px'>
          <h5>{t('tranferBond')}</h5>
          <Close />
        </Box>
        <Box className='flex' mt='20px'>
          <p>{t('transferring')}: </p>
        </Box>
        <Box className='flex items-center' margin='8px 0 24px'>
          <BondTokenDisplay
            token1Obj={token}
            token2Obj={
              userBond.bond.billType === 'reserve' ? earnToken : quoteToken
            }
            stakeLP={userBond.bond.billType !== 'reserve'}
          />
          <Box ml='12px'>
            <h5 className='text-gray32'>
              {lpToken.symbol} #{userBond?.id}
            </h5>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <p className='text-secondary'>{t('vestingTime')}</p>
            <VestedTimer
              lastBlockTimestamp={userBond?.lastBlockTimestamp ?? '0'}
              vesting={userBond?.vesting ?? '0'}
              transferModalFlag
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <p className='text-secondary'>{t('pending')}</p>
            <Box className='flex items-center'>
              <BondTokenDisplay token1Obj={earnToken} size={20} />
              <Box ml='5px'>
                <h5 className='text-gray32'>{formatNumber(pending)}</h5>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Box mt='24px' className={styles.bondTranferInput}>
          <p className='weight-600'>{t('receivingAddress')}:</p>
          <input
            placeholder={t('pasteAddressHere') ?? ''}
            value={toAddress}
            onChange={(e: any) => setToAddress(e.target.value)}
          />
        </Box>
        <Box className={styles.bondTransferWarning} mt='12px'>
          <Box>
            <ReportProblemOutlined />
          </Box>
          <p>{t('bondTransferWarning')}</p>
        </Box>
        <Box
          my='20px'
          className={styles.bondTransferConfirm}
          onClick={() => setConfirmSend((prev) => !prev)}
        >
          <Box className={confirmSend ? 'bg-primary' : 'bg-white'}>
            {confirmSend && <Check />}
          </Box>
          <small>{t('bondTransferUnderstand')}</small>
        </Box>
        <TransferBond
          billNftAddress={billNftAddress ?? ''}
          billId={userBond.id}
          toAddress={toAddress}
          disabled={!confirmSend}
        />
      </Box>
    </CustomModal>
  );
};

export default React.memo(TransferBillModal);
