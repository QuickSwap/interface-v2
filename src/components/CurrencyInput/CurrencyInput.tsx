import React, { useState } from 'react';
import { Currency } from '@uniswap/sdk';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useCurrencyBalance } from 'state/wallet/hooks';
import cx from 'classnames';
import { CurrencySearchModal, CurrencyLogo } from 'components';
import { useActiveWeb3React } from 'hooks';
import useUSDCPrice from 'utils/useUSDCPrice';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  swapBox: {
    padding: '16px 24px',
    borderRadius: 10,
    zIndex: 1,
    position: 'relative',
    textAlign: 'left',
    '& > p': {
      fontSize: 14,
      marginBottom: 16,
    },
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      '& .inputWrapper': {
        flex: 1,
        position: 'relative',
        paddingLeft: 8,
      },
      '& .maxWrapper': {
        paddingLeft: 8,
        cursor: 'pointer',
        '& p': {
          color: palette.primary.main,
          fontWeight: 600,
        },
      },
      '& input': {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        outline: 'none',
        textAlign: 'right',
        color: palette.text.secondary,
        width: '100%',
        fontSize: 18,
        fontWeight: 600,
        '&::placeholder': {
          color: palette.text.secondary,
        },
      },
    },
    [breakpoints.down('xs')]: {
      padding: 12,
    },
  },
  priceShowBox: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  currencyButton: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: 38,
    '& p': {
      marginLeft: 4,
    },
  },
  noCurrency: {
    backgroundImage: `linear-gradient(105deg, ${palette.primary.main} 3%, #004ce6)`,
  },
  currencySelected: {
    backgroundColor: '#404557',
  },
  balanceSection: {
    '& p': {
      color: palette.text.secondary,
    },
  },
}));

interface CurrencyInputProps {
  title?: string;
  handleCurrencySelect: (currency: Currency) => void;
  currency: Currency | undefined;
  otherCurrency?: Currency | undefined;
  amount: string;
  setAmount: (value: string) => void;
  onMax?: () => void;
  onHalf?: () => void;
  showHalfButton?: boolean;
  showMaxButton?: boolean;
  showPrice?: boolean;
  bgColor?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  handleCurrencySelect,
  currency,
  otherCurrency,
  amount,
  setAmount,
  onMax,
  onHalf,
  showMaxButton,
  showHalfButton,
  title,
  showPrice,
  bgColor,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const { account } = useActiveWeb3React();
  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    currency ?? undefined,
  );
  const usdPrice = Number(useUSDCPrice(currency)?.toSignificant()) || 0;

  return (
    <Box
      className={cx(classes.swapBox, showPrice && classes.priceShowBox)}
      bgcolor={bgColor ?? palette.secondary.dark}
    >
      <Box display='flex' justifyContent='space-between' mb={2}>
        <Typography>{title || 'You Pay:'}</Typography>
        <Box display='flex'>
          {account && currency && showHalfButton && (
            <Box className='maxWrapper' onClick={onHalf}>
              <Typography variant='body2'>50%</Typography>
            </Box>
          )}
          {account && currency && showMaxButton && (
            <Box className='maxWrapper' marginLeft='20px' onClick={onMax}>
              <Typography variant='body2'>MAX</Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Box mb={2}>
        <Box
          className={cx(
            classes.currencyButton,
            currency ? classes.currencySelected : classes.noCurrency,
          )}
          onClick={() => {
            setModalOpen(true);
          }}
        >
          {currency ? (
            <>
              <CurrencyLogo currency={currency} size={'28px'} />
              <Typography variant='body1'>{currency?.symbol}</Typography>
            </>
          ) : (
            <Typography variant='body1'>Select a token</Typography>
          )}
        </Box>
        <Box className='inputWrapper'>
          <input
            value={amount}
            placeholder='0.00'
            onChange={(e) => setAmount(e.target.value)}
          />
        </Box>
      </Box>
      <Box
        display='flex'
        justifyContent='space-between'
        className={classes.balanceSection}
      >
        <Typography variant='body2'>
          Balance:{' '}
          {selectedCurrencyBalance
            ? selectedCurrencyBalance.toSignificant(6)
            : 0}
        </Typography>
        <Typography variant='body2'>
          ${(usdPrice * Number(amount)).toLocaleString()}
        </Typography>
      </Box>
      {modalOpen && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={() => {
            setModalOpen(false);
          }}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={currency}
          showCommonBases={true}
          otherSelectedCurrency={otherCurrency}
        />
      )}
    </Box>
  );
};

export default CurrencyInput;
