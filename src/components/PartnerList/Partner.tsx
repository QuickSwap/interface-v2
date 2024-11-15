import { Box, Typography } from '@material-ui/core';
import React from 'react';

export interface PartnerProps {
  partner: {
    logo: string;
    avatar: string;
    name: string;
  };
}

const Partner: React.FC<PartnerProps> = ({ partner }) => {
  return (
    <Box className='partner_item'>
      <Box className='partner_item_avatar'>
        <img src={partner.avatar} alt='Partner Avatar' />
        <Typography>{partner.name}</Typography>
      </Box>

      <img
        src={partner.logo}
        alt='Partner Logo'
        className='partner_item_logo'
      />
    </Box>
  );
};
export default Partner;
