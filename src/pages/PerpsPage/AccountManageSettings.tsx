import React, { useEffect, useState } from 'react';
import { ToggleSwitch } from 'components';
import { Box } from '@material-ui/core';
import './Layout.scss';
import { usePrivateQuery, useMutation } from '@orderly.network/hooks';

const AccountManageModalSettings: React.FC = () => {
  const { data, isLoading } = usePrivateQuery('/v1/client/info');
  const [setConfig, { isMutating }] = useMutation(
    '/v1/client/maintenance_config',
    'POST',
  );
  const [toggled, setToggled] = useState(false);
  const maintenance_cancel_orders = !!(data as any)?.maintenance_cancel_orders;

  useEffect(() => {
    setToggled(maintenance_cancel_orders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <Box className='accountPanelWrapper'>
      <p className='weight-500'>System Upgrade</p>
      <Box
        className='border-top flex justify-between items-center'
        pt={2}
        mt={1.5}
        gridGap={8}
      >
        <Box flex={1}>
          <p>Cancel open orders during system upgrade</p>
          <p className='small'>
            During the upgrade period, all open orders will be cancelled to
            manage your risk in case of high market volatility.
          </p>
        </Box>
        <ToggleSwitch
          toggled={toggled}
          disabled={isLoading || isMutating}
          onToggle={async () => {
            setToggled(!toggled);
            await setConfig({
              maintenance_cancel_order_flag: !toggled,
            });
          }}
        />
      </Box>
    </Box>
  );
};
export default AccountManageModalSettings;
