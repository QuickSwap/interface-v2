import React from 'react';
import { darken } from 'polished';
import { useState } from 'react';
import { Box } from '@material-ui/core';
import styled, { keyframes } from 'styled-components/macro';

const turnOnToggle = keyframes`
  from {
    margin-left: 0em;
    margin-right: 2.2em;
  }
  to {
    margin-left: 2.2em;
    margin-right: 0em;
  }
`;

const turnOffToggle = keyframes`
  from {
    margin-left: 2.2em;
    margin-right: 0em;
  }
  to {
    margin-left: 0em;
    margin-right: 2.2em;
  }
`;

const ToggleElementHoverStyle = (
  hasBgColor: boolean,
  theme: any,
  isActive?: boolean,
) =>
  hasBgColor
    ? {
        opacity: '0.8',
      }
    : {
        background: isActive
          ? darken(0.05, theme.primary1)
          : darken(0.05, theme.bg4),
        color: isActive ? theme.white : theme.text3,
      };

const ToggleElement = styled.span<{
  isActive?: boolean;
  bgColor?: string;
  isInitialToggleLoad?: boolean;
}>`
  animation: 0.1s
    ${({ isActive, isInitialToggleLoad }) =>
      isInitialToggleLoad ? 'none' : isActive ? turnOnToggle : turnOffToggle}
    ease-in;
  background: ${({ theme, bgColor, isActive }) =>
    isActive ? bgColor ?? theme.primary1 : !!bgColor ? theme.bg4 : theme.text3};
  border-radius: 50%;
  height: 24px;
  :hover {
    ${({ bgColor, theme, isActive }) =>
      ToggleElementHoverStyle(!!bgColor, theme, isActive)}
  }
  margin-left: ${({ isActive }) => (isActive ? '2.2em' : '0em')};
  margin-right: ${({ isActive }) => (!isActive ? '2.2em' : '0em')};
  width: 24px;
`;

interface ToggleProps {
  id?: string;
  bgColor?: string;
  isActive: boolean;
  toggle: () => void;
}

export default function Toggle({ id, bgColor, isActive, toggle }: ToggleProps) {
  const [isInitialToggleLoad, setIsInitialToggleLoad] = useState(true);

  const switchToggle = () => {
    toggle();
    if (isInitialToggleLoad) setIsInitialToggleLoad(false);
  };

  return (
    <Box id={id} onClick={switchToggle}>
      <ToggleElement
        isActive={isActive}
        bgColor={bgColor}
        isInitialToggleLoad={isInitialToggleLoad}
      />
    </Box>
  );
}
