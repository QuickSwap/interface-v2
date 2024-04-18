import React from 'react';
import { CopyHelper } from 'components';
import { Button, Box, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import './Layout.scss';
import {
  useAccount,
  useAccountInstance,
  useCollateral,
  usePrivateQuery,
} from '@orderly.network/hooks';
import { formatNumber, shortenAddress, shortenTx } from 'utils';

const AccountManageModalAPI: React.FC = () => {
  const account = useAccountInstance();
  const { state: accountState } = useAccount();
  const { availableBalance } = useCollateral();
  const { breakpoints } = useTheme();
  const isSM = useMediaQuery(breakpoints.down('sm'));

  const { data, isLoading } = usePrivateQuery('/v1/client/key_info');
  const orderlyKeys = (data ?? []) as any[];

  console.log('aaa', orderlyKeys);

  return (
    <>
      <Box className='accountPanelWrapper'>
        <p className='weight-500'>Account</p>
        <Box
          className='border-top flex justify-between items-start'
          pt={2}
          mt={1.5}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <small className='text-secondary'>Wallet</small>
              <Box mt={1}>
                <small>{shortenAddress(account.address ?? '')}</small>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <p className='small text-secondary'>UID</p>
              <Box mt={1}>
                <small>{accountState.userId}</small>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <p className='small text-secondary'>Account ID</p>
              <Box className='flex items-center' gridGap={4} mt={1}>
                <small>{shortenTx(account.accountId ?? '')}</small>
                <CopyHelper toCopy={account.accountId ?? ''} />
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              className={isSM ? '' : 'text-right'}
            >
              <p className='small text-secondary'>USDC Balance</p>
              <Box mt={1}>
                <small>{formatNumber(availableBalance)}</small>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box className='accountPanelWrapper' mt={2}>
        <Box className='flex justify-between'>
          <p className='weight-500'>API Management</p>
          <a
            href='https://orderly.network/docs/build-on-evm/evm-api/introduction'
            target='_blank'
            rel='noreferrer'
            className='text-primaryText span text-underline'
          >
            API Documents
          </a>
        </Box>
        <Box
          className='border-top flex justify-between items-start'
          pt={2}
          mt={1.5}
        >
          <table width='100%'>
            <thead>
              <tr>
                <th align='left' className='small text-secondary weight-500'>
                  Orderly Key
                </th>
                <th align='left' className='small text-secondary weight-500'>
                  Orderly Secret
                </th>
                <th align='left' className='small text-secondary weight-500'>
                  Restricted IP
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orderlyKeys.length > 0 ? (
                orderlyKeys.map((item) => (
                  <tr key={item.orderly_key}>
                    <td>
                      <Box className='flex items-center' gridGap={4}>
                        {shortenTx(item.orderly_key)}
                        <CopyHelper toCopy={item.orderly_key} />
                      </Box>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                      <Box
                        className='flex items-center justify-end'
                        gridGap={8}
                      >
                        <Button>Delete</Button>
                        <Button>Restrict IP</Button>
                      </Box>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <Box className='text-center' py={4}>
                      {isLoading ? 'Loading' : 'No Results Found'}
                    </Box>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Box>
    </>
  );
};
export default AccountManageModalAPI;
