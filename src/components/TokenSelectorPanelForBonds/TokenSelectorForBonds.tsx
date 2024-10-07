import React, { useState } from 'react';
import TokenSelectorModalForBonds from './TokenSelectorModalForBonds';
import { useCurrency } from 'hooks/v3/Tokens';
import DropdownDisplay from './DropdownDisplay';
import { ChainId } from '@uniswap/sdk';
import { BondToken } from 'types/bond';
import { Box, CircularProgress } from '@material-ui/core';
import { ChevronDown } from 'react-feather';

const TokenSelectorForBonds: React.FC<{
  bondPrincipalToken?: BondToken;
  inputTokenAddress: string;
  setInputTokenAddress: (tokenAddress: string) => void;
  enableZap: boolean;
  chainId: ChainId;
}> = ({
  bondPrincipalToken,
  inputTokenAddress,
  setInputTokenAddress,
  enableZap,
  chainId,
}) => {
  const inputCurrency = useCurrency(inputTokenAddress);
  const [openCurrencyModal, setOpenCurrencyModal] = useState(false);

  return (
    <Box className='flex' minWidth='max-content'>
      {openCurrencyModal && (
        <TokenSelectorModalForBonds
          open={openCurrencyModal}
          onClose={() => setOpenCurrencyModal(false)}
          handleSetInputToken={setInputTokenAddress}
          bondPrincipalToken={bondPrincipalToken}
          chainId={chainId}
        />
      )}
      {inputCurrency ? (
        <Box
          className={`dualCurrencyDropdownWrapper${
            enableZap ? ' cursor-pointer' : ''
          }`}
          onClick={() => {
            if (enableZap) setOpenCurrencyModal(true);
          }}
        >
          <DropdownDisplay
            principalToken={bondPrincipalToken}
            inputCurrency={inputCurrency}
            chainId={chainId}
          />
          {enableZap && <ChevronDown />}
        </Box>
      ) : (
        <CircularProgress size={15} />
      )}
    </Box>
  );
};

export default React.memo(TokenSelectorForBonds);
