import React, { useState } from 'react';
import { CopyHelper } from 'components';
import { Button, Box, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import './Layout.scss';
import {
  useAccount,
  useCollateral,
  usePrivateQuery,
} from '@orderly.network/hooks';
import { formatNumber, shortenAddress, shortenTx } from 'utils';
import { useOrderlyAPIKey } from 'hooks/useOrderlyData';
import { Edit } from '@material-ui/icons';
import OrderlyKeyRestrictIPModal from './OrderlyKeyRestrictIPModal';

const AccountManageModalAPI: React.FC = () => {
  const { account, state: accountState } = useAccount();
  const { availableBalance } = useCollateral();
  const { breakpoints } = useTheme();
  const isSM = useMediaQuery(breakpoints.down('sm'));

  const { data, isLoading } = usePrivateQuery('/v1/client/key_info');
  const orderlyKeys = (data ?? []) as any[];

  const { data: orderlyAPIKey } = useOrderlyAPIKey();

  const [selectedKey, setSelectedKey] = useState<string>();

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
        <Box className='perpsAPIKeyTableWrapper'>
          <table>
            <thead>
              <tr>
                <th>Orderly Key</th>
                <th>Orderly Secret</th>
                <th>Restricted IP</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orderlyKeys.length > 0 ? (
                orderlyKeys.map((item) => (
                  <tr key={item.orderly_key}>
                    <td>
                      <Box className='flex items-center' gridGap={4}>
                        <small>{shortenTx(item.orderly_key)}</small>
                        <CopyHelper toCopy={item.orderly_key} />
                      </Box>
                    </td>
                    <td>
                      {orderlyAPIKey?.key === item.orderly_key && (
                        <Box className='flex items-center' gridGap={4}>
                          <small>
                            {shortenTx(orderlyAPIKey?.secret ?? '')}
                          </small>
                          <CopyHelper toCopy={orderlyAPIKey?.secret ?? ''} />
                        </Box>
                      )}
                    </td>
                    <td>
                      <Box
                        className='flex items-center cursor-pointer'
                        gridGap={5}
                      >
                        <small>
                          {item.ip_restriction_list.length > 0
                            ? item.ip_restriction_list.join(', ')
                            : '~'}
                        </small>
                        <Box
                          className='flex items-center'
                          gridGap={4}
                          onClick={() => setSelectedKey(item.orderly_key)}
                        >
                          <Edit fontSize='small' className='text-primary' />
                          <small className='text-primary'>Edit</small>
                        </Box>
                      </Box>
                    </td>
                    <td>
                      <Box
                        className='flex items-center justify-end'
                        gridGap={8}
                      >
                        {/* <Button
                          disabled={orderlyAPIKey?.key === item.orderly_key}
                        >
                          Delete
                        </Button> */}
                        <Button
                          variant='outlined'
                          onClick={() => setSelectedKey(item.orderly_key)}
                        >
                          Restrict IP
                        </Button>
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
      {selectedKey && (
        <OrderlyKeyRestrictIPModal
          orderly_key={selectedKey}
          open={!!selectedKey}
          onClose={() => {
            setSelectedKey(undefined);
          }}
        />
      )}
    </>
  );
};
export default AccountManageModalAPI;
