import React from 'react';
import { Box, Grid } from '@material-ui/core';
import { CustomModal } from 'components';
import BillImage from 'assets/images/bonds/hidden-bill.jpg';
import BondTokenDisplay from './BondTokenDisplay';
import { useTranslation } from 'react-i18next';

interface BondModalProps {
  open: boolean;
  onClose: () => void;
  bond: any;
}

const BondModal: React.FC<BondModalProps> = ({ bond, open, onClose }) => {
  const token1Obj = bond.token;
  const token2Obj =
    bond.billType === 'reserve' ? bond.earnToken : bond.quoteToken;
  const token3Obj = bond.earnToken;
  const stakeLP = bond.billType !== 'reserve';
  const { t } = useTranslation();

  return (
    <CustomModal open={open} onClose={onClose} modalWrapper='bondModalWrapper'>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6}>
          <img src={BillImage} width='100%' />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='flex' mb={2}>
            <Box className='bondTypeTag'>{bond.billType}</Box>
          </Box>
          <Box className='flex items-center'>
            <BondTokenDisplay
              token1Obj={token1Obj}
              token2Obj={token2Obj}
              token3Obj={token3Obj}
              stakeLP={stakeLP}
            />
            <Box className='flex' mx='12px'>
              <h6 className='weight-600 text-gray32'>
                {token1Obj?.symbol}
                {stakeLP ? `/${token2Obj?.symbol}` : ''}
              </h6>
            </Box>
          </Box>
          <Box mt={2}>
            <small className='text-secondary'>
              {bond.earnToken?.symbol} {t('marketPrice')}
            </small>
            <BondTokenDisplay token1Obj={bond.earnToken} />
          </Box>
        </Grid>
      </Grid>
    </CustomModal>
  );
};

export default BondModal;
