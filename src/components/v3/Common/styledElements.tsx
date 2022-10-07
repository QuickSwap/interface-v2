import { Box, Button } from '@material-ui/core';
import styled from 'styled-components';

export const StyledLabel = styled.div<{ fontSize?: string; color?: string }>`
  font-family: Inter;
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '13px')};
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  color: ${({ color }) => (color ? color : '#b4b9cc')};
`;

export const StyledGreenTag = styled.div`
  padding: 2px 4px;
  border-radius: 4px;
  background-color: rgba(15, 198, 121, 0.3);
  //   padding: 2px;
`;

export const StyledBlueTag = styled.div`
  padding: 2px 4px;
  border-radius: 4px;
  border: solid 1px #448aff;
  background-color: rgba(68, 138, 255, 0.3);
`;

export const StyledNumber = styled.div<{ fontSize: string }>`
  font-family: Inter;
  font-size: ${({ fontSize }) => fontSize};
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  text-align: center;
  color: #c7cad9;
`;

export const StyledSelectableBox = styled(Box)<{ active?: boolean }>`
  border: ${({ active }) =>
    active ? 'solid 1px rgba(68, 138, 255, 0.6)' : 'solid 1px #272d3d'};
  background-color: #282d3d;
  border-radius: 6px;
  cursor: pointer;
`;

export const StyledFilledBox = styled(Box)<{
  active?: boolean;
  borderRadius?: string;
}>`
  border: ${({ active }) =>
    active ? 'solid 1px rgba(68, 138, 255, 0.6)' : 'solid 1px #272d3d'};
  background-color: #282d3d;
  border-radius: ${({ borderRadius }) => (borderRadius ? borderRadius : '6px')};
`;

export const LinkButton = styled.div<{ fontSize: string }>`
  font-family: Inter;
  font-size: ${({ fontSize }) => fontSize};
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.57;
  letter-spacing: normal;
  text-align: left;
  color: #448aff;
`;

export const StyledBox = styled(Box)`
  border-radius: 12px;
  border: solid 1.5px #272d3d;
`;

export const StyledDarkBox = styled(Box)`
  border-radius: 10px;
  background-color: #1b1e29;
`;

export const StyledButton = styled(Button)<{
  height?: string;
  width?: string;
  disabled?: boolean;
}>`
  height: ${({ height }) => (height ? height : '50px')};
  width: ${({ width }) => (width ? width : '100%')};
  border-radius: 16px;
  background-color: ${({ disabled }) => (disabled ? '#3e4252' : '#448aff')};
  font-family: Inter;
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 4.44;
  letter-spacing: normal;
  text-align: center;
  color: #ebecf2;
`;

export const StyledCircle = styled.div<{
  fontSize?: string;
  backgroundColor?: string;
  color?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-image: linear-gradient(143deg, #08f676, #093aa3 89%);
  font-family: Inter;
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '13px')};
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  color: ${({ color }) => (color ? color : '#b4b9cc')};
`;

export const StyledEmptyDotCircle = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: solid 2px #3e4252;
`;
