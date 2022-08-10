import React from 'react';
import { Box } from '@material-ui/core';
import useENS from 'hooks/useENS';
import { useActiveWeb3React } from 'hooks';
import { getEtherscanLink } from 'utils';
import 'components/styles/AddressInput.scss';
import { useTranslation } from 'react-i18next';

interface AdsTemplateProps {
  type: string;
}

const AdsTemplate: React.FC<AdsTemplateProps> = ({ type }) => {
  const { t } = useTranslation();

  return <Box className={`adsTemplate`}></Box>;
};

export default AdsTemplate;
