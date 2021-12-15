import React, { useCallback, useEffect } from 'react';
import { Box } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { PopupContent } from 'state/application/actions';
import { useRemovePopup } from 'state/application/hooks';
import TransactionPopup from './TransactionPopup';

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
  const { palette } = useTheme();
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

  return (
    <Box
      padding={2.5}
      borderRadius={10}
      bgcolor={palette.background.paper}
      overflow='hidden'
      position='relative'
    >
      {popupContent}
    </Box>
  );
};

export default PopupItem;
