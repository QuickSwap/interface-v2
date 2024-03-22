import React from 'react';
import { CustomModal } from 'components';
import {
  Button,
  Flex,
  Grid,
  Heading,
  Table,
  TextField,
  Container,
  Box,
  Text,
} from '@radix-ui/themes';
import { FC, useEffect } from 'react';
import { useActiveWeb3React } from 'hooks';
import '../styles/AccountModal.scss';
import num1 from '../../assets/images/num1.svg';
import num2 from '../../assets/images/num2.svg';
import success from '../../assets/images/success.svg';
import { useAccount } from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';

interface NotifyModalProps {
  open: boolean;
  onClose: () => void;
}
const NotifyModal: React.FC<NotifyModalProps> = ({ open, onClose }) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='modalWrapperV3 assetModalWrapper'
    >
      <Flex
        style={{ margin: '1.5rem' }}
        gap='3'
        align='center'
        justify='center'
        direction='column'
      >
        <Box>
          This Transaction may take 10-20 minutes to show up in your Leverage
          Wallet
        </Box>
      </Flex>
    </CustomModal>
  );
};
export default NotifyModal;
