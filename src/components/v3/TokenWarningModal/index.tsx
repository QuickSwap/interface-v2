import React, { useCallback, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { Token as V2Token } from '@uniswap/sdk';
import { Token } from '@uniswap/sdk-core';
import { CustomModal, CurrencyLogo } from 'components';
import { ReportProblemOutlined } from '@material-ui/icons';
import { useActiveWeb3React } from 'hooks';
import { getEtherscanLink, shortenAddress } from 'utils';

function TokenWarningCard({ token }: { token?: Token | V2Token }) {
  const { chainId } = useActiveWeb3React();

  if (!token) return null;

  return (
    <Box mb={2} className='flex' key={token.address}>
      <Box mr={1} className='flex'>
        <CurrencyLogo currency={token} size={'32px'} />
      </Box>
      <Box>
        <p>
          {token && token.name && token.symbol && token.name !== token.symbol
            ? `${token.name} (${token.symbol})`
            : token.name || token.symbol}{' '}
        </p>
        {chainId && (
          <a
            className='text-primary'
            href={getEtherscanLink(chainId, token.address, 'token')}
            target='_blank'
            rel='noreferrer'
          >
            <p>{shortenAddress(token.address)} (View on Block Explorer)</p>
          </a>
        )}
      </Box>
    </Box>
  );
}

export default function TokenWarningModal({
  isOpen,
  tokens,
  onConfirm,
  onDismiss,
}: {
  isOpen: boolean;
  tokens: Token[] | V2Token[];
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const [understandChecked, setUnderstandChecked] = useState(false);
  const toggleUnderstand = useCallback(
    () => setUnderstandChecked((uc) => !uc),
    [],
  );

  return (
    <CustomModal open={isOpen} onClose={onDismiss}>
      <Box padding='24px 16px'>
        <Box mb={2} className='flex items-center justify-center'>
          <Box className='flex' mr={1}>
            <ReportProblemOutlined />
          </Box>
          <h5>Token imported</h5>
        </Box>
        <Box mb={3}>
          <p>
            Anyone can create an ERC20 token on Ethereum/Polygon with{' '}
            <em>any</em> name, including creating fake versions of existing
            tokens and tokens that claim to represent projects that do not have
            a token.
          </p>
          <br />
          <p>
            This interface can load arbitrary tokens by token addresses. Please
            take extra caution and do your research when interacting with
            arbitrary ERC20 tokens.
          </p>
          <br />
          <p>
            If you purchase an arbitrary token,{' '}
            <strong>you may be unable to sell it back.</strong>
          </p>
        </Box>

        {tokens.map((token) => {
          return <TokenWarningCard key={token.address} token={token} />;
        })}
        <Box className='flex justify-between items-center'>
          <p style={{ cursor: 'pointer', userSelect: 'none' }}>
            <input
              type='checkbox'
              className='understand-checkbox'
              checked={understandChecked}
              onChange={toggleUnderstand}
            />{' '}
            I understand
          </p>
          <Button
            disabled={!understandChecked}
            style={{
              borderRadius: '10px',
            }}
            onClick={() => {
              onConfirm();
            }}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
}
