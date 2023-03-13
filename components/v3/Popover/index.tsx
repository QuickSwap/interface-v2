import { Placement } from '@popperjs/core';
import React, { useCallback, useState } from 'react';
import { usePopper } from 'react-popper';

import Portal from '@reach/portal';
import { Arrow, PopoverContainer, ReferenceElement } from './styled';
import useInterval from 'hooks/useInterval';

export interface PopoverProps {
  content: React.ReactNode;
  show: boolean;
  children?: React.ReactNode;
  placement?: Placement;
  color?: string;
  borderRadius?: string;
}

export default function Popover({
  content,
  show,
  children,
  placement = 'auto',
  color,
  borderRadius,
}: PopoverProps) {
  const [
    referenceElement,
    setReferenceElement,
  ] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
  const { styles, update, attributes } = usePopper(
    referenceElement,
    popperElement,
    {
      placement,
      strategy: 'fixed',
      modifiers: [
        { name: 'offset', options: { offset: [8, 8] } },
        { name: 'arrow', options: { element: arrowElement } },
      ],
    },
  );
  const updateCallback = useCallback(() => {
    update && update();
  }, [update]);
  useInterval(updateCallback, show ? 100 : null);

  return (
    <>
      <ReferenceElement ref={setReferenceElement as any}>
        {children}
      </ReferenceElement>
      <Portal>
        <PopoverContainer
          show={show}
          color={color}
          borderRadius={borderRadius}
          ref={setPopperElement as any}
          style={styles.popper}
          {...attributes.popper}
        >
          {content}
          <Arrow
            color={color}
            className={`arrow-${attributes.popper?.['data-popper-placement'] ??
              ''}`}
            ref={setArrowElement as any}
            style={styles.arrow}
            {...attributes.arrow}
          />
        </PopoverContainer>
      </Portal>
    </>
  );
}
