import React, { useCallback, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { Token as V2Token } from '@uniswap/sdk';
import { Token } from '@uniswap/sdk-core';
import { CustomModal, CurrencyLogo } from 'components';
import { ReportProblemOutlined } from '@material-ui/icons';
import { useActiveWeb3React } from 'hooks';
import { getEtherscanLink, shortenAddress } from 'utils';
import { Trans, useTranslation } from 'react-i18next';

function TokenWarningCard({ token }: { token?: Token | V2Token }) {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();

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
            <p>
              {shortenAddress(token.address)} ({t('viewonBlockExplorer')})
            </p>
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
  const { t } = useTranslation();
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
          <h5>{t('tokenImported')}</h5>
        </Box>
        <Box mb={3}>
          <p>
            <Trans
              i18nKey='tokenImportDesc1'
              components={{
                em: <em />,
              }}
            />
          </p>
          <br />
          <p>{t('tokenImportDesc2')}</p>
          <br />
          <p>
            <Trans
              i18nKey='tokenImportDesc3'
              components={{
                strong: <strong />,
              }}
            />
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
            {t('iunderstand')}
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
            {t('continue')}
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
}
