import { PriceFormats } from '../PriceFomatToggler';

export interface ChartEntry {
  activeLiquidity: number;
  price0: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ZoomLevels {
  initialMin: number;
  initialMax: number;
  min: number;
  max: number;
}

export interface LiquidityChartRangeInputProps {
  // to distringuish between multiple charts in the DOM
  id?: string;

  data: {
    series: ChartEntry[];
    current: number;
  };

  styles: {
    area: {
      // color of the ticks in range
      selection: string;
    };
  };

  dimensions: Dimensions;
  margins: Margins;

  interactive?: boolean;

  brushLabels: (d: 'w' | 'e', x: number) => string;
  brushDomain: [number, number] | undefined;
  onBrushDomainChange: (domain: any, mode: any) => void;

  zoomLevels: ZoomLevels;

  priceFormat: PriceFormats;
}
