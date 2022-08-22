import React, { useCallback, useState } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import 'pages/styles/pools.scss';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { StyledLabel } from 'components/AddLiquidityV3/CommonStyledElements';
import {
  ToggleContainer,
  ToggleInnerContainer,
} from '../../pages/PoolsPage/styled';
import { useHistory } from 'react-router-dom';

const VersionToggle: React.FC<{
  isV3: boolean;
  onToggleV3: (isV3: boolean) => void;
}> = ({ onToggleV3: onToggleV3, isV3: isV3 }) => {
  const { t } = useTranslation();

  return (
    <Box className='flex row items-center cursor-pointer'>
      <Box style={{ marginLeft: 15 }} onClick={() => onToggleV3(!isV3)}>
        <ToggleContainer>
          <ToggleInnerContainer active={!isV3}>
            <StyledLabel
              style={{
                paddingLeft: 10,
              }}
            >
              {t('V2')}
            </StyledLabel>
          </ToggleInnerContainer>

          <ToggleInnerContainer active={isV3}>
            <StyledLabel color='#c7cad9'>{t('V3')}</StyledLabel>
          </ToggleInnerContainer>
        </ToggleContainer>
      </Box>
    </Box>
  );
};

export default VersionToggle;
