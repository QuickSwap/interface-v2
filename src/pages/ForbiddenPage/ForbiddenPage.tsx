import { Box, Button, Typography } from '@material-ui/core';
import { ReactComponent as ImageBanned } from 'assets/images/banned.svg';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const goBack = () => {
    history.goBack();
  };

  return (
    <div
      id='landing-page'
      style={{
        width: '100%',
      }}
    >
      <Box
        display='flex'
        className='text-center'
        sx={{
          height: '100%',
          minHeight: 'calc(100vh - 232px)',
        }}
      >
        <Box marginTop={'auto'} marginBottom={'auto'} ml={'auto'} mr='auto'>
          <Box ml={'auto'} mr='auto'>
            <ImageBanned style={{ display: 'inline' }} />
          </Box>
          <Box my={2}>
            <Typography variant='h5'>{t('banned')}!</Typography>
          </Box>
          <Box
            marginLeft={'auto'}
            marginRight={'auto'}
            my={2}
            className='text-secondary text-center'
            sx={{
              width: { xs: '100%', md: '600px' },
            }}
          >
            {t('bannedDesc')}
          </Box>
          <Box>
            <Button onClick={goBack}>{t('goBack')}</Button>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default ForbiddenPage;
