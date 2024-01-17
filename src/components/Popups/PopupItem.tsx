import React, { useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import { PopupContent } from 'state/application/actions';
import { useRemovePopup } from 'state/application/hooks';
import TransactionPopup from './TransactionPopup';
import styles from 'styles/components/Popups.module.scss';

interface PopupItemProps {
  removeAfterMs: number | null;
  content: PopupContent;
  popKey: string;
}

const PopupItem: React.FC<PopupItemProps> = ({
  removeAfterMs,
  content,
  popKey,
}) => {
  const removePopup = useRemovePopup();
  const removeThisPopup = useCallback(() => removePopup(popKey), [
    popKey,
    removePopup,
  ]);
  useEffect(() => {
    if (removeAfterMs === null) return undefined;

    const timeout = setTimeout(() => {
      removeThisPopup();
    }, removeAfterMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [removeAfterMs, removeThisPopup]);

  let popupContent;
  if ('txn' in content) {
    const {
      txn: { hash, pending, success, summary },
    } = content;
    popupContent = (
      <TransactionPopup
        hash={hash}
        pending={pending}
        success={success}
        summary={summary}
      />
    );
  }

  return <Box className={styles.popupItem}>{popupContent}</Box>;
};

export default PopupItem;
