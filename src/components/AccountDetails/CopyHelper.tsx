import React from 'react';
import { Box } from '@mui/material';
import useCopyClipboard from 'hooks/useCopyClipboard';
import { CheckCircle } from 'react-feather';
import { useTranslation } from 'next-i18next';
import { ContentCopy } from '@mui/icons-material';
import styles from 'styles/components/AccountDetails.module.scss';

interface CopyHelperProps {
  toCopy: string;
}

const CopyHelper: React.FC<CopyHelperProps> = ({ toCopy }) => {
  const [isCopied, setCopied] = useCopyClipboard();
  const { t } = useTranslation();

  return (
    <Box className={styles.copyIcon} onClick={() => setCopied(toCopy)}>
      {isCopied ? (
        <>
          <CheckCircle />
          <small>{t('copied')}</small>
        </>
      ) : (
        <ContentCopy />
      )}
    </Box>
  );
};

export default CopyHelper;
