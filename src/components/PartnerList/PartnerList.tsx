import { Box, Typography } from '@material-ui/core';
import { PARTNERS } from 'constants/partners';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Partner from './Partner';

const PartnerList: React.FC = ({}) => {
  console.log('d', PARTNERS);
  const { t } = useTranslation();

  return (
    <Box className='partner_list'>
      <Typography className='partner_title' variant='h4'>
        {t('partners')}
      </Typography>
      <Box
        className='partner_list'
        sx={{
          display: 'flex',
        }}
      >
        {PARTNERS.map(
          (
            partner: {
              logo: string;
              avatar: string;
              name: string;
            },
            index,
          ) => {
            return (
              <Box key={index}>
                <Partner partner={partner}></Partner>
              </Box>
            );
          },
        )}
      </Box>
    </Box>
  );
};
export default PartnerList;
