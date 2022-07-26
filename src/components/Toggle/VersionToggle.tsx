import React, { useCallback } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import 'pages/styles/pools.scss';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { StyledLabel } from 'components/AddLiquidity/CommonStyledElements';
import {
  ToggleContainer,
  ToggleInnerContainer,
} from '../../pages/PoolsPage/styled';
import { useHistory } from 'react-router-dom';

const VersionToggle: React.FC<{ baseUrl: string }> = ({
  baseUrl: baseUrlSegment,
}) => {
  const parsedQuery = useParsedQueryString();

  const history = useHistory();

  const poolVersion =
    parsedQuery && parsedQuery.version ? (parsedQuery.version as string) : 'v3';

  const { t } = useTranslation();

  const handleToggleAction = useCallback(() => {
    history.push(
      `/${baseUrlSegment}?version=${poolVersion === 'v3' ? 'v2' : 'v3'}`,
    );
  }, [poolVersion, history]);

  return (
    <Box className='flex row items-center cursor-pointer'>
      <Box style={{ marginLeft: 15 }} onClick={() => handleToggleAction()}>
        <ToggleContainer>
          <ToggleInnerContainer active={poolVersion === 'v2'}>
            <StyledLabel
              style={{
                paddingLeft: 10,
              }}
            >
              {t('V2')}
            </StyledLabel>
          </ToggleInnerContainer>

          <ToggleInnerContainer active={poolVersion === 'v3'}>
            <StyledLabel color='#c7cad9'>{t('V3')}</StyledLabel>
          </ToggleInnerContainer>
        </ToggleContainer>
      </Box>
    </Box>
  );
};

export default VersionToggle;
