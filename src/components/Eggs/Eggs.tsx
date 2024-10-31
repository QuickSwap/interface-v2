import React, { useState, useEffect } from 'react';
import { Box, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useTranslation, Trans } from 'react-i18next';

import 'components/styles/Eggs.scss';
interface EggTypeProp {
  type: number;
}
const Eggs: React.FC<EggTypeProp> = ({ type }) => {
  const { t, i18n } = useTranslation();
  const [dragonEggHatched, setDragonEggHatched] = useState(false);
  const [open, setOpen] = useState(false);

  const eggHatchedType = 'eggHatched' + type;
  const unHatchedType = 'eggUnHatched' + type;

  const changeDragonEggAnimation = () => {
    setDragonEggHatched(!dragonEggHatched);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Box>
      <Box
        sx={{
          width: '100%',
          minHeight: '140px',
          overflow: 'hidden',
          position: 'relative',
          marginTop: '20px',
        }}
        className={`eggArea${type} ${
          dragonEggHatched ? eggHatchedType : unHatchedType
        }`}
        onClick={changeDragonEggAnimation}
      ></Box>
      <Snackbar open={open} onClose={handleClose}>
        <Alert onClose={handleClose} severity='info'>
          <Trans
            i18nKey='dragonEggAlert'
            components={{
              alink: (
                <a
                  href='https://twitter.com/QuickswapDEX/'
                  target='_blank'
                  rel='noreferrer'
                  className='more-info'
                />
              ),
            }}
          />
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default Eggs;
