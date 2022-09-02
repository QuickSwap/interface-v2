import React from 'react';
import { Text } from 'rebass';
import styled, { keyframes } from 'styled-components/macro';
import Badge from 'components/v3/Badge';
import { TYPE } from 'theme/index';
import { AutoColumn } from 'components/v3/Column';
import { RowBetween, RowFixed } from 'components/v3/Row';
import { ButtonPrimary } from 'components/v3/Button';

const loadingAnimation = keyframes`
    0% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0 50%;
    }
`;
export const Wrapper = styled.div`
  position: relative;
  padding: 20px;
`;
export const ClickableText = styled(Text)`
  :hover {
    cursor: pointer;
  }

  color: ${({ theme }) => theme.primary1};
`;
export const MaxButton = styled.button<{ width?: string }>`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.primary5};
  border: 1px solid ${({ theme }) => theme.primary5};
  border-radius: 0.5rem;
  font-size: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.25rem 0.5rem;
  `};
  font-weight: 500;
  cursor: pointer;
  margin: 0.25rem;
  overflow: hidden;
  color: ${({ theme }) => theme.primary1};

  :hover {
    border: 1px solid ${({ theme }) => theme.primary1};
  }

  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    outline: none;
  }
`;
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
export const LoadingRows = styled.div`
  display: grid;
  min-width: 75%;
  max-width: 960px;
  grid-column-gap: 0.5em;
  grid-row-gap: 0.8em;
  grid-template-columns: repeat(3, 1fr);

  & > div {
    animation: ${loadingAnimation} 1.5s infinite;
    animation-fill-mode: both;

    background-size: 400%;
    border-radius: 12px;
    height: 2.4em;
    will-change: background-position;
  }

  & > div:nth-child(4n + 1) {
    grid-column: 1 / 3;
  }

  & > div:nth-child(4n) {
    grid-column: 3 / 4;
    margin-bottom: 2em;
  }
`;

//index
export const PageWrapper = styled(AutoColumn)`
  max-width: 870px;
  margin: 5rem auto;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 800px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 500px;
  `};
`;
export const TitleRow = styled(RowBetween)`
  color: ${({ theme }) => theme.text2};
  margin-top: 1rem;
  padding: 1rem 2rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    padding: 1rem;
  `};
`;
export const ButtonRow = styled(RowFixed)`
  & > *:not(:last-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: column;
    justify-content: space-between;
    flex-direction: column-reverse;

    & > *:not(:last-child) {
      margin-left: 0;
      margin-top: 1rem;
    }
  `};
`;
export const NoLiquidity = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  max-width: 300px;
  min-height: 25vh;
`;
export const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  border-radius: 12px;
  padding: 6px 8px;
  width: fit-content;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 1 1 auto;
    width: 100%;
    margin: 0;
  `};
`;
export const MigrateButtonPrimary = styled(ResponsiveButtonPrimary)`
  margin-right: 1rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
  `}
`;
export const MainContentWrapper = styled.main`
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  color: white;
  padding: 0 40px 30px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
        padding: 1rem;
    `}
`;
export const FilterPanelWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: start;
  gap: 2rem;
  text-align: start;
  padding-left: 2rem;
  margin-bottom: 0.5rem;

  label {
    margin-bottom: 0.5rem;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: center;
    padding-left: unset;
  `}
`;

//PositionPage
export const PositionPageWrapper = styled.div`
  min-width: 800px;
  max-width: 960px;
  background-color: ${({ theme }) => theme.winterBackground};
  border-radius: 20px;
  padding: 30px 40px;
  margin-top: 5rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 680px;
    max-width: 680px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width: 100%;
    max-width: 100%;
    margin-top: 1rem;
    padding: 30px 10px;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 340px;
    max-width: 340px;
  `};
`;
export const BadgeText = styled.div`
  font-weight: 500;
  font-size: 14px;
`;
export const Label = styled(({ ...props }) => <TYPE.label {...props} />)<{
  end?: boolean;
}>`
  display: flex;
  font-size: 16px;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  align-items: center;
`;
export const ExtentsText = styled.span`
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  text-align: center;
  margin-right: 4px;
  font-weight: 500;
`;
export const HoverText = styled(TYPE.main)`
  text-decoration: none;
  color: white;

  :hover {
    color: ${({ theme }) => theme.text1};
    text-decoration: none;
  }
`;
export const DoubleArrow = styled.span`
  color: ${({ theme }) => theme.text3};
  margin: 0 1rem;
`;
export const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 16px;
    width: 100%:
  `};
`;
export const PositionPageButtonPrimary = styled(ButtonPrimary)`
  border-radius: 12px;
  padding: 6px 8px;
  width: fit-content;
  margin-right: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 1 1 auto;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0;
     width: 49%;
  `};
`;
export const NFTGrid = styled.div`
  display: grid;
  grid-template: 'overlap';
  min-height: 400px;
`;
export const NFTCanvas = styled.canvas`
  grid-area: overlap;
`;
export const NFTImage = styled.img`
  grid-area: overlap;
  height: 400px;
  z-index: 1;
`;
export const RowFixedStyled = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
   width: 100%;
    flex-direction: column;

    & > * {
      margin-bottom: 1rem;
    }
  `}
`;
export const RowFixedStyledButtons = styled(RowFixedStyled)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    flex-direction: unset;
    gap: .5rem;
  `}
`;
export const FeeBadge = styled(Badge)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      margin-right: 0!important;
      margin-top: 1rem;
    `}
`;
export const PriceRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-direction: column;
    `}
`;
export const LoadingMock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.winterBackground};
  height: 400px;
  width: 500px;
  border-radius: 20px;
  margin-top: 5rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
        margin-top: 1rem;
  `}
`;

//FilterPanelItem
export const FilterPanelItemWrapper = styled.div`
  display: flex;
  flex-direction: column;

  label {
    ${({ theme }) => theme.mediaWidth.upToSmall`
           text-align: center;
        `}
  }
`;
