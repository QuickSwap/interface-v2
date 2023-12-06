import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Box, Button } from '@material-ui/core';
import {
  CurrencyInput,
  TransactionErrorContent,
  TransactionConfirmationModal,
  ConfirmationModalContent,
  DoubleCurrencyLogo,
} from 'components';
import {
  useNetworkSelectionModalToggle,
  useWalletModalToggle,
} from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import {
  currencyEquals,
  Token,
  ETHER,
  TokenAmount,
  ChainId,
} from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback';
import { Field } from 'state/mint/actions';
import { PairState } from 'data/Reserves';
import {
  useIsSupportedNetwork,
  formatTokenAmount,
} from 'utils';
import { ReactComponent as AddLiquidityIcon } from 'assets/images/AddLiquidityIcon.svg';

const LockLiquidity: React.FC = () => {
  const { t } = useTranslation();
  const isSupportedNetwork = useIsSupportedNetwork();
  const { account, chainId, library } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = Token.ETHER[chainIdToUse];

  const [showConfirm, setShowConfirm] = useState(false);
  const [txHash, setTxHash] = useState('');

  const { ethereum } = window as any;
  const toggleWalletModal = useWalletModalToggle();
  const toggleNetworkSelectionModal = useNetworkSelectionModalToggle();

  const connectWallet = () => {
    if (!isSupportedNetwork) {
      toggleNetworkSelectionModal();
    } else {
      toggleWalletModal();
    }
  };

  return (
    <Box>
      <Box className='swapButtonWrapper flex-wrap'>
        <Button
          fullWidth
          onClick={() => console.log('click')}
        >
          test
        </Button>
      </Box>
    </Box>
  );
};

export default LockLiquidity;
