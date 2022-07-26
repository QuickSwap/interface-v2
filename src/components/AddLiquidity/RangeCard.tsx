import React from 'react';
import 'components/styles/AddressInput.scss';
import { useTranslation } from 'react-i18next';
import { StyledSelectableBox, StyledLabel } from './CommonStyledElements';

interface RangeCardProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  key: number;
}

const RangeCard: React.FC<RangeCardProps> = ({
  label,
  selected,
  onSelect,
  key,
}) => {
  const { t } = useTranslation();

  return (
    <StyledSelectableBox
      key={key}
      display='flex'
      alignItems='center'
      justifyContent='center'
      active={selected}
      style={{
        height: 30,
        width: 98,
        marginTop: 2,
      }}
      onClick={onSelect}
    >
      <StyledLabel fontSize='12px'> {t(label)}</StyledLabel>
    </StyledSelectableBox>
  );
};

export default RangeCard;
