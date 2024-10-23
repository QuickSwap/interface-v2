import React, { useState } from 'react';
import {
  dexDisplayAttributes,
  dexToZapMapping,
  LiquidityDex,
  ZapVersion,
} from '@ape.swap/apeswap-lists';
import SoulZapAddLiquidity from './SoulZapAddLiquidity';
import { useActiveWeb3React } from 'hooks';
import { Box, Button } from '@material-ui/core';
import { ReactComponent as ZapIcon } from 'assets/images/bonds/ZapIcon.svg';
import { useTranslation } from 'react-i18next';
import { Bond } from 'types/bond';
import SoulZapApiAddLiquidity from './SoulZapApiAddLiquidity';

const GetLpButton = ({ bond }: { bond: Bond }) => {
  // Hooks
  const { chainId, account } = useActiveWeb3React();
  const { t } = useTranslation();

  // Bond Data
  const billType = bond?.billType;
  const lpToken = bond?.lpToken;
  const bondContractAddress = bond?.contractAddress[chainId] || '';

  // checking wido supported contracts using their API
  const liquidityDex =
    lpToken?.liquidityDex?.[chainId] || LiquidityDex.ApeSwapV2;
  const dexToZapMappingAny = dexToZapMapping as any;
  const zapIntoLPVersion =
    liquidityDex && dexToZapMappingAny?.[liquidityDex]?.[chainId];

  const shouldSendToExternalLpUrl = zapIntoLPVersion === ZapVersion.External;

  const sendToExternalLpUrl = () => {
    if (lpToken?.getLpUrl?.[chainId]) {
      window.open(lpToken?.getLpUrl?.[chainId], '_blank');
    } else {
      throw new Error('External lp url not found. Please contact support');
    }
  };

  // Modals
  const [openSoulZapAddLiquidity, setOpenSoulZapAddLiquidity] = useState(false);
  const [openSoulZapAPIAddLiquidity, setOpenSoulZapAPIAddLiquidity] = useState(
    false,
  );
  const dexDisplayAttributesAny = dexDisplayAttributes as any;

  return (
    <>
      {openSoulZapAddLiquidity && (
        <SoulZapAddLiquidity
          open={openSoulZapAddLiquidity}
          onDismiss={() => setOpenSoulZapAddLiquidity(false)}
          lpToken={bond?.lpToken}
          liquidityDex={liquidityDex}
          lpPrice={bond?.lpPrice}
        />
      )}
      {openSoulZapAPIAddLiquidity && (
        <SoulZapApiAddLiquidity
          open={openSoulZapAPIAddLiquidity}
          onDismiss={() => setOpenSoulZapAPIAddLiquidity(false)}
          bond={bond}
          chainId={chainId}
        />
      )}
      {bond && billType !== 'reserve' && (
        <Button
          disabled={!account}
          onClick={() => {
            if (shouldSendToExternalLpUrl) {
              return sendToExternalLpUrl();
            }
            if (zapIntoLPVersion === ZapVersion.SoulZap) {
              return setOpenSoulZapAddLiquidity(true);
            }
            if (zapIntoLPVersion === ZapVersion.SoulZapApi) {
              return setOpenSoulZapAPIAddLiquidity(true);
            }
          }}
        >
          <Box className='flex items-center' gridGap={8}>
            <p>{t('Get LP')}</p>
            {bondContractAddress ===
            '0xdE766645C9b24e87165107714c88400FedA269A3' ? null : !shouldSendToExternalLpUrl ? (
              <ZapIcon />
            ) : (
              <img
                src={
                  dexDisplayAttributesAny[
                    lpToken?.liquidityDex?.[chainId] ?? LiquidityDex.ApeSwapV2
                  ].icon ?? ''
                }
                width={20}
              />
            )}
          </Box>
        </Button>
      )}
    </>
  );
};

export default React.memo(GetLpButton);
