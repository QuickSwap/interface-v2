import React from 'react';
import { Box } from 'theme/components';
import {
  GelatoProvider,
  GelatoLimitOrderPanel,
  GelatoLimitOrdersHistoryPanel,
} from '@gelatonetwork/limit-orders-react';
import { Trans } from 'react-i18next';
import { useWalletModalToggle } from 'state/application/hooks';
import { useActiveWeb3React } from 'hooks';

const SwapLimitOrder: React.FC = () => {
  const { library, chainId, account } = useActiveWeb3React();
  const toggleWalletModal = useWalletModalToggle();
  return (
    <Box className='limitOrderPanel'>
      <GelatoProvider
        library={library}
        chainId={chainId}
        account={account ?? undefined}
        handler={'quickswap'}
        toggleWalletModal={toggleWalletModal}
        useDefaultTheme={false}
      >
        <GelatoLimitOrderPanel />
        <GelatoLimitOrdersHistoryPanel />
        <Box margin='16px 0 0' textAlign='center'>
          <small>
            <Trans
              i18nKey='limitOrderDisclaimer'
              components={{
                bold: <b />,
                alink: (
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    href='https://www.certik.org/projects/gelato'
                  />
                ),
              }}
            />
          </small>
        </Box>
      </GelatoProvider>
    </Box>
  );
};

export default SwapLimitOrder;
