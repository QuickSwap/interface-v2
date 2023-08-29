import React, { useCallback, useEffect, useRef } from 'react';
import { ScaleLinear, select, zoom, ZoomBehavior, ZoomTransform } from 'd3';
import { ZoomLevels } from './types';

export default function Zoom({
  svg,
  xScale,
  setZoom,
  width,
  height,
  zoomLevels,
}: {
  svg: SVGElement | null;
  xScale: ScaleLinear<number, number>;
  setZoom: (transform: ZoomTransform) => void;
  width: number;
  height: number;
  showClear: boolean;
  zoomLevels: ZoomLevels;
}) {
  const zoomBehavior = useRef<ZoomBehavior<Element, unknown>>();

  const initial = useCallback(
    () =>
      svg &&
      zoomBehavior.current &&
      select(svg as Element)
        .transition()
        .call(zoomBehavior.current.scaleTo, 0.5),
    [svg],
  );

  useEffect(() => {
    if (!svg) return;

    zoomBehavior.current = zoom()
      .scaleExtent([zoomLevels.min, zoomLevels.max])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', ({ transform }: { transform: ZoomTransform }) =>
        setZoom(transform),
      );

    select(svg as Element).call(zoomBehavior.current);
  }, [
    height,
    width,
    setZoom,
    svg,
    xScale,
    zoomBehavior,
    zoomLevels,
    zoomLevels.max,
    zoomLevels.min,
  ]);

  useEffect(() => {
    // reset zoom to initial on zoomLevel change
    initial();
  }, [initial, zoomLevels]);

  return <div></div>;
}
