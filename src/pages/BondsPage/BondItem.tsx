import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@material-ui/core';
import { QuestionHelper } from 'components';
import BondModal from './BondModal';
import BondTokenDisplay from './BondTokenDisplay';

interface BondItemProps {
  bond: any;
}

const BondItem: React.FC<BondItemProps> = ({ bond }) => {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState(false);

  const token1Obj = bond.token;
  const token2Obj =
    bond.billType === 'reserve' ? bond.earnToken : bond.quoteToken;
  const token3Obj = bond.earnToken;
  const stakeLP = bond.billType !== 'reserve';

  return (
    <Box mb={2} className='bondItemWrapper'>
      <BondModal
        bond={bond}
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
      <Box className='flex items-center' width={350}>
        <BondTokenDisplay
          token1Obj={token1Obj}
          token2Obj={token2Obj}
          token3Obj={token3Obj}
          stakeLP={stakeLP}
        />
        <Box className='flex flex-col items-start' ml={2}>
          <Box className='bondTypeTag'>{bond.billType}</Box>
          <h6>
            {token1Obj?.symbol}
            {stakeLP ? `/${token2Obj?.symbol}` : ''}
          </h6>
        </Box>
      </Box>
      <Box>
        <Box className='flex items-center'>
          <small>{t('discount')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text={t('bondDiscountTooltip')} size={16} />
          </Box>
        </Box>
      </Box>
      <Box>
        <Box className='flex items-center'>
          <small>{t('vestingTerm')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text={t('bondVestingTermTooltip')} size={16} />
          </Box>
        </Box>
      </Box>
      <Box>
        <Box className='flex items-center'>
          <small>{t('availableTokens')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text='' size={16} />
          </Box>
        </Box>
      </Box>
      <Button onClick={() => setOpenModal(true)}>{t('buy')}</Button>
    </Box>
  );
};

export default BondItem;
