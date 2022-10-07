import styled from 'styled-components/macro';
import { darken } from 'polished';
import { TYPE } from 'theme/index';

//index
export const BaseToggleElement = styled.span<{
  isActive?: boolean;
  isOnSwitch?: boolean;
}>`
  padding: 0.25rem 0.6rem;
  border-radius: 9px;
  background: ${({ theme, isActive, isOnSwitch }) =>
    isActive
      ? isOnSwitch
        ? theme.winterMainButton
        : theme.winterMainButton
      : 'none'};
  color: ${({ theme, isActive }) => (isActive ? theme.white : theme.text2)};
  font-size: 14px;
  font-weight: ${({ isOnSwitch }) => (isOnSwitch ? '500' : '400')};
  :hover {
    user-select: ${({ isOnSwitch }) => (isOnSwitch ? 'none' : 'initial')};
    background: ${({ theme, isActive, isOnSwitch }) =>
      isActive
        ? isOnSwitch
          ? darken(0.05, theme.winterMainButton)
          : darken(0.05, theme.winterMainButton)
        : 'none'};
    color: ${({ theme, isActive, isOnSwitch }) =>
      isActive ? (isOnSwitch ? theme.white : theme.white) : theme.text3};
  }
`;
export const StyledToggle = styled.button<{
  isActive?: boolean;
  activeElement?: boolean;
}>`
  border-radius: 12px;
  border: none;
  background: #2f567b;
  display: flex;
  width: fit-content;
  cursor: pointer;
  outline: none;
  padding: 2px;
`;

//ListToggle
export const Wrapper = styled.button<{
  isActive?: boolean;
  activeElement?: boolean;
}>`
  border-radius: 20px;
  border: none;
  background: ${({ theme }) => theme.bg1};
  display: flex;
  width: fit-content;
  cursor: pointer;
  outline: none;
  padding: 0.4rem 0.4rem;
  align-items: center;
`;
export const ListToggleElement = styled.span<{
  isActive?: boolean;
  bgColor?: string;
}>`
  border-radius: 50%;
  height: 24px;
  width: 24px;
  background-color: ${({ isActive, bgColor, theme }) =>
    isActive ? bgColor : theme.bg4};
  :hover {
    opacity: 0.8;
  }
`;
export const StatusText = styled(TYPE.main)<{ isActive?: boolean }>`
  margin: 0 10px;
  width: 24px;
  color: ${({ theme, isActive }) => (isActive ? theme.text1 : theme.text3)};
`;

//MultyToggle
export const ToggleWrapper = styled.button<{ width?: string }>`
  display: flex;
  align-items: center;
  width: ${({ width }) => width ?? '100%'};
  padding: 1px;
  background: #2f567b;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  outline: none;
`;
export const ToggleElement = styled.span<{
  isActive?: boolean;
  fontSize?: string;
}>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 0.5rem;
  border-radius: 6px;
  justify-content: center;
  height: 100%;
  background: ${({ theme, isActive }) =>
    isActive ? theme.winterMainButton : 'none'};
  color: white;
  font-size: ${({ fontSize }) => fontSize ?? '1rem'};
  font-weight: 500;
  white-space: nowrap;
  :hover {
    user-select: initial;
    color: ${({ theme, isActive }) => (isActive ? theme.text2 : theme.text3)};
  }
`;
