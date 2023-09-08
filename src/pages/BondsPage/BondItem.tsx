import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import { JSBI, Token } from '@uniswap/sdk';
import { CurrencyLogo, DoubleCurrencyLogo, QuestionHelper } from 'components';
import { ReactComponent as BondArrow } from 'assets/images/bondArrow.svg';

interface BondItemProps {
  bond: any;
}

const BondItem: React.FC<BondItemProps> = ({ bond }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();

  const {
    earnToken,
    token,
    quoteToken,
    maxTotalPayOut,
    totalPayoutGiven,
    earnTokenPrice,
    discount,
  } = bond;

  const tokenMap = useSelectedTokenList();
  const token1Address =
    token && token.address ? token.address[chainId] : undefined;
  const token1 = useMemo(() => {
    if (!token1Address) return;
    const tokenFromAddress = getTokenFromAddress(
      token1Address,
      chainId,
      tokenMap,
      [],
    );
    if (tokenFromAddress) return tokenFromAddress;
    const tokenDecimals =
      token && token.decimals ? token.decimals[chainId] : undefined;
    if (tokenDecimals) {
      return new Token(chainId, token1Address, tokenDecimals, token?.symbol);
    }
    return;
  }, [chainId, token, token1Address, tokenMap]);
  const token2Obj = bond.billType === 'reserve' ? earnToken : quoteToken;
  const token2Address =
    token2Obj && token2Obj.address ? token2Obj.address[chainId] : undefined;
  const token2 = useMemo(() => {
    if (!token2Address) return;
    const tokenFromAddress = getTokenFromAddress(
      token2Address,
      chainId,
      tokenMap,
      [],
    );
    if (tokenFromAddress) return tokenFromAddress;
    const tokenDecimals =
      token2Obj && token2Obj.decimals ? token2Obj.decimals[chainId] : undefined;
    if (tokenDecimals) {
      return new Token(
        chainId,
        token2Address,
        tokenDecimals,
        token2Obj?.symbol,
      );
    }
    return;
  }, [chainId, token2Address, token2Obj, tokenMap]);
  const token3Address =
    earnToken && earnToken.address ? earnToken.address[chainId] : undefined;
  const token3 = useMemo(() => {
    if (!token3Address) return;
    const tokenFromAddress = getTokenFromAddress(
      token3Address,
      chainId,
      tokenMap,
      [],
    );
    if (tokenFromAddress) return tokenFromAddress;
    const tokenDecimals =
      earnToken && earnToken.decimals ? earnToken.decimals[chainId] : undefined;
    if (tokenDecimals) {
      return new Token(
        chainId,
        token3Address,
        tokenDecimals,
        earnToken?.symbol,
      );
    }
    return;
  }, [chainId, earnToken, token3Address, tokenMap]);
  const stakeLP = bond.billType !== 'reserve';

  const StakeLPEarnToken = () => (
    <Box className='flex items-center' width={350}>
      <Box className='flex items-center' mr={2}>
        <DoubleCurrencyLogo currency0={token1} currency1={token2} size={32} />
        <Box className='flex' mx={1}>
          <BondArrow />
        </Box>
        <CurrencyLogo currency={token3} size='32px' />
      </Box>
      <Box className='flex flex-col items-start'>
        <Box className='bondTypeTag'>{bond.billType}</Box>
        <h6>
          {token1?.symbol}/{token2?.symbol}
        </h6>
      </Box>
    </Box>
  );
  const StakeTokenEarnLP = () => (
    <Box className='flex items-center' width={350}>
      <Box className='flex items-center' mr={2}>
        <CurrencyLogo currency={token1} size='32px' />
        <Box className='flex' mx={1}>
          <BondArrow />
        </Box>
        <DoubleCurrencyLogo currency0={token2} currency1={token3} size={32} />
      </Box>
      <Box>
        <Box className='bondTypeTag'>{bond.billType}</Box>
        <h6>{token1?.symbol}</h6>
      </Box>
    </Box>
  );

  return (
    <Box mb={2} className='bondItemWrapper'>
      {stakeLP ? <StakeLPEarnToken /> : <StakeTokenEarnLP />}
      <Box>
        <Box className='flex items-center'>
          <small>{t('discount')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text={t('bondDiscountTooltip')} size={16} />
          </Box>
        </Box>
      </Box>
      <Box>
        <Box className='flex items-center'>
          <small>{t('vestingTerm')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text={t('bondVestingTermTooltip')} size={16} />
          </Box>
        </Box>
      </Box>
      <Box>
        <Box className='flex items-center'>
          <small>{t('availableTokens')}</small>
          <Box className='flex' ml='5px'>
            <QuestionHelper text='' size={16} />
          </Box>
        </Box>
      </Box>
      <Button>{t('buy')}</Button>
    </Box>
  );
};

export default BondItem;
