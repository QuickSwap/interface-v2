import React, { ReactNode } from 'react';

export enum sizes {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
}

export const fontSizes = {
  [sizes.SMALL]: 1,
  [sizes.MEDIUM]: 3,
  [sizes.LARGE]: 6,
};

export const dropdownPadding = {
  [sizes.SMALL]: { x: 2, y: 1 },
  [sizes.MEDIUM]: { x: 5, y: 4 },
  [sizes.LARGE]: { x: 10, y: 8 },
};

export const dropdownItemPadding = {
  [sizes.SMALL]: { x: 4, y: 1 },
  [sizes.MEDIUM]: { x: 9, y: 2 },
  [sizes.LARGE]: { x: 14, y: 4 },
};

type sizeProps = sizes;

export interface DropdownProps {
  component: React.ReactNode;
  size?: sizeProps;
  [key: string]: any;
}

export interface DropdownItemProps {
  onClick?: () => void;
  children?: ReactNode;
  url?: string;
  active?: boolean;
  size?: sizeProps;
  sx?: any;
}

export declare type Position = 'top' | 'top-right' | 'bottom';
export interface PositionProps {
  position?: Position;
}
