import React from 'react';
import { useAccount, useQuery } from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';
import { useActiveWeb3React, useGetSigner } from 'hooks';
import { useEffect } from 'react';
import { Box, Button } from '@material-ui/core';

export const PerpsPage = () => {
  const { account, state } = useAccount();
  const { data, error } = useQuery('/v1/public/info', {
    formatter: (data) => data,
  });
  const { account: quickSwapAccount, library, chainId } = useActiveWeb3React();

  useEffect(() => {
    if (!library || !quickSwapAccount) return;
    account.setAddress(quickSwapAccount, {
      provider: window.ethereum,
      chain: {
        id: chainId,
      },
    });
  }, [library, account]);
  return (
    <Box style={{ margin: '1.5rem' }}>
      <h2>Account</h2>

      <Box style={{ maxWidth: 240 }}>
        {state.accountId ? (
          <>
            <Box>
              <Box>
                <h6>Orderly Account ID:</h6>
                <p>{state.accountId}</p>
              </Box>
              <Box>
                <p>Address:</p>
                <p>{state.address}</p>
              </Box>
              <Box>
                <p>User ID:</p>
                <p>{state.userId}</p>
              </Box>
            </Box>
          </>
        ) : (
          <p>Not connected!</p>
        )}
      </Box>

      <Button
        disabled={state.status !== AccountStatusEnum.NotSignedIn}
        onClick={() => {
          account.createAccount();
        }}
        style={{ color: 'white' }}
      >
        Create Account
      </Button>

      <Button
        disabled={
          state.status > AccountStatusEnum.DisabledTrading ||
          state.status === AccountStatusEnum.NotConnected
        }
        onClick={() => {
          account.createOrderlyKey(30);
        }}
        style={{ color: 'white' }}
      >
        Create Orderly Key
      </Button>
    </Box>
  );
};

export default PerpsPage;
