import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import QUICKIcon from 'assets/images/quickIcon.svg';
import { ReactComponent as QUICKV2Icon } from 'assets/images/QUICKV2.svg';
import { ArrowForward, ArrowDownward } from '@material-ui/icons';
import { NumericalInput } from 'components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  wrapper: {
    background: palette.background.default,
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    border: `1px solid ${palette.secondary.dark}`,
  },
  iconWrapper: {
    display: 'flex',
    marginRight: 6,
    '& svg, & img': {
      width: 24,
      height: 24,
    },
  },
  convertArrow: {
    display: 'flex',
    '& svg path': {
      fill: palette.text.secondary,
    },
  },
  conversionRate: {
    marginTop: 24,
    border: `1px solid ${palette.secondary.dark}`,
    padding: '8px 12px',
    borderRadius: 10,
    '& span': {
      fontSize: 13,
    },
  },
  currencyInput: {
    background: palette.secondary.dark,
    borderRadius: 10,
    margin: '8px 0',
    display: 'flex',
    alignItems: 'center',
    height: 63,
    padding: '0 16px',
    '& input': {
      flex: 1,
    },
    '& h6': {
      fontSize: 18,
    },
  },
  maxButton: {
    background: 'rgba(68, 138, 255, 0.24)',
    color: palette.primary.main,
    width: 34,
    height: 18,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  convertButton: {
    maxWidth: 224,
    height: 40,
    width: '100%',
    borderRadius: 20,
  },
}));

const ConvertQUICKPage: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [quickAmount, setQUICKAmount] = useState('');
  const [quickV2Amount, setQUICKV2Amount] = useState('');

  return (
    <Box width='100%' maxWidth={488} id='convertQUICKPage'>
      <Typography variant='h4'>Convert QUICK</Typography>
      <Box className={classes.wrapper}>
        <Box display='flex' alignItems='center' mb={3}>
          <Box className={classes.iconWrapper}>
            <img src={QUICKIcon} alt='QUICK' />
          </Box>
          <Typography variant='h6'>QUICK</Typography>
          <Box mx={1.5} className={classes.convertArrow}>
            <ArrowForward />
          </Box>
          <Box className={classes.iconWrapper}>
            <QUICKV2Icon />
          </Box>
          <Typography variant='h6'>QUICK-v2</Typography>
        </Box>
        <Typography variant='body2' color='textSecondary'>
          Convert your QUICK to QUICK-v2. Lorem ipsum dolor sit amet
          constracteur amit seiu. You have until 00 JUNE 2024 to convert.
        </Typography>
        <Box className={classes.conversionRate}>
          <Typography variant='caption'>
            Conversion Rate: 1 QUICK = 100 QUICK-v2
          </Typography>
        </Box>
        <Box mt={4} mb={2}>
          <Typography variant='body2' color='textSecondary'>
            Your balance: 10
          </Typography>
          <Box className={classes.currencyInput}>
            <NumericalInput
              placeholder='0.00'
              value={quickAmount}
              fontSize={18}
              onUserInput={(value) => {
                setQUICKAmount(value);
              }}
            />
            <Box mr={1} className={classes.maxButton}>
              {t('max')}
            </Box>
            <Typography variant='h6'>QUICK</Typography>
          </Box>
        </Box>
        <Box ml={2} className={classes.convertArrow}>
          <ArrowDownward />
        </Box>
        <Box mt={2} mb={4}>
          <Typography variant='body2' color='textSecondary'>
            You will receive:
          </Typography>
          <Box className={classes.currencyInput}>
            <NumericalInput
              placeholder='0.00'
              value={quickV2Amount}
              fontSize={18}
              onUserInput={(value) => {
                setQUICKV2Amount(value);
              }}
            />
            <Typography variant='h6'>QUICK-v2</Typography>
          </Box>
        </Box>
        <Box display='flex' justifyContent='center'>
          <Button className={classes.convertButton}>Convert</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ConvertQUICKPage;
