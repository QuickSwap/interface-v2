import { Box } from '@material-ui/core';
import { TransactionType } from 'models/enums';
import React, { useMemo } from 'react';
import send from 'assets/images/icons/transactions/arrow-send.svg';
import received from 'assets/images/icons/transactions/arrow-received.svg';
import swap from 'assets/images/icons/transactions/swap-icon.svg';
import liquidity from 'assets/images/icons/transactions/icon-liquidity.svg';
import star from 'assets/images/icons/transactions/icon-star.svg';
import buyBond from 'assets/images/transactions/buy-bond.png';
import claimBond from 'assets/images/transactions/claim-bond.png';
import depositNft from 'assets/images/transactions/deposit-nft.png';
import removeLiquidity from 'assets/images/transactions/remove-liquidity.png';
import transferBond from 'assets/images/transactions/transfer-bond.png';
import undepositNft from 'assets/images/transactions/undeposit-nft.png';
import withdrawNft from 'assets/images/transactions/withdraw-nft.png';
import zapImg from 'assets/images/transactions/zap.png';
import wrap from 'assets/images/transactions/wrap.png';
import DoubleCurrencyLogo from 'components/DoubleCurrencyLogo';
import { getTokenFromAddress } from 'utils';
import { Token } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getAddress } from 'ethers/lib/utils';
import CurrencyLogo from 'components/CurrencyLogo';
import 'components/styles/DoubleCurrencyLogo.scss';

interface TransactionIconProps {
  type: TransactionType;
  tokens?: any[];
  approval?: any;
}

const TransactionIcon: React.FC<TransactionIconProps> = ({
  type = TransactionType.TRANSACTION,
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
        if (!approval?.tokenAddress) return <div>?</div>;

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

      case TransactionType.WRAP:
        if (!tokens || tokens?.length === 0) return <div>?</div>;
        return (
          <Box sx={{ position: 'relative' }}>
            <Box
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 42,
              }}
            >
              <img src={wrap} />
            </Box>
            <Box
              sx={{
                zIndex: 2,
                position: 'relative',
              }}
            >
              <CurrencyLogo
                currency={
                  tokens?.[0]?.isNative ||
                  tokens?.[0]?.symbol === Token.ETHER[chainId].symbol
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
                size={'16px'}
              />
            </Box>
          </Box>
        );
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
          return <div>?</div>;

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
      case TransactionType.REMOVE_LIQUIDITY: {
        if (
          !tokens ||
          tokens?.length === 0 ||
          tokens?.some(
            (item) => item.isNative === null || item.isNative == undefined,
          )
        )
          return <div>?</div>;

        return (
          <Box className='doubleCurrencyLogo'>
            <CurrencyLogo
              currency={
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
              size={'16px'}
            />
            <img
              src={removeLiquidity}
              style={{
                margin: '0 -3px',
                zIndex: 10,
              }}
            />
            <CurrencyLogo
              currency={
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
              size={'16px'}
            />
          </Box>
        );
      }
      case TransactionType.CLAIMED_REWARDS:
        return <img src={star} alt='claim' />;
      case TransactionType.RECEIVED:
      case TransactionType.WITHDRAW_LIQUIDITY:
        return <img src={received} alt='received' />;

      case TransactionType.SEND:
        return <img src={send} alt='send' />;

      case TransactionType.BUY_BOND:
        return <img src={buyBond} alt='buy bond' />;
      case TransactionType.CLAIM_BOND:
        return <img src={claimBond} alt='claim bond' />;
      case TransactionType.DEPOSIT_NFT:
        return <img src={depositNft} alt='deposit' />;
      case TransactionType.UNDEPOSIT_NFT:
        return <img src={undepositNft} alt='undeposit' />;
      case TransactionType.ZAP:
        return <img src={zapImg} alt='zap' />;
      case TransactionType.WITHDRAW_NFT:
        return <img src={withdrawNft} alt='withdrawNft' />;
      case TransactionType.TRANSFER_BOND:
        return <img src={transferBond} alt='transfer bond' />;
      case TransactionType.UNWRAP:
        if (!tokens || tokens?.length === 0) return <div>?</div>;
        return (
          <CurrencyLogo
            currency={
              tokens?.[0]?.isNative ||
              tokens?.[0]?.symbol === Token.ETHER[chainId].symbol
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
          />
        );
      default:
        return <div>?</div>;
    }
  }, [approval?.tokenAddress, chainId, tokenMap, tokens, type]);

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
