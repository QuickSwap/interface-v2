import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useENS from 'hooks/useENS';
import { useActiveWeb3React } from 'hooks';
import { getEtherscanLink } from 'utils';

const useStyles = makeStyles(({ palette }) => ({
  addressInput: {
    border: (props: any) =>
      `1px solid ${props.error ? palette.error.main : palette.primary.dark}`,
    borderRadius: 20,
    padding: '12px 24px',
    textAlign: 'left',
    '& input': {
      width: '100%',
      fontSize: 20,
      fontWeight: 'bold',
      color: (props: any) =>
        props.error ? palette.error.main : palette.text.primary,
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
      marginTop: 16,
    },
    '& a': {
      color: palette.text.primary,
      textDecoration: 'none',
    },
  },
}));

interface AddressInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
}

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
}) => {
  const { chainId } = useActiveWeb3React();
  const { address, loading, name } = useENS(value);
  const error = Boolean(value.length > 0 && !loading && !address);
  const classes = useStyles({ error });

  return (
    <Box className={classes.addressInput}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography>{label}</Typography>
        {address && chainId && (
          <a
            href={getEtherscanLink(chainId, name ?? address, 'address')}
            target='_blank'
            rel='noreferrer'
          >
            (View on Block Explorer)
          </a>
        )}
      </Box>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(evt) => {
          const input = evt.target.value;
          const withoutSpaces = input.replace(/\s+/g, '');
          onChange(withoutSpaces);
        }}
      />
    </Box>
  );
};

export default AddressInput;
