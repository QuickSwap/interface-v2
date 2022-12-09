import { Box } from '@material-ui/core';
import { DoubleCurrencyLogo } from 'components';
import {
  StyledCircle,
  StyledFilledBox,
  StyledLabel,
} from 'components/v3/Common/styledElements';
import React, { useState } from 'react';
import { ReactComponent as ExpandIcon } from 'assets/images/expand_circle.svg';
import { ReactComponent as ExpandIconUp } from 'assets/images/expand_circle_up.svg';
import FarmCardDetail from './FarmCardDetail';
import { Deposit } from '../../models/interfaces';
import { IsActive } from './IsActive';
import { Token } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getAddress } from 'ethers/lib/utils';

interface FarmCardProps {
  el: Deposit;
}

export default function FarmCard({ el }: FarmCardProps) {
  const [showMore, setShowMore] = useState(false);
  const { chainId } = useActiveWeb3React();

  const tokenMap = useSelectedTokenList();
  const token0 =
    chainId && el.pool.token0
      ? getTokenFromAddress(el.pool.token0.id, chainId, tokenMap, [
          new Token(
            chainId,
            getAddress(el.pool.token0.id),
            Number(el.pool.token0.decimals),
          ),
        ])
      : undefined;
  const token1 =
    chainId && el.pool.token1
      ? getTokenFromAddress(el.pool.token1.id, chainId, tokenMap, [
          new Token(
            chainId,
            getAddress(el.pool.token1.id),
            Number(el.pool.token1.decimals),
          ),
        ])
      : undefined;

  return (
    <StyledFilledBox borderRadius='16px' mt={1.5} mb={1.5}>
      <Box
        className='flex justify-between items-center flex-wrap'
        py={2}
        borderRadius={10}
      >
        <Box className='flex flex-wrap justify-around' width='70%'>
          <Box className='flex items-center' my={1}>
            <Box mr={2}>
              <StyledCircle>{el.id}</StyledCircle>
            </Box>
            <Box className='flex-col' ml={0.5} mr={5}>
              <Box>
                <IsActive el={el} />
              </Box>

              <StyledLabel color='#ebecf2' fontSize='14px'>
                <a
                  style={{ textDecoration: 'underline' }}
                  className={'c-w fs-075'}
                  href={`/#/pool/${+el.id}`}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  View position
                </a>
              </StyledLabel>
            </Box>
          </Box>

          <Box className='flex items-center' my={1}>
            {token0 && token1 && (
              <DoubleCurrencyLogo
                currency0={token0}
                currency1={token1}
                size={30}
              />
            )}

            <Box className='flex-col' ml={3}>
              <StyledLabel color='#696c80' fontSize='12px'>
                Pool
              </StyledLabel>

              {token0 && token1 && (
                <StyledLabel color='#ebecf2' fontSize='14px'>
                  {`${token0.symbol} / ${token1.symbol}`}
                </StyledLabel>
              )}
            </Box>
          </Box>
        </Box>

        <Box className='flex items-center'>
          <Box
            mr={2.5}
            ml={1.5}
            onClick={() => setShowMore(!showMore)}
            className='cursor-pointer'
          >
            {showMore ? <ExpandIconUp /> : <ExpandIcon />}
          </Box>
        </Box>
      </Box>
      <Box>{showMore && <FarmCardDetail el={el} />}</Box>
    </StyledFilledBox>
  );
}
