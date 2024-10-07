import React, { useEffect, useMemo, useState } from 'react';
import { ChainId } from '@uniswap/sdk';
import { CustomModal } from 'components';
import '../styles/AccountModal.scss';
import { Box, Button } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { getConfig } from 'config/index';
import { useActiveWeb3React } from 'hooks';
import { useWS } from '@orderly.network/hooks';
import perpsIcon from 'assets/images/PerpsIcon.webp';
import { useBlockNumber } from 'state/application/hooks';

interface NotifyModalProps {
  open: boolean;
  onClose: () => void;
  tx: any;
}

export const NotifyModal: React.FC<NotifyModalProps> = ({
  open,
  onClose,
  tx,
}) => {
  const [duration, setDuration] = useState(0);
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const ws = useWS();
  const [walletData, setWalletData] = useState<any>(undefined);
  const currentBlock = useBlockNumber();

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setDuration(duration + 1);
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [duration]);

  const durationStr = useMemo(() => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration - minutes * 60;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }, [duration]);

  useEffect(() => {
    const unsubscribeWallet = ws.privateSubscribe(
      { id: 'wallet1', event: 'subscribe', topic: 'wallet' },
      {
        onMessage: (data: any) => {
          setWalletData(data);
        },
      },
    );

    return () => {
      unsubscribeWallet();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const txCompleted =
    tx &&
    tx.hash &&
    walletData &&
    walletData.trxId &&
    walletData.side === 'DEPOSIT' &&
    walletData.trxId.toLowerCase() === tx.hash.toLowerCase() &&
    walletData.transStatus === 'COMPLETED';

  useEffect(() => {
    if (txCompleted) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txCompleted]);

  const currentPercent = useMemo(() => {
    if (tx && tx.blockNumber && currentBlock) {
      return Math.min((currentBlock - Number(tx.blockNumber)) / 500, 1);
    }
    return 0;
  }, [currentBlock, tx]);

  const estimateTime = chainId === ChainId.ETHEREUM ? 4 : 20;

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='modalWrapperV3 assetModalWrapper'
    >
      <Box p={2}>
        <Box className='flex items-center justify-between'>
          <p>Transaction Submitted</p>
          <Close className='text-secondary cursor-pointer' onClick={onClose} />
        </Box>
        <Box my={5} className='flex flex-col justify-center items-center'>
          <p className='text-success'>{durationStr}</p>
          <Box my={3} className='perpsDepositProgress'>
            <Box className='perpsDepositIcon'>
              <img src={config['nativeCurrencyImage']} alt='Network Icon' />
            </Box>
            <Box className='perpsDepositProgressBar'>
              <Box width={`${currentPercent * 100}%`} />
            </Box>
            <Box className='perpsDepositIcon'>
              <img src={perpsIcon} alt='Perps Icon' />
            </Box>
          </Box>
          <Box maxWidth={296} width='100%' textAlign='center'>
            <small>
              Your assets are on the way and should arrive in {estimateTime}m.
              We will notify you once it’s done.
            </small>
          </Box>
        </Box>
        <Button
          className='perpsCancelButton'
          style={{ width: '100%' }}
          onClick={onClose}
        >
          Got it
        </Button>
      </Box>
    </CustomModal>
  );
};
