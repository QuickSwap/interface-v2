import React, { useState } from 'react';
import { CustomModal, ToggleSwitch } from 'components';
import { FC, useEffect } from 'react';
import { useActiveWeb3React } from 'hooks';
import '../styles/AccountModal.scss';
import { useAccount } from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';
import { Box, Button } from '@material-ui/core';
import { Check } from '@material-ui/icons';

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}
const AccountModal: React.FC<AccountModalProps> = ({ open, onClose }) => {
  const { account, state } = useAccount();
  const { account: quickSwapAccount, library, chainId } = useActiveWeb3React();
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (!library || !quickSwapAccount) return;
    account.setAddress(quickSwapAccount, {
      provider: library.provider,
      chain: {
        id: chainId,
      },
    });
  }, [library, account, quickSwapAccount, chainId]);

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='modalWrapperV3 accountModalWrapper'
    >
      <Box
        padding={2}
        gridGap={20}
        className='items-center justify-center flex flex-col'
      >
        <small>
          Sign two request to verify ownership of your wallet and enable
          trading. Signing is free.
        </small>
        <Box>
          <Box className='accountModalStepsWrapper'>
            <Box className='flex' gridGap={16}>
              <Box
                className={`accountModalStep ${
                  state.status === AccountStatusEnum.NotSignedIn
                    ? 'bg-primary'
                    : 'bg-success'
                }`}
              >
                {state.status === AccountStatusEnum.NotSignedIn ? (
                  <p className='text-white'>1</p>
                ) : (
                  <Check className='text-white' />
                )}
              </Box>
              <Box>
                <p>Sign in</p>
                <small className='text-secondary'>
                  Confirm you own this wallet
                </small>
              </Box>
            </Box>

            <Box className='flex' gridGap={16} mt={2}>
              <Box
                className={`accountModalStep ${
                  state.status > AccountStatusEnum.DisabledTrading ||
                  state.status === AccountStatusEnum.NotConnected
                    ? 'bg-success'
                    : state.status === AccountStatusEnum.NotSignedIn
                    ? 'bg-gray2'
                    : 'bg-primary'
                }`}
              >
                {state.status > AccountStatusEnum.DisabledTrading ||
                state.status === AccountStatusEnum.NotConnected ? (
                  <Check className='text-white' />
                ) : (
                  <p
                    className={
                      state.status === AccountStatusEnum.NotSignedIn
                        ? ''
                        : 'text-white'
                    }
                  >
                    2
                  </p>
                )}
              </Box>
              <Box>
                <p>Enable Trading</p>
                <small className='text-secondary'>
                  Enable ensures access to our API for lightning-fast trading.
                </small>
              </Box>
            </Box>
          </Box>
          <Box className='flex items-center justify-between' mt={1.5}>
            <span className='text-secondary'>Remember me</span>
            <ToggleSwitch
              toggled={rememberMe}
              onToggle={() => setRememberMe(!rememberMe)}
            />
          </Box>
        </Box>
        {state.status === AccountStatusEnum.NotSignedIn ? (
          <Button
            className='accountModalButton'
            onClick={() => {
              account.createAccount();
            }}
          >
            Sign in
          </Button>
        ) : state.status > AccountStatusEnum.DisabledTrading ||
          state.status === AccountStatusEnum.NotConnected ? null : (
          <Button
            className='accountModalButton'
            onClick={() => {
              account.createOrderlyKey(30);
            }}
          >
            Enable Trading
          </Button>
        )}
      </Box>
    </CustomModal>
  );
};
export default AccountModal;
