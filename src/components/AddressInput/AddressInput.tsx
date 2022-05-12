import React from 'react';
import { Box, Typography, useTheme } from '@material-ui/core';
import useENS from 'hooks/useENS';
import { useActiveWeb3React } from 'hooks';
import { getEtherscanLink } from 'utils';
import 'components/styles/AddressInput.scss';

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
  const { palette } = useTheme();
  const { chainId } = useActiveWeb3React();
  const { address, loading, name } = useENS(value);
  const error = Boolean(value.length > 0 && !loading && !address);

  return (
    <Box
      className='addressInput'
      border={`1px solid ${error ? palette.error.main : palette.primary.dark}`}
    >
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography>{label}</Typography>
        {address && chainId && (
          <a
            href={getEtherscanLink(chainId, name ?? address, 'address')}
            target='_blank'
            rel='noopener noreferrer'
          >
            (View on Block Explorer)
          </a>
        )}
      </Box>
      <input
        value={value}
        className={error ? 'text-error' : 'text-primary'}
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
