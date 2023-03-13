import styled from 'styled-components/macro';

//index
export const ChartWrapper = styled.div`
  position: relative;
  justify-content: center;
  align-content: center;
`;

//Area
export const Path = styled.path<{ fill: string | undefined }>`
  opacity: 1;
  stroke: ${({ fill }) => (fill ? '#2797FF' : '#13151c')};
  stroke-width: 2px;
  fill: ${({ fill }) =>
    fill ? 'url(#liquidity-chart-gradient)' : 'transparent'};
`;

//AxisBottom
export const StyledGroup = styled.g`
  line {
    display: none;
  }

  text {
    color: ${({ theme }) => theme.text2};
    transform: translateY(5px);
    font-family: Montserrat, sans-serif;
  }
`;

//Brush
export const LabelGroup = styled.g<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? '1' : '0')};
  transition: opacity 300ms;
`;
export const TooltipBackground = styled.rect`
  fill: ${({ theme }) => '#2797FF'};
`;
export const Tooltip = styled.text`
  text-anchor: middle;
  font-size: 9px;
  font-family: Montserrat, sans-serif;
  fill: ${({ theme }) => theme.text1};
`;

//Line
export const StyledLine = styled.line`
  opacity: 0.5;
  stroke-width: 1;
  stroke: #2797ff;
  stroke-dasharray: 3;
  fill: none;
`;

//Zoom
export const Wrapper = styled.div<{ count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ count }) => count.toString()}, 1fr);
  grid-gap: 6px;
  position: absolute;
  border-radius: 4px;
  top: 0;
  right: 0;
`;

export const ZoomOverlay = styled.rect`
  fill: transparent;
`;
