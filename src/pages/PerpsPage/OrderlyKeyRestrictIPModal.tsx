import React, { useState } from 'react';
import { CustomModal } from 'components';
import { Box, Button } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import './Layout.scss';
import { shortenTx } from 'utils';
import { useMutation } from '@orderly.network/hooks';

interface OrderlyKeyRestrictIPModalProps {
  open: boolean;
  onClose: () => void;
  orderly_key: string;
}
const OrderlyKeyRestrictIPModal: React.FC<OrderlyKeyRestrictIPModalProps> = ({
  orderly_key,
  open,
  onClose,
}) => {
  const [restrictIP, { isMutating }] = useMutation(
    '/v1/client/set_orderly_key_ip_restriction',
    'POST',
  );
  const [ipRestriction, setIPRestriction] = useState('');
  return (
    <CustomModal open={open} onClose={onClose} modalWrapper='modalWrapperV3'>
      <Box padding={2}>
        <Box className='flex items-center justify-between' pb={2}>
          <h6>Restrict IP</h6>
          <Close className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box className='flex' gridGap={8}>
          <p className='text-secondary'>Orderly Key</p>
          <p>{shortenTx(orderly_key)}</p>
        </Box>
        <Box my={2}>
          <p>
            Once an IP restriction is set, orders with this trading key can only
            be placed through the restricted IPs
          </p>
        </Box>
        <Box>
          <p>Supported input format:</p>
          <Box pl={1}>
            <p>A single IP address such as 10.1.1.1</p>
            <p>A range of IP addresses such as 10.1.1.1-10.2.1.255</p>
            <p>Separate IP addresses and ranges by comma (without space)</p>
          </Box>
        </Box>
        <Box my={2} className='orderlyIPRestrictionInput'>
          <input
            placeholder='10.1.1.1,10.1.1.1-10.2.1.255'
            value={ipRestriction}
            onChange={(e) => setIPRestriction(e.target.value)}
          />
        </Box>
        <Box className='flex items-center' mt={2} gridGap={12}>
          <Button
            className='perpsConfirmButton'
            disabled={isMutating}
            onClick={() => {
              restrictIP({
                orderly_key,
                ip_restriction_list: ipRestriction,
              });
            }}
          >
            {isMutating ? 'Restricting IP...' : 'Confirm'}
          </Button>
          <Button className='perpsCancelButton' onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
};
export default OrderlyKeyRestrictIPModal;
