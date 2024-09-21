import { Box } from '@material-ui/core';
import { TransactionType } from 'models/enums';
import React, { useMemo } from 'react';
import send from 'assets/images/icons/transactions/arrow-send.svg';
import received from 'assets/images/icons/transactions/arrow-received.svg';
import swap from 'assets/images/icons/transactions/swap-icon.svg';
import liquidity from 'assets/images/icons/transactions/icon-liquidity.svg';
import usdc from 'assets/images/icons/transactions/usdc.svg';
import star from 'assets/images/icons/transactions/icon-star.svg';
import DoubleCurrencyLogo from 'components/DoubleCurrencyLogo';
import { getTokenFromAddress } from 'utils';
import { Token } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getAddress } from 'ethers/lib/utils';
import CurrencyLogo from 'components/CurrencyLogo';

interface TransactionIconProps {
  type: TransactionType;
  tokens?: any[];
  approval?: any;
}

const TransactionIcon: React.FC<TransactionIconProps> = ({
  type,
  tokens,
  approval,
}) => {
  const { chainId } = useActiveWeb3React();
  const tokenMap: any = useSelectedTokenList();

  const renderIcon = useMemo(() => {
    switch (type) {
      case TransactionType.SEND:
        return <img src={send} alt='send' />;

      case TransactionType.APPROVED: {
        if (!approval?.tokenAddress) return <></>;

        return (
          <CurrencyLogo
            currency={getTokenFromAddress(
              approval?.tokenAddress,
              chainId,
              tokenMap,
              [],
            )}
          />
        );
      }
      case TransactionType.SWAPPED:
        return <img src={swap} alt='swap' />;
      case TransactionType.ADDED_LIQUIDITY: {
        if (
          !tokens ||
          tokens?.length === 0 ||
          tokens?.some(
            (item) => item.isNative === null || item.isNative == undefined,
          )
        )
          return <></>;

        return (
          <DoubleCurrencyLogo
            currency0={
              tokens?.[0]?.isNative
                ? Token.ETHER[chainId]
                : getTokenFromAddress(
                    tokens?.[0]?.tokenInfo?.address,
                    chainId,
                    tokenMap,
                    [
                      new Token(
                        chainId,
                        tokens?.[0]?.tokenInfo?.address,
                        tokens?.[0]?.tokenInfo?.decimals,
                      ),
                    ],
                  )
            }
            currency1={
              tokens?.[1]?.isNative
                ? Token.ETHER[chainId]
                : getTokenFromAddress(
                    tokens?.[1]?.tokenInfo?.address,
                    chainId,
                    tokenMap,
                    [
                      new Token(
                        chainId,
                        tokens?.[1]?.tokenInfo?.address,
                        tokens?.[1]?.tokenInfo?.decimals,
                      ),
                    ],
                  )
            }
          />
        );
      }
      case TransactionType.CLAIMED_REWARDS:
        return <img src={star} alt='claim' />;
      case TransactionType.RECEIVED:
        return <img src={received} alt='received' />;

      case TransactionType.SEND:
        return <img src={send} alt='send' />;
      default:
        return <img src={star} alt='transaction' />;
    }
  }, [type]);

  return (
    <Box
      sx={{
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#282d3d',
        borderRadius: '16px',
      }}
    >
      {renderIcon}
    </Box>
  );
};
export default TransactionIcon;
