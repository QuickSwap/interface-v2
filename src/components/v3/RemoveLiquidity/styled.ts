import React from 'react';
import { Text } from 'rebass';
import styled from 'styled-components/macro';
import { darken } from 'polished';
import { MaxButton } from '../CurrencyInputPanel/styled';

export const Wrapper = styled.div`
  position: relative;
  padding: 20px;
  min-width: 460px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 340px;
  `};
`;

export const SmallMaxButton = styled(MaxButton)`
  font-size: 12px;
  background: transparent;
  color: white;
  border: 1px solid ${({ theme }) => theme.winterMainButton};
  &:hover {
    border: 1px solid ${({ theme }) => darken(0.1, theme.winterMainButton)};
  }
  &:focus {
    border: 1px solid ${({ theme }) => darken(0.3, theme.winterMainButton)};
    outline: none;
  }
`;

export const ResponsiveHeaderText = styled(Text)`
  font-size: 40px;
  font-weight: 500;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
     font-size: 24px
  `};
`;
