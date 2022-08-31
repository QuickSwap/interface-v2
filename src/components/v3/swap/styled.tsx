import React, { ReactNode } from 'react';
import { transparentize } from 'polished';
import { AlertTriangle } from 'react-feather';
import styled, { css } from 'styled-components/macro';
import { Text } from 'rebass';
import { AutoColumn } from '../Column';
import { ButtonPrimary } from '../Button';
import { TYPE } from 'theme/index';

export const Wrapper = styled.div`
  position: relative;
  padding: 16px 40px 30px 40px;
`;

export const ArrowWrapper = styled.button<{ clickable: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 12px;
  height: 42px;
  width: 35px;
  position: relative;
  margin-top: -32px;
  margin-bottom: -14px;
  left: calc(50% - 11px);
  // background-color: var(--primary-weak);
  opacity: 0.5;
  border: none;
  z-index: 2;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  margin-top: -15px;
  margin-bottom: 5px;
  `}

  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
`;

export const SectionBreak = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg3};
`;

export const ErrorText = styled(Text)<{ severity?: 0 | 1 | 2 | 3 | 4 }>`
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4
      ? theme.red1
      : severity === 2
      ? theme.yellow2
      : severity === 1
      ? theme.text1
      : theme.text2};
`;

export const TruncatedText = styled(Text)`
  text-overflow: ellipsis;
  max-width: 220px;
  overflow: hidden;
  text-align: right;
`;

// styles
export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }

  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`;

const SwapCallbackErrorInner = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  padding: 3rem 1.25rem 1rem 1rem;
  margin-top: -2rem;
  color: ${({ theme }) => theme.red1};
  z-index: -1;

  p {
    padding: 0;
    margin: 0;
    font-weight: 500;
  }
`;

const SwapCallbackErrorInnerAlertTriangle = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.red1)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`;

export function SwapCallbackError({ error }: { error: ReactNode }) {
  return (
    <SwapCallbackErrorInner>
      <SwapCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={24} />
      </SwapCallbackErrorInnerAlertTriangle>
      <p style={{ wordBreak: 'break-word' }}>{error}</p>
    </SwapCallbackErrorInner>
  );
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.95, theme.primary3)};
  color: ${({ theme }) => theme.primaryText1};
  padding: 0.5rem;
  border-radius: 12px;
  margin-top: 8px;
`;

//BetterTradeLink
export const ResponsiveButton = styled(ButtonPrimary)`
  width: fit-content;
  padding: 0.2rem 0.5rem;
  word-break: keep-all;
  height: 24px;
  margin-left: 0.75rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 4px;
    border-radius: 8px;
  `};
`;

//SwapHeader
export const StyledSwapHeader = styled.div`
  padding: 30px 40px 16px 40px;
  width: 100%;
  color: ${({ theme }) => theme.text2};
`;

//SwapModalHeader
export const SwapModalHeaderArrowWrapper = styled.div`
  padding: 4px;
  border-radius: 12px;
  height: 32px;
  width: 32px;
  position: relative;
  margin-top: -18px;
  margin-bottom: -18px;
  left: calc(50% - 16px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.bg1};
  border: 4px solid;
  border-color: ${({ theme }) => theme.bg0};
  z-index: 2;
`;

//TradePrice
export const StyledPriceContainer = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-size: 0.875rem;
  font-weight: 400;
  background-color: transparent;
  border: none;
  height: 24px;
  cursor: pointer;
`;

//UnsuportedCurrencyFoter
export const DetailsFooter = styled.div<{ show: boolean }>`
  padding-top: calc(16px + 2rem);
  padding-bottom: 20px;
  margin-top: -2rem;
  width: 100%;
  max-width: 400px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  color: ${({ theme }) => theme.text2};
  background-color: ${({ theme }) => theme.advancedBG};
  z-index: -1;

  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease-in-out;
  text-align: center;
`;
export const AddressText = styled(TYPE.blue)`
  font-size: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
`}
`;
