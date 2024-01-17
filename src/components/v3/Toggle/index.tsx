import React, { ReactNode } from 'react';
import styles from 'styles/components/v3/Toggle.module.scss';

interface ToggleProps {
  id?: string;
  isActive: boolean;
  toggle: () => void;
  checked?: ReactNode;
  unchecked?: ReactNode;
}

export default function Toggle({
  id,
  isActive,
  toggle,
  checked = 'On',
  unchecked = 'Off',
}: ToggleProps) {
  return (
    <div className={styles.toggleButton} id={id} onClick={toggle}>
      <div data-isactive={isActive}>
        <span>{checked}</span>
      </div>
      <div data-isactive={!isActive}>
        <span>{unchecked}</span>
      </div>
    </div>
  );
}
