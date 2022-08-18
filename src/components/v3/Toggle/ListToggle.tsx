import React from 'react';
import { ListToggleElement, StatusText, Wrapper } from './styled';

interface ToggleProps {
  id?: string;
  isActive: boolean;
  bgColor: string;
  toggle: () => void;
}

export default function ListToggle({
  id,
  isActive,
  bgColor,
  toggle,
}: ToggleProps) {
  return (
    <Wrapper id={id} isActive={isActive} onClick={toggle}>
      {isActive && (
        <StatusText fontWeight='600' margin='0 6px' isActive={true}>
          ON
        </StatusText>
      )}
      <ListToggleElement isActive={isActive} bgColor={bgColor} />
      {!isActive && (
        <StatusText fontWeight='600' margin='0 6px' isActive={false}>
          OFF
        </StatusText>
      )}
    </Wrapper>
  );
}
