import styled from 'styled-components/macro';
import { transparentize } from 'polished';

export const PopoverContainer = styled.div<{
  show: boolean;
  color?: string;
  borderRadius?: string;
}>`
  z-index: 9999;
  visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: visibility 150ms linear, opacity 150ms linear;
  background: ${(props) => props.color ?? ' #282d3d'};
  border: 1px solid ${(props) => props.color ?? ' #282d3d'};
  box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.9, theme.shadow1)};
  color: ${({ theme }) => theme.text2};
  border-radius: ${(props) => props.borderRadius ?? '8px'};
`;
export const ReferenceElement = styled.div`
  display: inline-block;
`;
export const Arrow = styled.div<{ color?: string }>`
  width: 8px;
  height: 8px;
  z-index: 9998;

  ::before {
    position: absolute;
    width: 8px;
    height: 8px;
    z-index: 9998;

    content: '';
    border: 1px solid ${({ color }) => color ?? '#282d3d'};
    transform: rotate(45deg);
    background: ${({ color }) => color ?? '#282d3d'};
  }

  &.arrow-top {
    bottom: -5px;
    ::before {
      border-top: none;
      border-left: none;
    }
  }

  &.arrow-bottom {
    top: -5px;
    ::before {
      border-bottom: none;
      border-right: none;
    }
  }

  &.arrow-left {
    right: -5px;

    ::before {
      border-bottom: none;
      border-left: none;
    }
  }

  &.arrow-right {
    left: -5px;
    ::before {
      border-right: none;
      border-top: none;
    }
  }
`;
