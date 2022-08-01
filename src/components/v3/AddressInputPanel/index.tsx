import { useActiveWeb3React } from 'hooks';
import useENS from 'hooks/useENS';
import React, { ReactNode, useCallback, useContext } from 'react';
import { ThemeContext } from 'styled-components/macro';
import { TYPE } from 'theme/index';
import { ExternalLink } from 'theme/components';
import { ExplorerDataType, getEtherscanLink } from 'utils';
import { AutoColumn } from '../Column';
import { RowBetween } from '../Row';
import { ContainerRow, Input, InputContainer, InputPanel } from './styled';

export default function AddressInputPanel({
  id,
  className = 'recipient-address-input',
  label,
  placeholder,
  value,
  onChange,
}: {
  id?: string;
  className?: string;
  label?: ReactNode;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { chainId } = useActiveWeb3React();
  const theme = useContext(ThemeContext);

  const { address, loading, name } = useENS(value);

  const handleInput = useCallback(
    (event: any) => {
      const input = event.target.value;
      const withoutSpaces = input.replace(/\s+/g, '');
      onChange(withoutSpaces);
    },
    [onChange],
  );

  const error = Boolean(value.length > 0 && !loading && !address);

  return (
    <InputPanel id={id}>
      <ContainerRow error={error}>
        <InputContainer>
          <AutoColumn gap='md'>
            <RowBetween>
              <TYPE.black color={theme.text2} fontWeight={500} fontSize={14}>
                {label ?? 'Recipient'}
              </TYPE.black>
              {address && chainId && (
                <ExternalLink
                  href={getEtherscanLink(
                    chainId,
                    name ?? address,
                    ExplorerDataType.ADDRESS,
                  )}
                  style={{ fontSize: '14px' }}
                >
                  {'(View on Explorer)'}
                </ExternalLink>
              )}
            </RowBetween>
            <Input
              className={className}
              type='text'
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
              spellCheck='false'
              placeholder={placeholder ?? `Wallet Address or ENS name`}
              error={error}
              pattern='^(0x[a-fA-F0-9]{40})$'
              onChange={handleInput}
              value={value}
            />
          </AutoColumn>
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  );
}
