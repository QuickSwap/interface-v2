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

interface FarmCardProps {
  el: Deposit;
}

export default function FarmCard({ el }: FarmCardProps) {
  const [showMore, setShowMore] = useState(false);
  const { chainId } = useActiveWeb3React();

  const token0 = el.pool.token0;
  const token1 = el.pool.token1;

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
            {chainId && (
              <DoubleCurrencyLogo
                currency0={
                  new Token(
                    chainId,
                    token0.id,
                    Number(token0.decimals),
                    token0.symbol,
                  )
                }
                currency1={
                  new Token(
                    chainId,
                    token1.id,
                    Number(token1.decimals),
                    token1.symbol,
                  )
                }
                size={30}
              />
            )}

            <Box className='flex-col' ml={3}>
              <StyledLabel color='#696c80' fontSize='12px'>
                Pool
              </StyledLabel>

              <StyledLabel color='#ebecf2' fontSize='14px'>
                {`${token0.symbol} / ${token1.symbol}`}
              </StyledLabel>
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
