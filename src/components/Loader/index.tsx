import React from 'react';
import { CircularProgress } from '@material-ui/core';

interface LoaderProps {
  size?: string;
  stroke?: string;
  [k: string]: any;
}

export default function Loader({ size = '16px', stroke }: LoaderProps) {
  return <CircularProgress size={size} style={{ color: stroke }} />;
}
