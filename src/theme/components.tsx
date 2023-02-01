import React, { HTMLProps } from 'react';
import {
  ArrowLeft,
  ExternalLink as LinkIconFeather,
  Trash,
  X,
} from 'react-feather';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components/macro';
import { anonymizeLink } from 'utils/v3/anonymizeLink';

export const ButtonText = styled.button`
  outline: none;
  border: none;
  font-size: inherit;
  padding: 0;
  margin: 0;
  background: none;
  cursor: pointer;

  :hover {
    opacity: 0.7;
  }

  :focus {
    text-decoration: underline;
  }
`;

export const CloseIcon = styled(X)<{ onClick: () => void }>`
  cursor: pointer;
`;

// for wrapper react feather icons
export const IconWrapper = styled.div<{
  stroke?: string;
  size?: string;
  marginRight?: string;
  marginLeft?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size ?? '20px'};
  height: ${({ size }) => size ?? '20px'};
  margin-right: ${({ marginRight }) => marginRight ?? 0};
  margin-left: ${({ marginLeft }) => marginLeft ?? 0};

  & > * {
    stroke: ${({ theme, stroke }) => stroke ?? theme.blue1};
  }
`;

// A button that triggers some onClick result, but looks like a link.
export const LinkStyledButton = styled.button<{ disabled?: boolean }>`
  border: none;
  text-decoration: none;
  background: none;

  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  color: ${({ theme, disabled }) =>
    disabled ? theme.text2 : theme.winterMainButton};
  font-weight: 500;

  :hover {
    text-decoration: ${({ disabled }) => (disabled ? null : 'underline')};
  }

  :focus {
    outline: none;
    text-decoration: ${({ disabled }) => (disabled ? null : 'underline')};
  }

  :active {
    text-decoration: none;
  }
`;

// An internal link from the react-router-dom library that is correctly styled
export const StyledInternalLink = styled(Link)`
    text-decoration: none;
    cursor: pointer;
        // color: ${({ theme }) => theme.winterMainButton};
    color: #f9ff47;
    font-weight: 500;

    :hover {
        text-decoration: underline;
    }

    :focus {
        outline: none;
        text-decoration: underline;
    }

    :active {
        text-decoration: none;
    }
`;

const LinkIconWrapper = styled.a`
  text-decoration: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  display: flex;

  :hover {
    text-decoration: none;
    opacity: 0.7;
  }

  :focus {
    outline: none;
    text-decoration: none;
  }

  :active {
    text-decoration: none;
  }
`;

const LinkIcon = styled(LinkIconFeather)`
  height: 16px;
  width: 18px;
  margin-left: 10px;
  stroke: ${({ theme }) => theme.blue1};
`;

export const TrashIcon = styled(Trash)`
  height: 16px;
  width: 18px;
  margin-left: 10px;
  stroke: ${({ theme }) => theme.text3};

  cursor: pointer;
  align-items: center;
  justify-content: center;
  display: flex;

  :hover {
    opacity: 0.7;
  }
`;

const rotateImg = keyframes`
    0% {
        transform: perspective(1000px) rotateY(0deg);
    }

    100% {
        transform: perspective(1000px) rotateY(360deg);
    }
`;

export const UniTokenAnimated = styled.img`
  animation: ${rotateImg} 5s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  padding: 2rem 0 0 0;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.15));
`;

function handleClickExternalLink(event: React.MouseEvent<HTMLAnchorElement>) {
  const { target, href } = event.currentTarget;

  const anonymizedHref = anonymizeLink(href);

  // don't prevent default, don't redirect if it's a new tab
  if (target === '_blank' || event.ctrlKey || event.metaKey) {
    // ReactGA.outboundLink({ label: anonymizedHref }, () => {
    //   window.location.href = anonymizedHref
    // })
  } else {
    event.preventDefault();
    // ReactGA.outboundLink({ label: anonymizedHref }, () => {
    //   window.location.href = anonymizedHref
    // })
  }
}

/**
 * Outbound link that handles firing google analytics events
 */
export function ExternalLink({
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & {
  href: string;
}) {
  return (
    <a
      className={'flex-s-between c-lg fs-085'}
      target={target}
      rel={rel}
      href={href}
      onClick={handleClickExternalLink}
      {...rest}
    />
  );
}

export function ExternalLinkIcon({
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & {
  href: string;
}) {
  return (
    <LinkIconWrapper
      target={target}
      rel={rel}
      href={href}
      onClick={handleClickExternalLink}
      {...rest}
    >
      <LinkIcon />
    </LinkIconWrapper>
  );
}

const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

const Spinner = styled.img`
  animation: 2s ${rotate} linear infinite;
  width: 16px;
  height: 16px;
`;

const BackArrowLink = styled(StyledInternalLink)`
  color: ${({ theme }) => theme.text1};
`;

export function BackArrow({ to }: { to: string }) {
  return (
    <BackArrowLink to={to}>
      <ArrowLeft />
    </BackArrowLink>
  );
}

export const CustomLightSpinner = styled(Spinner)<{ size: string }>`
  height: ${({ size }) => size};
  width: ${({ size }) => size};
`;

export const HideMedium = styled.span`
  display: block;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`;

export const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`;

export const HideExtraSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`;

export const MediumOnly = styled.span`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: block;
  `};
`;

export const SmallOnly = styled.span`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: block;
  `};
`;

export const ExtraSmallOnly = styled.span`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: block;
  `};
`;

export const Box = styled.div<{
  padding?: string;
  margin?: string;
  textAlign?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  flex?: number | string;
  overflow?: string;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  border?: string;
  minWidth?: string;
  maxWidth?: string;
  zIndex?: number;
  minHeight?: string;
  maxHeight?: string;
  justifyContent?: string;
}>`
  padding: ${({ padding }) => padding};
  margin: ${({ margin }) => margin};
  text-align: ${({ textAlign }) => textAlign};
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  border-radius: ${({ borderRadius }) => borderRadius};
  flex: ${({ flex }) => flex};
  overflow: ${({ overflow }) => overflow};
  position: ${({ position }) => position};
  top: ${({ top }) => top};
  left: ${({ left }) => left};
  right: ${({ right }) => right};
  bottom: ${({ bottom }) => bottom};
  border: ${({ border }) => border};
  min-width: ${({ minWidth }) => minWidth};
  max-width: ${({ maxWidth }) => maxWidth};
  min-height: ${({ minHeight }) => minHeight};
  max-height: ${({ maxHeight }) => maxHeight};
  z-index: ${({ zIndex }) => zIndex};
  justify-content: ${({ justifyContent }) => justifyContent};
`;

export const Button = styled.button<{
  width?: string;
  height?: string;
  borderRadius?: string;
  bgColor?: string;
  color?: string;
  padding?: string;
}>`
  width: ${({ width }) => width};
  height: ${({ height }) => height ?? '40px'};
  border-radius: ${({ borderRadius }) => borderRadius ?? '12px'};
  background-color: ${({ theme, bgColor }) => bgColor ?? theme.primary1};
  color: ${({ color }) => color ?? 'white'};
  padding: ${({ padding }) => padding ?? 0};
  border: none;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

export const Divider = styled.div`
  border: 1px solid ${({ theme }) => theme.divider};
`;

export const skeletonAnimation = keyframes`
  100% {
    transform: translateX(100%);
  }
`;
export const Skeleton = styled.div<{
  variant?: string;
  width?: string;
  height: string;
}>`
  position: relative;
  overflow: hidden;
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  border-radius: ${({ variant, width }) =>
    variant === 'circle' ? width : '5px'};
  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      #232734 0,
      #252833 25%,
      #2c3242 60%,
      #696c80
    );
    animation-name: ${skeletonAnimation};
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    content: '';
  }
`;

export const Grid = styled.div<{
  container?: boolean;
  justifyContent?: string;
  alignItems?: string;
  item?: boolean;
  spacing?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
}>`
  display: flex;
  justify-content: ${({ justifyContent }) => justifyContent};
  align-items: ${({ alignItems }) => alignItems};
  flex-wrap: ${({ container }) => (container ? 'wrap' : 'unset')};
  width: ${({ xs, sm, md, lg }) => {
    const width = lg
      ? (lg / 12) * 100 + '%'
      : md
      ? (md / 12) * 100 + '%'
      : sm
      ? (sm / 12) * 100 + '%'
      : xs
      ? (xs / 12) * 100 + '%'
      : '100%';
    return width;
  }};
  padding: ${({ item, spacing }) => (item && spacing ? spacing * 4 + 'px' : 0)};
  ${({ theme, md, sm, xs }) => theme.mediaWidth.upToLarge`
    width: ${
      md
        ? (md / 12) * 100 + '%'
        : sm
        ? (sm / 12) * 100 + '%'
        : xs
        ? (xs / 12) * 100 + '%'
        : '100%'
    };
  `};
  ${({ theme, sm, xs }) => theme.mediaWidth.upToMedium`
    width: ${sm ? (sm / 12) * 100 + '%' : xs ? (xs / 12) * 100 + '%' : '100%'};
  `};
  ${({ theme, xs }) => theme.mediaWidth.upToSmall`
    width: ${xs ? (xs / 12) * 100 + '%' : 'unset'};
  `};
`;

export const LinearProgress: React.FC<{ value: number }> = ({ value }) => {
  return (
    <div className='linearProgress'>
      <div
        className='linearProgressInner'
        style={{
          width: `${value}%`,
        }}
      />
    </div>
  );
};
