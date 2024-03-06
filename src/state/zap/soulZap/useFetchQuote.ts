import { useState, useEffect, useContext } from 'react';
import { DEX } from '@soulsolidity/soulzap-v1';
import BigNumber from 'bignumber.js';
import { ZapDataBond, ZapData } from '@soulsolidity/soulzap-v1/dist/src/types';
import { useActiveWeb3React } from '~/hooks';
import { useSoulZap } from '~/state/application/hooks';

const useFetchQuote = (
  dex?: DEX,
  inputAddress?: string,
  inputDecimals?: number,
  amount?: string,
  contractAddress?: string,
  isBond?: boolean,
  slippage?: string,
): { loading: boolean; response: ZapDataBond | ZapData | null } => {
  // Hooks
  const { account } = useActiveWeb3React();
  const soulZap = useSoulZap();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [response, setResponse] = useState<ZapDataBond | ZapData | null>(null);

  // Max 3% price impact or it returns an error (for low liquidity or large zaps)
  const allowedPriceImpactPercentage = 3;

  const bigishAmount = new BigNumber(amount ?? '0')
    .times(new BigNumber(10).pow(inputDecimals ?? 18))
    .toString();

  useEffect(() => {
    const fetchZapData = async () => {
      try {
        if (
          dex &&
          inputDecimals &&
          bigishAmount !== 'NaN' &&
          bigishAmount !== '0' &&
          contractAddress &&
          inputAddress &&
          soulZap
        ) {
          setLoading(true);
          if (isBond) {
            console.log(
              `Fetching soulZap routes for Bond Contract: ${contractAddress}`,
            );
            soulZap.setSlippage(parseFloat(slippage ?? '0.5'));
            await soulZap
              .getZapDataBond(
                dex,
                inputAddress,
                bigishAmount,
                contractAddress,
                allowedPriceImpactPercentage,
                //TODO: Request SoulZap team to allow usage of empty string as account if user is disconnected
                account ?? contractAddress,
              )
              .then((res) => {
                if (res.success) {
                  console.log(res);
                  setResponse(res);
                } else {
                  console.log(res);
                }
              })
              .catch((e) => {
                console.log(e);
              });
          } else {
            console.log(
              `Fetching soulZap routes for LP Contract: ${contractAddress}`,
            );
            await soulZap
              .getZapData(
                dex,
                inputAddress,
                bigishAmount,
                contractAddress,
                allowedPriceImpactPercentage,
                //TODO: Request SoulZap team to allow usage of empty string as account if user is disconnected
                account ?? contractAddress,
              )
              .then((res) => {
                if (res.success) {
                  setResponse(res);
                }
              });
          }
        } else {
          setResponse(null);
        }
      } catch (error) {
        console.error('Error fetching SoulZap data:', error);
        setResponse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchZapData();
  }, [
    soulZap,
    dex,
    bigishAmount,
    contractAddress,
    allowedPriceImpactPercentage,
    account,
    inputAddress,
    inputDecimals,
    isBond,
    slippage,
  ]);

  return { loading, response };
};

export default useFetchQuote;
