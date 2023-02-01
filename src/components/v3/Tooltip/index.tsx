import React, { ReactNode, useCallback, useState } from 'react';
import Popover, { PopoverProps } from '../Popover';
import 'components/styles/v3/tooltip.scss';
import { Box } from '@material-ui/core';

interface TooltipProps extends Omit<PopoverProps, 'content'> {
  text: ReactNode;
}

interface TooltipContentProps extends Omit<PopoverProps, 'content'> {
  content: ReactNode;
}

export default function Tooltip({ text, ...rest }: TooltipProps) {
  return (
    <Popover
      content={<Box className='tooltipContainer'>{text}</Box>}
      {...rest}
    />
  );
}

function TooltipContent({ content, ...rest }: TooltipContentProps) {
  return (
    <Popover
      content={<Box className='tooltipContainer'>{content}</Box>}
      {...rest}
    />
  );
}

export function MouseoverTooltip({
  children,
  ...rest
}: Omit<TooltipProps, 'show'>) {
  const [show, setShow] = useState(false);
  const open = useCallback(() => setShow(true), [setShow]);
  const close = useCallback(() => setShow(false), [setShow]);
  return (
    <Tooltip {...rest} show={show}>
      <div onMouseEnter={open} onMouseLeave={close}>
        {children}
      </div>
    </Tooltip>
  );
}

export function MouseoverTooltipContent({
  content,
  children,
  ...rest
}: Omit<TooltipContentProps, 'show'>) {
  const [show, setShow] = useState(false);
  const open = useCallback(() => setShow(true), [setShow]);
  const close = useCallback(() => setShow(false), [setShow]);
  return (
    <TooltipContent {...rest} show={show} content={content}>
      <div
        style={{ display: 'inline-block', lineHeight: 0, padding: '0.25rem' }}
        onMouseEnter={open}
        onMouseLeave={close}
      >
        {children}
      </div>
    </TooltipContent>
  );
}
