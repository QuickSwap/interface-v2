import React from 'react';
import { Box } from '@material-ui/core';
import useCopyClipboard from 'hooks/useCopyClipboard';
import { CheckCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CopyIcon } from 'assets/images/CopyIcon.svg';

interface CopyHelperProps {
  toCopy: string;
}

const CopyHelper: React.FC<CopyHelperProps> = ({ toCopy }) => {
  const [isCopied, setCopied] = useCopyClipboard();
  const { t } = useTranslation();

  return (
    <Box className='copyIcon' onClick={() => setCopied(toCopy)}>
      {isCopied ? (
        <>
          <CheckCircle size='18' />
          <small>{t('copied')}</small>
        </>
      ) : (
        <CopyIcon />
      )}
    </Box>
  );
};

export default CopyHelper;
